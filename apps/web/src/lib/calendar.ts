const DAY_MS = 86_400_000

/** Prochaine occurrence d'une date annuelle (mois 1–12) à partir de `now`, et nombre de jours restants. */
export function nextAnnualDate(month: number, day: number, now: Date = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  let target = Date.UTC(now.getUTCFullYear(), month - 1, day)
  if (target < today) target = Date.UTC(now.getUTCFullYear() + 1, month - 1, day)
  return { date: new Date(target), daysLeft: Math.round((target - today) / DAY_MS) }
}
