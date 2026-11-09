'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MenuIcon } from './icons'

export type NavItem = { href: string; label: string; children: { href: string; label: string }[] }

type Props = {
  items: NavItem[]
  labels: { mainNav: string; openMenu: string; closeMenu: string; overview: string }
}

function useIsActive() {
  const pathname = usePathname() ?? ''
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`)
}

export function DesktopNav({ items, labels }: Props) {
  const isActive = useIsActive()
  return (
    <nav aria-label={labels.mainNav} className="ms-auto hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {items.map((item, index) => {
          const active = isActive(item.href)
          const align = index >= items.length - 2 ? 'end-0' : 'start-0'
          return (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 text-[0.92rem] transition-colors hover:bg-forest-50 hover:text-forest-800 ${
                  active ? 'text-forest-800 shadow-[inset_0_-2px_0_var(--color-ochre)]' : 'text-ink/80'
                }`}
              >
                {item.label}
              </Link>
              <div className={`invisible absolute ${align} top-full z-50 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100`}>
                <ul className="w-72 rounded-card border border-line bg-paper p-2 shadow-[0_18px_40px_-18px_rgb(15_61_46/0.35)]">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={isActive(child.href) ? 'page' : undefined}
                        className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-forest-50 hover:text-forest-800 aria-[current=page]:bg-forest-50 aria-[current=page]:text-forest-800"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function MobileNav({ items, labels }: Props) {
  const pathname = usePathname()
  const isActive = useIsActive()
  const [open, setOpen] = useState(false)
  const [openedFor, setOpenedFor] = useState(pathname)

  // Fermeture automatique après une navigation.
  if (open && openedFor !== pathname) setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => {
          setOpenedFor(pathname)
          setOpen((v) => !v)
        }}
        className="grid size-9 place-items-center rounded-full text-ink hover:bg-forest-50"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <MenuIcon />
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 bg-ink/30" onClick={() => setOpen(false)}>
          <nav
            id="mobile-nav"
            aria-label={labels.mainNav}
            onClick={(e) => e.stopPropagation()}
            className="ms-auto h-full w-full max-w-sm overflow-y-auto border-s border-line bg-paper p-3 shadow-xl"
          >
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <details open={isActive(item.href)} className="group rounded-lg">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 text-[0.95rem] text-ink hover:bg-forest-50 [&::-webkit-details-marker]:hidden">
                      <span className={isActive(item.href) ? 'font-medium text-forest-800' : ''}>{item.label}</span>
                      <svg viewBox="0 0 24 24" className="size-4 text-muted transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <ul className="mb-2 ms-3 border-s border-line ps-2">
                      <li>
                        <Link href={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-forest-700 hover:bg-forest-50">
                          {labels.overview}
                        </Link>
                      </li>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={isActive(child.href) ? 'page' : undefined}
                            className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-forest-50 aria-[current=page]:bg-forest-50 aria-[current=page]:text-forest-800"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
