// Interface Directus « Traduction côte à côte » : document original (PDF ou image) à gauche si joint,
// paragraphes alignés à droite (original | traductions FR / AR / EN), avec une case « Relu » par langue.
// Écrite sans étape de build : Directus fournit `vue` et `@directus/extensions-sdk` aux extensions de l'application.
import { computed, defineComponent, h, inject, ref, watch } from 'vue'
import { useApi } from '@directus/extensions-sdk'

const LANGS = [
  { key: 'fr', label: 'Français', dir: 'ltr' },
  { key: 'ar', label: 'Arabe', dir: 'rtl' },
  { key: 'en', label: 'Anglais', dir: 'ltr' },
]
const RTL_SOURCES = new Set(['ar'])

const blank = (original = '') => ({ original, fr: '', ar: '', en: '', note: '', reviewed: {} })

/** Découpe un texte collé en paragraphes (séparés par une ligne vide). */
function splitParagraphs(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const css = `
.jtt{display:grid;gap:12px}
.jtt-bar,.jtt-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.jtt-body{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;align-items:start}
.jtt-body.jtt-with-doc{grid-template-columns:minmax(0,2fr) minmax(0,3fr)}
@media (max-width:1100px){.jtt-body.jtt-with-doc{grid-template-columns:1fr}}
.jtt-doc{position:sticky;top:72px;height:calc(100vh - 120px);border:var(--theme--border-width,2px) solid var(--theme--border-color,#d3dae4);border-radius:var(--theme--border-radius,6px);overflow:auto;background:#fafafa}
.jtt-doc iframe{width:100%;height:100%;border:0;display:block}
.jtt-doc img{width:100%;display:block}
.jtt-btn,.jtt-field textarea,.jtt-import textarea{border:var(--theme--border-width,2px) solid var(--theme--form--field--input--border-color,var(--theme--border-color,#d3dae4));border-radius:var(--theme--border-radius,6px);background:var(--theme--form--field--input--background,var(--theme--background,#fff));color:var(--theme--foreground,#172940);font:inherit}
.jtt-btn{padding:4px 10px;cursor:pointer}
.jtt-btn:hover:not(:disabled){border-color:var(--theme--primary,#6644ff)}
.jtt-btn:disabled{opacity:.5;cursor:not-allowed}
.jtt-primary{background:var(--theme--primary,#6644ff);border-color:var(--theme--primary,#6644ff);color:#fff}
.jtt-help{font-size:12px;color:var(--theme--foreground-subdued,#7c8ba1)}
.jtt-progress{font-size:13px;font-weight:600}
.jtt-list{display:grid;gap:12px}
.jtt-seg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;padding:12px;border:var(--theme--border-width,2px) solid var(--theme--border-color,#d3dae4);border-radius:var(--theme--border-radius,6px)}
.jtt-seg.jtt-done{border-color:#2ECDA7}
@media (max-width:800px){.jtt-seg{grid-template-columns:1fr}}
.jtt-head{grid-column:1/-1}
.jtt-num{font-weight:700;min-width:2.5ch}
.jtt-spacer{flex:1}
.jtt-col{display:grid;gap:8px;align-content:start}
.jtt-field{display:grid;gap:4px;font-size:13px;color:var(--theme--foreground-subdued,#7c8ba1)}
.jtt-field textarea,.jtt-import textarea{width:100%;resize:vertical;padding:8px;font-size:15px;line-height:1.7}
.jtt-field textarea[dir=rtl],.jtt-import textarea[dir=rtl]{font-size:19px;line-height:1.9}
.jtt-check{display:inline-flex;gap:4px;align-items:center;font-size:12px}
.jtt-import{display:grid;gap:8px;padding:12px;border:var(--theme--border-width,2px) dashed var(--theme--border-color,#d3dae4);border-radius:var(--theme--border-radius,6px)}
`

const TextTranslationInterface = defineComponent({
  props: {
    value: { type: Array, default: null },
    disabled: { type: Boolean, default: false },
  },
  emits: ['input'],
  setup(props, { emit }) {
    const api = useApi()
    const values = inject('values', ref({}))
    const segments = computed(() => (Array.isArray(props.value) ? props.value : []))

    const shown = ref(Object.fromEntries(LANGS.map((l) => [l.key, l.key === 'fr' || l.key === 'ar' || segments.value.some((s) => s?.[l.key])])))
    const showDoc = ref(true)
    const onlyPending = ref(false)
    const importing = ref(false)
    const pasted = ref('')
    const file = ref(null)

    const assetRoot = location.pathname.replace(/\/admin(\/.*)?$/, '')
    const sourceDir = computed(() => (RTL_SOURCES.has(values.value?.source_language) ? 'rtl' : 'auto'))
    const idOf = (v) => (v && typeof v === 'object' ? v.id : v)

    // Document affiché : fichier joint à la fiche, sinon fichier du document de la bibliothèque.
    watch(() => [idOf(values.value?.source_file), idOf(values.value?.document)], async ([fileId, documentId]) => {
      file.value = null
      try {
        let id = fileId
        if (!id && documentId) {
          const res = await api.get(`/items/documents/${encodeURIComponent(documentId)}`, { params: { fields: 'file' } })
          id = idOf(res.data?.data?.file)
        }
        if (!id) return
        const res = await api.get(`/files/${encodeURIComponent(id)}`, { params: { fields: 'id,type' } })
        const type = res.data?.data?.type ?? ''
        file.value = { id, kind: type === 'application/pdf' ? 'pdf' : type.startsWith('image/') ? 'image' : 'other' }
      } catch {
        file.value = null
      }
    }, { immediate: true })

    const languages = computed(() => LANGS.filter((l) => shown.value[l.key]))

    function commit(list) {
      emit('input', list)
    }

    function update(i, patch) {
      const list = segments.value.map((s) => ({ ...s }))
      list[i] = { ...list[i], ...patch }
      commit(list)
    }

    // Toute modification d'une traduction relue retire la marque « Relu » de cette langue.
    function editTranslation(i, key, text) {
      const s = segments.value[i]
      update(i, { [key]: text, reviewed: { ...(s.reviewed ?? {}), [key]: false } })
    }

    function setReviewed(i, key, on) {
      const s = segments.value[i]
      update(i, { reviewed: { ...(s.reviewed ?? {}), [key]: on } })
    }

    function remove(i) {
      const s = segments.value[i]
      if ((s.original || s.fr || s.ar || s.en || s.note) && !confirm(`Supprimer le paragraphe ${i + 1} et ses traductions ?`)) return
      commit(segments.value.filter((_, k) => k !== i))
    }

    function mergeNext(i) {
      const [a, b] = [segments.value[i], segments.value[i + 1]]
      if (!b) return
      const join = (x, y) => [x, y].filter((t) => t && t.trim()).join('\n\n')
      const merged = { ...blank(join(a.original, b.original)), note: join(a.note, b.note) }
      for (const { key } of LANGS) merged[key] = join(a[key], b[key])
      const list = segments.value.slice()
      list.splice(i, 2, merged)
      commit(list)
    }

    function insertAfter(i) {
      const list = segments.value.slice()
      list.splice(i + 1, 0, blank())
      commit(list)
    }

    function importText() {
      const parts = splitParagraphs(pasted.value)
      if (!parts.length) return
      commit([...segments.value, ...parts.map((p) => blank(p))])
      pasted.value = ''
      importing.value = false
    }

    const done = (s) => languages.value.length > 0 && languages.value.every((l) => s.reviewed?.[l.key])

    /* ---------- Rendu ---------- */

    const button = (label, onClick, opts = {}) =>
      h('button', { type: 'button', class: ['jtt-btn', opts.primary && 'jtt-primary'], title: opts.title, disabled: opts.disabled, onClick }, label)

    const checkbox = (label, checked, onChange, opts = {}) =>
      h('label', { class: 'jtt-check' }, [
        h('input', { type: 'checkbox', checked, disabled: opts.disabled, onChange: (event) => onChange(event.target.checked) }),
        label,
      ])

    function renderDoc() {
      const f = file.value
      const src = `${assetRoot}/assets/${encodeURIComponent(f.id)}`
      if (f.kind === 'pdf') return h('iframe', { src, title: 'Document original', key: f.id })
      if (f.kind === 'image') return h('img', { src, alt: 'Document original', key: f.id })
      return h('p', { class: 'jtt-help', style: 'padding:12px' }, [
        'Aperçu impossible pour ce type de fichier. ',
        h('a', { href: src, target: '_blank', rel: 'noopener' }, 'Ouvrir le fichier'),
      ])
    }

    function area(s, i, key, labelText, dir, onInput, rows = 4) {
      return h('label', { class: 'jtt-field' }, [
        h('span', labelText),
        h('textarea', {
          value: s[key] ?? '', dir, rows, readonly: props.disabled,
          lang: LANGS.some((l) => l.key === key) ? key : values.value?.source_language || undefined,
          onInput: (event) => onInput(event.target.value),
        }),
      ])
    }

    function renderSegment(s, i) {
      return h('div', { class: ['jtt-seg', done(s) && 'jtt-done'], key: i }, [
        h('div', { class: 'jtt-row jtt-head' }, [
          h('span', { class: 'jtt-num' }, String(i + 1)),
          h('span', { class: 'jtt-spacer' }),
          button('Insérer après', () => insertAfter(i), { disabled: props.disabled }),
          button('Fusionner avec le suivant', () => mergeNext(i), { disabled: props.disabled || i === segments.value.length - 1 }),
          button('Supprimer', () => remove(i), { disabled: props.disabled }),
        ]),
        h('div', { class: 'jtt-col' }, [
          area(s, i, 'original', 'Texte original', sourceDir.value, (text) => update(i, { original: text }), 6),
          area(s, i, 'note', 'Remarque (terme incertain, référence…)', 'auto', (text) => update(i, { note: text }), 1),
        ]),
        h('div', { class: 'jtt-col' }, languages.value.map((l) => h('div', { class: 'jtt-col' }, [
          area(s, i, l.key, `Traduction ${l.label.toLowerCase()}`, l.dir, (text) => editTranslation(i, l.key, text)),
          checkbox(`Relu (${l.label.toLowerCase()})`, !!s.reviewed?.[l.key], (on) => setReviewed(i, l.key, on), {
            disabled: props.disabled || !s[l.key]?.trim(),
          }),
        ]))),
      ])
    }

    return () => {
      const list = segments.value
      const visible = list.map((s, i) => [s, i]).filter(([s]) => !onlyPending.value || !done(s))
      const withDoc = showDoc.value && !!file.value
      return h('div', { class: 'jtt' }, [
        h('style', css),
        h('div', { class: 'jtt-bar' }, [
          ...LANGS.map((l) => checkbox(l.label, shown.value[l.key], (on) => { shown.value = { ...shown.value, [l.key]: on } })),
          file.value ? checkbox('Document original', showDoc.value, (on) => { showDoc.value = on }) : null,
          checkbox('Non relus seulement', onlyPending.value, (on) => { onlyPending.value = on }),
          h('span', { class: 'jtt-spacer' }),
          ...languages.value.map((l) => h('span', { class: 'jtt-progress' },
            `${l.label} : ${list.filter((s) => s.reviewed?.[l.key]).length} / ${list.length} relus`)),
        ]),
        h('div', { class: ['jtt-body', withDoc && 'jtt-with-doc'] }, [
          withDoc ? h('div', { class: 'jtt-doc' }, [renderDoc()]) : null,
          h('div', { class: 'jtt-list' }, [
            importing.value
              ? h('div', { class: 'jtt-import' }, [
                h('span', { class: 'jtt-help' }, 'Coller le texte original. Une ligne vide sépare deux paragraphes ; les paragraphes sont ajoutés à la fin.'),
                h('textarea', { value: pasted.value, rows: 10, dir: sourceDir.value, onInput: (event) => { pasted.value = event.target.value } }),
                h('div', { class: 'jtt-row' }, [
                  button(`Ajouter ${splitParagraphs(pasted.value).length} paragraphe(s)`, importText, { primary: true, disabled: !pasted.value.trim() }),
                  button('Annuler', () => { importing.value = false }),
                ]),
              ])
              : null,
            ...visible.map(([s, i]) => renderSegment(s, i)),
            list.length === 0 && !importing.value
              ? h('p', { class: 'jtt-help' }, 'Aucun paragraphe. « Importer un texte » pour coller l’original, ou « Ajouter un paragraphe ».')
              : null,
            h('div', { class: 'jtt-row' }, [
              button('Importer un texte', () => { importing.value = true }, { primary: true, disabled: props.disabled || importing.value }),
              button('Ajouter un paragraphe', () => commit([...list, blank()]), { disabled: props.disabled }),
            ]),
          ]),
        ]),
      ])
    }
  },
})

export default {
  id: 'jamah-text-translation',
  name: 'Traduction côte à côte',
  icon: 'translate',
  description: 'Texte original et traductions alignés paragraphe par paragraphe, avec relecture par langue.',
  component: TextTranslationInterface,
  types: ['json'],
  options: null,
}
