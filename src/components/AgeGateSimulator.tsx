import { useState } from 'react'
import { ShieldCheck, ShieldAlert, FlaskConical } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { simulateLabAge, validateLabSyntax } from '../lib/pythonIfLab'

type Props = {
  code: string
}

export function AgeGateSimulator({ code }: Props) {
  const [ageInput, setAgeInput] = useState('17')
  const [lastMsg, setLastMsg] = useState<string | null>(null)
  const [lastOk, setLastOk] = useState<boolean | null>(null)

  const run = () => {
    const n = Number(ageInput.trim())
    if (!Number.isFinite(n) || n < 0 || n > 120) {
      setLastMsg('Podaj sensowny wiek (0–120).')
      setLastOk(false)
      return
    }
    const syntax = validateLabSyntax(code)
    if (!syntax.valid) {
      setLastMsg('Najpierw popraw kod — symulator wymaga zaliczonej składni.')
      setLastOk(false)
      return
    }
    const res = simulateLabAge(code, n)
    setLastOk(res.ok)
    setLastMsg(res.ok ? `Symulacja OK. Wynik: „${res.output ?? ''}”.` : res.error ?? 'Błąd symulacji.')
  }

  return (
    <Card className="border-blue-500/20">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
          <FlaskConical className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Bramka kontrolna</h3>
          <p className="text-sm text-slate-400">
            Wpisz testowy wiek — sprawdzimy, czy Twój program wybrałby właściwy komunikat.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-slate-400">Testowy wiek</span>
          <input
            type="number"
            min={0}
            max={120}
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value)}
            className="rounded-2xl border border-slate-600 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none ring-blue-500/0 transition focus:ring-2"
          />
        </label>
        <Button onClick={run} className="shrink-0">
          Uruchom symulację
        </Button>
      </div>

      {lastMsg && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            lastOk
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-100'
          }`}
        >
          {lastOk ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          )}
          <span>{lastMsg}</span>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Bonus +1 pkt jest przyznawany, gdy kod przechodzi walidację i symulacja działa poprawnie dla
        wieków 20, 15 i 18.
      </p>
    </Card>
  )
}
