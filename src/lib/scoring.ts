/** Maksymalna liczba punktów z quizu (5 pytań × 1 pkt). */
export const QUIZ_MAX = 5

/** Maksymalna liczba punktów z laboratorium (poprawna składnia + treść). */
export const LAB_MAX = 3

/** Bonus za poprawne przejście symulatora wieku. */
export const SIMULATOR_BONUS = 1

export const TOTAL_MAX = QUIZ_MAX + LAB_MAX + SIMULATOR_BONUS

export function clampPoints(n: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(n)))
}
