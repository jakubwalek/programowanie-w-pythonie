import { Check } from 'lucide-react'

type Step = { id: string; label: string }

type Props = {
  steps: Step[]
  currentIndex: number
}

export function Stepper({ steps, currentIndex }: Props) {
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-2 sm:gap-3">
      {steps.map((s, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                done
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : active
                    ? 'border-blue-500/60 bg-blue-600/25 text-blue-100 ring-2 ring-blue-500/30'
                    : 'border-slate-700 bg-slate-900/50 text-slate-500'
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={`hidden text-sm font-medium sm:inline ${active ? 'text-slate-100' : 'text-slate-500'}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-slate-700 sm:block" aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}
