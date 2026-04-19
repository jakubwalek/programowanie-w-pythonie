import { TOTAL_MAX } from './scoring'

/** Ocena szkolna 1–6 na podstawie procentów z maksimum. */
export function scoreToGrade(points: number, maxPoints: number = TOTAL_MAX): 1 | 2 | 3 | 4 | 5 | 6 {
  if (maxPoints <= 0) return 1
  const pct = (points / maxPoints) * 100
  if (pct >= 90) return 6
  if (pct >= 75) return 5
  if (pct >= 60) return 4
  if (pct >= 45) return 3
  if (pct >= 30) return 2
  return 1
}

export function gradeLabel(g: 1 | 2 | 3 | 4 | 5 | 6): string {
  const labels: Record<number, string> = {
    1: 'niedostateczny',
    2: 'mierny',
    3: 'dostateczny',
    4: 'dobry',
    5: 'bardzo dobry',
    6: 'celujący',
  }
  return labels[g] ?? ''
}
