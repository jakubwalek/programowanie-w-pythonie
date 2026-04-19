import { useState } from 'react'
import { BadgeCheck, BadgeX, KeyRound } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { decodeToken, verifyChecksum } from '../lib/token'
import { TOTAL_MAX } from '../lib/scoring'
import { gradeLabel, scoreToGrade } from '../lib/grade'

export function ValidatorPage() {
  const [raw, setRaw] = useState('')
  const parsed = decodeToken(raw)
  const checksumOk = parsed.ok ? verifyChecksum(parsed.payload) : false
  const autoGrade = parsed.ok
    ? scoreToGrade(parsed.payload.points, parsed.payload.maxPoints || TOTAL_MAX)
    : (1 as const)

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Weryfikator tokenu</h2>
            <p className="text-sm text-slate-400">Wklej token wygenerowany na karcie pracy ucznia.</p>
          </div>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="IF_ELSE_LAB|..."
          rows={4}
          className="w-full rounded-2xl border border-slate-600 bg-slate-950/80 p-4 font-mono text-xs text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={() => setRaw('')}>
            Wyczyść
          </Button>
        </div>
      </Card>

      {!raw.trim() && (
        <p className="text-center text-sm text-slate-500">Wklej token, aby zobaczyć weryfikację.</p>
      )}

      {raw.trim() && !parsed.ok && (
        <Card className="border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-200">
            <BadgeX className="h-5 w-5 shrink-0" />
            <p>{parsed.error}</p>
          </div>
        </Card>
      )}

      {parsed.ok && (
        <Card
          className={
            checksumOk ? 'border-emerald-500/30' : 'border-rose-500/40'
          }
        >
          <div className="mb-4 flex items-center gap-2">
            {checksumOk ? (
              <>
                <BadgeCheck className="h-6 w-6 text-emerald-400" />
                <span className="font-semibold text-emerald-200">Suma kontrolna poprawna</span>
              </>
            ) : (
              <>
                <BadgeX className="h-6 w-6 text-rose-400" />
                <span className="font-semibold text-rose-200">Suma kontrolna niezgodna — token mógł być zmieniony</span>
              </>
            )}
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Klasa (sanityzowana)</dt>
              <dd className="font-medium">{parsed.payload.className || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Nazwisko (sanityzowane)</dt>
              <dd className="font-medium">{parsed.payload.surnameSanitized || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Imię (sanityzowane)</dt>
              <dd className="font-medium">{parsed.payload.firstNameSanitized || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Długość nazwiska (checksum)</dt>
              <dd className="font-mono">{parsed.payload.surnameLength}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Punkty</dt>
              <dd className="font-mono text-lg">
                {parsed.payload.points} / {parsed.payload.maxPoints}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Praktyka (laboratorium)</dt>
              <dd>{parsed.payload.labPassed ? 'Zaliczone' : 'Niezaliczone'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Sól (salt)</dt>
              <dd className="font-mono text-xs text-slate-400">{parsed.payload.salt}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Automatyczna ocena (1–6)</dt>
              <dd className="text-lg font-semibold text-blue-200">
                {autoGrade} — {gradeLabel(autoGrade)}
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  )
}
