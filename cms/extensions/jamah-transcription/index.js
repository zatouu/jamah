// Interface Directus « Transcription synchronisée » : lecteur (YouTube ou fichier) à gauche,
// segments horodatés (transcription, traduction FR/AR, remarque) à droite.
// Écrite sans étape de build : Directus fournit `vue` et `@directus/extensions-sdk` aux extensions de l'application.
import { computed, defineComponent, h, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useApi } from '@directus/extensions-sdk'

const YT_ORIGIN = 'https://www.youtube-nocookie.com'
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const RATES = [0.5, 0.75, 1, 1.25]

const round = (t) => Math.round(Math.max(0, t) * 10) / 10

function formatTime(sec) {
  if (typeof sec !== 'number' || !Number.isFinite(sec)) return ''
  const t = round(sec)
  const hours = Math.floor(t / 3600)
  const minutes = Math.floor((t % 3600) / 60)
  const seconds = (t % 60).toFixed(1).padStart(4, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}

/** « 1:02:03.5 », « 12:30 », « 75 » -> secondes ; '' -> null ; saisie invalide -> undefined. */
function parseTime(input) {
  const v = String(input ?? '').trim().replace(',', '.')
  if (!v) return null
  const parts = v.split(':')
  if (parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p))) return undefined
  return round(parts.reduce((acc, p) => acc * 60 + Number(p), 0))
}

const blank = (start) => ({ start, end: null, original: '', fr: '', ar: '', note: '' })
const byStart = (a, b) => (a.start ?? 0) - (b.start ?? 0)

const css = `
.jt{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start}
@media (max-width:1100px){.jt{grid-template-columns:1fr}}
.jt-player{position:sticky;top:72px;display:grid;gap:8px}
.jt-frame{aspect-ratio:16/9;background:#000;border-radius:var(--theme--border-radius,6px);overflow:hidden}
.jt-frame iframe,.jt-frame video{width:100%;height:100%;border:0;display:block}
.jt-empty{display:grid;place-items:center;height:100%;padding:16px;color:#ddd;text-align:center}
.jt-controls,.jt-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.jt-btn,.jt-tin,.jt-sel,.jt-field textarea{border:var(--theme--border-width,2px) solid var(--theme--form--field--input--border-color,var(--theme--border-color,#d3dae4));border-radius:var(--theme--border-radius,6px);background:var(--theme--form--field--input--background,var(--theme--background,#fff));color:var(--theme--foreground,#172940);font:inherit}
.jt-btn{padding:4px 10px;cursor:pointer}
.jt-btn:hover:not(:disabled){border-color:var(--theme--primary,#6644ff)}
.jt-btn:disabled{opacity:.5;cursor:not-allowed}
.jt-primary{background:var(--theme--primary,#6644ff);border-color:var(--theme--primary,#6644ff);color:#fff}
.jt-sel{padding:4px 6px}
.jt-time{font-variant-numeric:tabular-nums;font-weight:600;min-width:7ch}
.jt-help{font-size:12px;color:var(--theme--foreground-subdued,#7c8ba1)}
.jt-list{display:grid;gap:12px}
.jt-seg{display:grid;gap:8px;padding:12px;border:var(--theme--border-width,2px) solid var(--theme--border-color,#d3dae4);border-radius:var(--theme--border-radius,6px)}
.jt-active{border-color:var(--theme--primary,#6644ff);background:var(--theme--primary-background,rgba(102,68,255,.06))}
.jt-num{font-weight:700;min-width:2.5ch}
.jt-spacer{flex:1}
.jt-tin{width:10ch;padding:4px 6px;font-variant-numeric:tabular-nums}
.jt-field{display:grid;gap:4px;font-size:13px;color:var(--theme--foreground-subdued,#7c8ba1)}
.jt-field textarea{width:100%;resize:vertical;padding:8px;font-size:15px;line-height:1.6}
.jt-field textarea[dir=rtl]{font-size:18px}
`

const TranscriptionInterface = defineComponent({
  props: {
    value: { type: Array, default: null },
    disabled: { type: Boolean, default: false },
  },
  emits: ['input'],
  setup(props, { emit }) {
    const api = useApi()
    const values = inject('values', ref({}))
    const segments = computed(() => (Array.isArray(props.value) ? props.value : []))

    const source = ref(null)
    const error = ref('')
    const root = ref(null)
    const iframe = ref(null)
    const media = ref(null)
    const playing = ref(false)
    const rate = ref(1)
    const display = ref(0)
    const showArabic = ref(segments.value.some((s) => s?.ar))
    let reported = 0
    let reportedAt = 0
    let stopAt = null
    let listenTimer = null
    let tick = null

    const assetRoot = location.pathname.replace(/\/admin(\/.*)?$/, '')
    const videoId = computed(() => {
      const v = values.value?.video
      return v && typeof v === 'object' ? v.id : v
    })

    watch(videoId, async (id) => {
      source.value = null
      error.value = ''
      if (!id) return
      try {
        const res = await api.get(`/items/videos/${encodeURIComponent(id)}`, { params: { fields: 'youtube_id,media_file' } })
        const item = res.data?.data
        const file = item?.media_file && typeof item.media_file === 'object' ? item.media_file.id : item?.media_file
        if (YOUTUBE_ID.test(item?.youtube_id ?? '')) source.value = { kind: 'youtube', id: item.youtube_id }
        else if (file) source.value = { kind: 'file', id: file }
        else error.value = 'Cette vidéo n’a ni identifiant YouTube ni fichier joint.'
      } catch {
        error.value = 'Vidéo introuvable ou non autorisée.'
      }
    }, { immediate: true })

    /* ---------- Lecteur ---------- */

    const isFile = () => source.value?.kind === 'file'

    function post(message) {
      iframe.value?.contentWindow?.postMessage(JSON.stringify({ ...message, id: 1, channel: 'widget' }), YT_ORIGIN)
    }

    function onMessage(event) {
      if (event.origin !== YT_ORIGIN || event.source !== iframe.value?.contentWindow) return
      let data
      try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data } catch { return }
      if (!data || typeof data !== 'object') return
      if (listenTimer) { clearInterval(listenTimer); listenTimer = null }
      const info = data.info
      if (info && typeof info === 'object') {
        if (typeof info.currentTime === 'number') { reported = info.currentTime; reportedAt = performance.now() }
        if (typeof info.playerState === 'number') playing.value = info.playerState === 1
        if (typeof info.playbackRate === 'number') rate.value = info.playbackRate
      }
    }

    function onIframeLoad() {
      let tries = 0
      clearInterval(listenTimer)
      post({ event: 'listening' })
      listenTimer = setInterval(() => {
        if (++tries > 20) { clearInterval(listenTimer); listenTimer = null; return }
        post({ event: 'listening' })
      }, 500)
    }

    function now() {
      if (isFile()) return media.value?.currentTime ?? 0
      return reported + (playing.value ? ((performance.now() - reportedAt) / 1000) * rate.value : 0)
    }

    function seek(t) {
      const target = Math.max(0, t)
      if (isFile()) { if (media.value) media.value.currentTime = target; return }
      post({ event: 'command', func: 'seekTo', args: [target, true] })
      reported = target
      reportedAt = performance.now()
    }

    function play(on) {
      if (isFile()) { const m = media.value; if (m) on ? m.play() : m.pause(); return }
      post({ event: 'command', func: on ? 'playVideo' : 'pauseVideo', args: [] })
    }

    function setRate(r) {
      rate.value = r
      if (isFile()) { if (media.value) media.value.playbackRate = r } else post({ event: 'command', func: 'setPlaybackRate', args: [r] })
    }

    function playSegment(s) {
      stopAt = typeof s.end === 'number' ? s.end : null
      seek(s.start ?? 0)
      play(true)
    }

    /* ---------- Segments ---------- */

    function commit(list) {
      emit('input', list)
    }

    function update(i, patch, sort = false) {
      const list = segments.value.map((s) => ({ ...s }))
      list[i] = { ...list[i], ...patch }
      if (sort) list.sort(byStart)
      commit(list)
    }

    function focusSegment(index) {
      nextTick(() => setTimeout(() => root.value?.querySelector(`[data-seg="${index}"] textarea`)?.focus(), 0))
    }

    function addAt(t) {
      const start = round(t)
      const list = segments.value.map((s) => ({ ...s }))
      const previous = list.filter((s) => (s.start ?? 0) <= start).sort(byStart).pop()
      if (previous && previous.end == null && previous.start !== start) previous.end = start
      const added = blank(start)
      list.push(added)
      list.sort(byStart)
      commit(list)
      focusSegment(list.indexOf(added))
    }

    function remove(i) {
      const s = segments.value[i]
      if ((s.original || s.fr || s.ar || s.note) && !confirm(`Supprimer le segment ${i + 1} et son texte ?`)) return
      commit(segments.value.filter((_, k) => k !== i))
    }

    const active = computed(() => {
      const t = display.value
      let found = -1
      segments.value.forEach((s, i) => {
        if ((s.start ?? 0) <= t && (s.end == null || t < s.end)) found = i
      })
      return found
    })

    function onKey(event) {
      if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); if (!props.disabled && source.value) addAt(now()) }
      else if (event.ctrlKey && event.code === 'Space') { event.preventDefault(); play(!playing.value) }
      else if (event.altKey && event.key === 'ArrowLeft') { event.preventDefault(); seek(now() - 5) }
      else if (event.altKey && event.key === 'ArrowRight') { event.preventDefault(); seek(now() + 5) }
    }

    onMounted(() => {
      window.addEventListener('message', onMessage)
      tick = setInterval(() => {
        display.value = now()
        if (stopAt !== null && playing.value && display.value >= stopAt) { stopAt = null; play(false) }
      }, 200)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('message', onMessage)
      clearInterval(tick)
      clearInterval(listenTimer)
    })

    /* ---------- Rendu ---------- */

    const button = (label, onClick, opts = {}) =>
      h('button', { type: 'button', class: ['jt-btn', opts.primary && 'jt-primary'], title: opts.title, disabled: opts.disabled, onClick }, label)

    function renderPlayer() {
      const s = source.value
      if (s?.kind === 'youtube') {
        return h('iframe', {
          ref: iframe, key: s.id, title: 'Lecteur vidéo', allowfullscreen: true,
          allow: 'autoplay; encrypted-media; picture-in-picture',
          src: `${YT_ORIGIN}/embed/${s.id}?enablejsapi=1&rel=0&origin=${encodeURIComponent(location.origin)}`,
          onLoad: onIframeLoad,
        })
      }
      if (s?.kind === 'file') {
        return h('video', {
          ref: media, key: s.id, src: `${assetRoot}/assets/${encodeURIComponent(s.id)}`, controls: true, preload: 'metadata',
          onPlay: () => { playing.value = true },
          onPause: () => { playing.value = false },
        })
      }
      return h('div', { class: 'jt-empty' }, error.value || (videoId.value ? 'Chargement…' : 'Choisir d’abord la vidéo.'))
    }

    function timeInput(s, i, key) {
      return h('input', {
        class: 'jt-tin', value: formatTime(s[key]), placeholder: key === 'start' ? 'début' : 'fin', readonly: props.disabled,
        'aria-label': key === 'start' ? `Début du segment ${i + 1}` : `Fin du segment ${i + 1}`,
        onChange: (event) => {
          const t = parseTime(event.target.value)
          if (t === undefined || (key === 'start' && t === null)) { event.target.value = formatTime(s[key]); return }
          update(i, { [key]: t }, key === 'start')
        },
      })
    }

    function area(s, i, key, labelText, dir, rows = 3) {
      return h('label', { class: 'jt-field' }, [
        h('span', labelText),
        h('textarea', {
          value: s[key] ?? '', dir, rows, readonly: props.disabled, lang: key === 'ar' || key === 'fr' ? key : undefined,
          onInput: (event) => update(i, { [key]: event.target.value }),
        }),
      ])
    }

    function renderSegment(s, i) {
      const disabled = props.disabled || !source.value
      return h('div', { class: ['jt-seg', i === active.value && 'jt-active'], 'data-seg': i, key: `${i}-${s.start}` }, [
        h('div', { class: 'jt-row' }, [
          h('span', { class: 'jt-num' }, String(i + 1)),
          timeInput(s, i, 'start'),
          button('Début ici', () => update(i, { start: round(now()) }, true), { disabled, title: 'Début = temps de lecture actuel' }),
          timeInput(s, i, 'end'),
          button('Fin ici', () => update(i, { end: round(now()) }), { disabled, title: 'Fin = temps de lecture actuel' }),
          button('Écouter', () => playSegment(s), { disabled: !source.value, title: 'Lire ce segment puis s’arrêter à sa fin' }),
          h('span', { class: 'jt-spacer' }),
          button('Supprimer', () => remove(i), { disabled: props.disabled }),
        ]),
        area(s, i, 'original', 'Transcription (langue parlée)', 'auto'),
        area(s, i, 'fr', 'Traduction française', 'ltr'),
        showArabic.value || s.ar ? area(s, i, 'ar', 'Traduction arabe', 'rtl') : null,
        area(s, i, 'note', 'Remarque (terme incertain, contexte, référence citée…)', 'auto', 1),
      ])
    }

    return () => h('div', { class: 'jt', ref: root, onKeydown: onKey }, [
      h('style', css),
      h('div', { class: 'jt-player' }, [
        h('div', { class: 'jt-frame' }, [renderPlayer()]),
        h('div', { class: 'jt-controls' }, [
          button('−5 s', () => seek(now() - 5), { disabled: !source.value }),
          button(playing.value ? 'Pause' : 'Lecture', () => play(!playing.value), { disabled: !source.value }),
          button('+5 s', () => seek(now() + 5), { disabled: !source.value }),
          h('select', {
            class: 'jt-sel', value: rate.value, 'aria-label': 'Vitesse de lecture', disabled: !source.value,
            onChange: (event) => setRate(Number(event.target.value)),
          }, RATES.map((r) => h('option', { value: r }, `× ${r}`))),
          h('span', { class: 'jt-time' }, formatTime(display.value)),
          button('Nouveau segment ici', () => addAt(now()), { primary: true, disabled: props.disabled || !source.value }),
        ]),
        h('label', { class: 'jt-help' }, [
          h('input', { type: 'checkbox', checked: showArabic.value, onChange: (event) => { showArabic.value = event.target.checked } }),
          ' Afficher la traduction arabe',
        ]),
        h('p', { class: 'jt-help' }, 'Ctrl+Entrée : nouveau segment · Ctrl+Espace : lecture / pause · Alt+← / Alt+→ : 5 secondes.'),
      ]),
      h('div', { class: 'jt-list' }, [
        ...segments.value.map(renderSegment),
        segments.value.length === 0 ? h('p', { class: 'jt-help' }, 'Aucun segment. Lancer la vidéo puis « Nouveau segment ici » à chaque phrase.') : null,
        button('Ajouter un segment', () => addAt(source.value ? now() : (segments.value.at(-1)?.end ?? segments.value.at(-1)?.start ?? 0)), { disabled: props.disabled }),
      ]),
    ])
  },
})

export default {
  id: 'jamah-transcription',
  name: 'Transcription synchronisée',
  icon: 'subtitles',
  description: 'Vidéo et segments de transcription / traduction côte à côte.',
  component: TranscriptionInterface,
  types: ['json'],
  options: null,
}
