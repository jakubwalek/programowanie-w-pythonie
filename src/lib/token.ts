import { TOTAL_MAX } from './scoring'

export const TOKEN_PREFIX = 'IF_ELSE_LAB'

export type TokenPayload = {
  className: string
  surnameSanitized: string
  firstNameSanitized: string
  /** Oryginalna długość nazwiska po trim (dla sumy kontrolnej). */
  surnameLength: number
  points: number
  maxPoints: number
  /** Czy laboratorium (praktyka) jest zaliczone wg walidatora składni. */
  labPassed: boolean
  checksum: number
  salt: string
}

function sanitizeSegment(raw: string, maxLen = 24): string {
  const t = raw.trim().replace(/\s+/g, '_')
  return t.replace(/[^A-Za-z0-9_-]/g, '').slice(0, maxLen)
}

/** Suma kontrolna — identyczna przy generowaniu tokenu i w weryfikatorze. */
export function computeChecksum(
  points: number,
  maxPoints: number,
  surnameLength: number,
  labPassed: boolean,
): number {
  return points * 7 + maxPoints * 3 + surnameLength + (labPassed ? 50 : 0)
}

function randomSalt(length = 6): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let s = ''
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}

export type EncodeInput = {
  className: string
  surname: string
  firstName: string
  points: number
  maxPoints?: number
  labPassed: boolean
}

export function encodeToken(input: EncodeInput): string {
  const maxPoints = input.maxPoints ?? TOTAL_MAX
  const surnameTrim = input.surname.trim()
  const surnameLength = [...surnameTrim].length
  const classSan = sanitizeSegment(input.className)
  const surnameSan = sanitizeSegment(input.surname)
  const firstSan = sanitizeSegment(input.firstName)
  const points = Math.max(0, Math.min(maxPoints, Math.round(input.points)))
  const checksum = computeChecksum(points, maxPoints, surnameLength, input.labPassed)
  const salt = randomSalt(6)

  return [
    TOKEN_PREFIX,
    classSan,
    surnameSan,
    firstSan,
    String(points),
    String(maxPoints),
    String(surnameLength),
    input.labPassed ? '1' : '0',
    String(checksum),
    salt,
  ].join('|')
}

export type DecodeResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; error: string }

export function decodeToken(raw: string): DecodeResult {
  const trimmed = raw.trim()
  const parts = trimmed.split('|')
  if (parts.length !== 10 || parts[0] !== TOKEN_PREFIX) {
    return { ok: false, error: 'Nieprawidłowy format tokenu.' }
  }

  const [
    ,
    className,
    surnameSanitized,
    firstNameSanitized,
    ps,
    ms,
    sl,
    lp,
    cs,
    salt,
  ] = parts

  const points = Number(ps)
  const maxPoints = Number(ms)
  const surnameLength = Number(sl)
  const checksum = Number(cs)
  const labPassed = lp === '1'

  if (
    !Number.isFinite(points) ||
    !Number.isFinite(maxPoints) ||
    !Number.isFinite(surnameLength) ||
    !Number.isFinite(checksum)
  ) {
    return { ok: false, error: 'Nie można odczytać liczb w tokenie.' }
  }

  const payload: TokenPayload = {
    className,
    surnameSanitized,
    firstNameSanitized,
    surnameLength,
    points,
    maxPoints,
    labPassed,
    checksum,
    salt,
  }

  return { ok: true, payload }
}

export function verifyChecksum(payload: TokenPayload): boolean {
  const expected = computeChecksum(
    payload.points,
    payload.maxPoints,
    payload.surnameLength,
    payload.labPassed,
  )
  return expected === payload.checksum
}
