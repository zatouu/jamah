import type { Contact } from '@/content/site-content'
import type { Dictionary } from '@/i18n/dictionaries/fr'

export function hasContact(contact: Contact): boolean {
  return Boolean(contact.email || contact.phone || contact.address || contact.links.length)
}

export function ContactDetails({ contact, dict, className = '' }: { contact: Contact; dict: Dictionary; className?: string }) {
  if (!hasContact(contact)) return null
  const t = dict.contact
  const link = 'underline decoration-line underline-offset-4 hover:text-forest-700'
  return (
    <dl className={`grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr] ${className}`}>
      {contact.email && (
        <>
          <dt className="text-muted">{t.email}</dt>
          <dd>
            <a href={`mailto:${contact.email}`} className={link}>{contact.email}</a>
          </dd>
        </>
      )}
      {contact.phone && (
        <>
          <dt className="text-muted">{t.phone}</dt>
          <dd dir="ltr" className="text-start">
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className={link}>{contact.phone}</a>
          </dd>
        </>
      )}
      {contact.address && (
        <>
          <dt className="text-muted">{t.address}</dt>
          <dd className="whitespace-pre-line">{contact.address}</dd>
        </>
      )}
      {contact.links.length > 0 && (
        <>
          <dt className="text-muted">{t.follow}</dt>
          <dd className="flex flex-wrap gap-x-4 gap-y-1">
            {contact.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={link}>
                {l.label}
              </a>
            ))}
          </dd>
        </>
      )}
    </dl>
  )
}
