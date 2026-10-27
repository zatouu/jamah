// Inventaire en LECTURE SEULE du corpus de sufi-knowledge.
// Aucune écriture : uniquement find / countDocuments / aggregate($group).
//
// Usage :
//   MONGODB_URI=... MONGODB_DB=... node inventory.mjs > ../../docs/inventaire-corpus.md
//   (ou : node --env-file=D:/sufi-knowledge/.env.local inventory.mjs > ...)

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'soufisme_knowledge_base'
if (!uri) {
  console.error('MONGODB_URI manquant.')
  process.exit(1)
}

const client = new MongoClient(uri, { readPreference: 'secondaryPreferred', appName: 'jamah-inventory' })
const md = (v) => String(v ?? '—').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim() || '—'

function provenanceFrom(text = '') {
  const source = text.match(/Source URL:\s*(\S+)/)?.[1] ?? text.match(/Source:\s*(.+)/)?.[1]
  const license = text.match(/Licen[cs]e:\s*(.+)/)?.[1]
  return { source: source?.trim(), license: license?.trim() }
}

try {
  await client.connect()
  const db = client.db(dbName)
  const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort()
  const counts = await Promise.all(collections.map(async (name) => [name, await db.collection(name).estimatedDocumentCount()]))

  const docs = await db
    .collection('knowledge_documents')
    .find({}, {
      projection: {
        title: 1, titleFr: 1, titleAr: 1, author: 1, language: 1, category: 1, documentType: 1,
        documentRole: 1, workTitle: 1, processingStatus: 1, 'audience.visibility': 1, mimeType: 1, createdAt: 1,
      },
      sort: { author: 1, title: 1 },
    })
    .toArray()

  const passageCounts = new Map(
    (await db.collection('knowledge_passages').aggregate([{ $group: { _id: '$documentId', n: { $sum: 1 } } }]).toArray())
      .map((r) => [String(r._id), r.n]),
  )

  const firstPassages = new Map(
    (await db
      .collection('knowledge_passages')
      .find({ order: 0 }, { projection: { documentId: 1, text: { $substrCP: ['$text', 0, 1500] } } })
      .toArray()).map((p) => [String(p.documentId), p.text]),
  )

  const out = []
  out.push('# Inventaire du corpus existant (sufi-knowledge / Ma\'rifa)', '')
  out.push(`> Généré le ${new Date().toISOString().slice(0, 10)} par \`tools/inventory-mongo\` — lecture seule.`)
  out.push('> La colonne « Provenance / licence » est extraite de l\'en-tête du premier passage quand il existe.')
  out.push('> **Aucun contenu ne doit être migré sans vérification des droits et validation par la Jamah.**', '')
  out.push('## Collections', '', '| Collection | Documents (estimation) |', '|---|---:|')
  for (const [name, n] of counts) out.push(`| ${name} | ${n} |`)

  const byKey = (key) => docs.reduce((acc, d) => acc.set(d[key] ?? '—', (acc.get(d[key] ?? '—') ?? 0) + 1), new Map())
  for (const [key, label] of [['language', 'Langue'], ['category', 'Catégorie'], ['processingStatus', 'Statut de traitement']]) {
    out.push('', `## Répartition par ${label.toLowerCase()}`, '', `| ${label} | Documents |`, '|---|---:|')
    for (const [k, n] of [...byKey(key)].sort((a, b) => b[1] - a[1])) out.push(`| ${md(k)} | ${n} |`)
  }

  out.push('', `## Documents (${docs.length})`, '')
  out.push('| Titre | Titre arabe | Auteur | Langue | Rôle | Passages | Statut | Visibilité | Provenance / licence |')
  out.push('|---|---|---|---|---|---:|---|---|---|')
  for (const d of docs) {
    const id = String(d._id)
    const prov = provenanceFrom(firstPassages.get(id))
    out.push(
      `| ${md(d.titleFr || d.title)} | ${md(d.titleAr)} | ${md(d.author)} | ${md(d.language)} | ${md(d.documentRole)} | ` +
        `${passageCounts.get(id) ?? 0} | ${md(d.processingStatus)} | ${md(d.audience?.visibility ?? 'public')} | ` +
        `${md([prov.source, prov.license].filter(Boolean).join(' — ') || 'non renseignée')} |`,
    )
  }

  const media = await db
    .collection('media_library')
    .find({}, { projection: { title: 1, author: 1, mediaType: 1, url: 1, relationType: 1, linkedPassages: 1 } })
    .toArray()
  out.push('', `## Médias (${media.length})`, '', '| Titre | Intervenant | Type | Relation | Passages liés | Lien externe |', '|---|---|---|---|---:|---|')
  for (const m of media) {
    out.push(`| ${md(m.title)} | ${md(m.author)} | ${md(m.mediaType)} | ${md(m.relationType)} | ${m.linkedPassages?.length ?? 0} | ${m.url ? 'oui' : 'non'} |`)
  }

  const taliqat = await db.collection('taliqat').aggregate([{ $group: { _id: { author: '$author', type: '$type' }, n: { $sum: 1 } } }]).toArray()
  out.push('', '## Ta\'liqat (commentaires) par auteur et type', '', '| Auteur | Type | Nombre |', '|---|---|---:|')
  for (const t of taliqat.sort((a, b) => b.n - a.n)) out.push(`| ${md(t._id.author)} | ${md(t._id.type)} | ${t.n} |`)

  console.log(out.join('\n'))
} finally {
  await client.close()
}
