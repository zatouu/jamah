import { describe, expect, it } from 'vitest'
import { nextAnnualDate } from './calendar'

describe('nextAnnualDate', () => {
  it('donne la date de l’année en cours si elle n’est pas passée', () => {
    const r = nextAnnualDate(4, 20, new Date('2026-04-10T15:00:00Z'))
    expect(r.date.toISOString().slice(0, 10)).toBe('2026-04-20')
    expect(r.daysLeft).toBe(10)
  })

  it('passe à l’année suivante une fois la date passée', () => {
    const r = nextAnnualDate(4, 20, new Date('2026-10-27T08:00:00Z'))
    expect(r.date.toISOString().slice(0, 10)).toBe('2027-04-20')
    expect(r.daysLeft).toBe(175)
  })

  it('renvoie 0 le jour même', () => {
    expect(nextAnnualDate(4, 20, new Date('2026-04-20T23:00:00Z')).daysLeft).toBe(0)
  })
})
