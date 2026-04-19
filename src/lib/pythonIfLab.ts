/** Oczekiwane komunikaty (fragmenty — dopasowanie bez rozróżniania wielkości liter). */
export const MSG_GRANTED = 'dostęp przyznany'
export const MSG_DENIED = 'brak dostępu'

export type LabValidation = {
  valid: boolean
  issues: string[]
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function splitIfElseBlocks(code: string): { ifHead: string; ifBody: string; elseBody: string } | null {
  const lines = code.split(/\r?\n/)
  let elseIdx = -1
  const elseRe = /^\s*else\s*:\s*(?:#.*)?$/
  for (let i = 0; i < lines.length; i++) {
    if (elseRe.test(lines[i])) {
      elseIdx = i
      break
    }
  }
  if (elseIdx < 0) return null

  const beforeElse = lines.slice(0, elseIdx)
  let ifLineIdx = -1
  for (let i = 0; i < beforeElse.length; i++) {
    if (/^\s*if\b/.test(beforeElse[i])) {
      ifLineIdx = i
      break
    }
  }
  if (ifLineIdx < 0) return null

  const ifHead = beforeElse[ifLineIdx]
  const ifBody = beforeElse.slice(ifLineIdx + 1).join('\n')
  const elseBody = lines.slice(elseIdx + 1).join('\n')
  return { ifHead, ifBody, elseBody }
}

function firstPrintString(block: string): string | null {
  const m = block.match(/print\s*\(\s*["']([^"']*)["']/)
  return m ? m[1] : null
}

/** Podstawowa walidacja składni if/else pod kątem zadania o wieku. */
export function validateLabSyntax(code: string): LabValidation {
  const issues: string[] = []
  const c = code

  if (!/\bif\b/.test(c)) issues.push('Brakuje instrukcji if.')
  if (!/\belse\s*:/.test(c)) issues.push('Brakuje gałęzi else zakończonej dwukropkiem (:).')

  if (!/>=\s*18/.test(c) && !/>=\s*18\s*\)/.test(c)) {
    issues.push('Warunek powinien porównywać wiek z liczbą 18 (np. wiek >= 18).')
  }

  const ifLineMatch = c.match(/^\s*if\b[^\n]*/m)
  if (ifLineMatch) {
    const line = ifLineMatch[0].trim()
    if (!/:\s*(?:#.*)?$/.test(line)) {
      issues.push('Po warunku if powinien być dwukropek (:) na końcu linii.')
    }
  } else {
    issues.push('Nie znaleziono poprawnej linii z if.')
  }

  if (!/\bprint\s*\(/.test(c)) issues.push('Użyj funkcji print(...) do wyświetlenia komunikatów.')

  const printQuoted = /print\s*\(\s*["']/.test(c)
  if (/print\s*\(/.test(c) && !printQuoted) {
    issues.push('Teksty w print() powinny być w cudzysłowach " lub \'.')
  }

  const blocks = splitIfElseBlocks(c)
  if (!blocks) {
    issues.push('Nie znaleziono poprawnej pary if / else (np. osobna linia z else:).')
  } else {
    const pIf = firstPrintString(blocks.ifBody)
    const pElse = firstPrintString(blocks.elseBody)
    const wantGrant = normalize(MSG_GRANTED)
    const wantDeny = normalize(MSG_DENIED)
    if (pIf && !normalize(pIf).includes(wantGrant)) {
      issues.push('W gałęzi if komunikat powinien zawierać frazę „Dostęp przyznany”.')
    }
    if (pElse && !normalize(pElse).includes(wantDeny)) {
      issues.push('W gałęzi else komunikat powinien zawierać frazę „Brak dostępu”.')
    }
    if (!pIf) issues.push('Nie znaleziono print(...) w ciele instrukcji if.')
    if (!pElse) issues.push('Nie znaleziono print(...) w ciele instrukcji else.')
  }

  return { valid: issues.length === 0, issues }
}

/** Symuluje wynik dla podanego wieku (uproszczone parsowanie bloków if/else). */
export function simulateLabAge(code: string, age: number): { ok: boolean; output?: string; error?: string } {
  const blocks = splitIfElseBlocks(code)
  if (!blocks) {
    return { ok: false, error: 'Nie można podzielić kodu na bloki if / else.' }
  }

  const head = blocks.ifHead
  const condMatch = head.match(/if\s*\(?\s*(\w+)\s*>=\s*18\s*\)?\s*:/i)
  if (!condMatch) {
    return { ok: false, error: 'Oczekiwany warunek w stylu: if wiek >= 18:' }
  }

  const pIf = firstPrintString(blocks.ifBody)
  const pElse = firstPrintString(blocks.elseBody)
  if (!pIf || !pElse) {
    return { ok: false, error: 'Brakuje print(...) w jednym z bloków.' }
  }

  const meets = age >= 18
  const output = meets ? pIf : pElse
  const ok = meets
    ? normalize(output).includes(normalize(MSG_GRANTED))
    : normalize(output).includes(normalize(MSG_DENIED))

  if (!ok) {
    return {
      ok: false,
      error: meets
        ? 'Dla pełnoletniego użytkownika oczekiwany jest komunikat o przyznaniu dostępu.'
        : 'Dla niepełnoletniego użytkownika oczekiwany jest komunikat o braku dostępu.',
    }
  }

  return { ok: true, output }
}

const TEST_AGES = [20, 15, 18] as const

/** Bonus: poprawne zachowanie dla kilku testowych wieków. */
export function passesSimulatorSuite(code: string): boolean {
  if (!validateLabSyntax(code).valid) return false
  return TEST_AGES.every((a) => simulateLabAge(code, a).ok)
}
