import type { ClipboardEvent } from 'react'
import { ClipboardList, Lock } from 'lucide-react'
import { LAB_REFERENCE_CODE } from '../data/labReference'

function blockCopy(e: ClipboardEvent) {
  e.preventDefault()
}

/** Blokuje zaznaczanie i kopiowanie — uczeń ma przepisać wzór ręcznie. */
export function LabReferencePanels() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-600/80 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
        <div className="mb-2 flex items-center gap-2 font-medium text-slate-100">
          <ClipboardList className="h-4 w-4 shrink-0 text-blue-400" />
          Jak pracować w tym kroku
        </div>
        <p className="leading-relaxed text-slate-400">
          Odczytaj <strong className="text-slate-200">wzorzec w drugim okienku</strong> i wpisz ten sam program w polu
          „Twój kod” <strong className="text-slate-200">na klawiaturze</strong>. Z wzoru nie można skopiować tekstu —
          ćwiczysz przepisywanie kodu z pamięci lub z obrazka.
        </p>
      </div>

      <div
        className="rounded-2xl border border-amber-500/35 bg-gradient-to-br from-slate-950/90 to-slate-900/60 px-4 py-3 shadow-inner shadow-black/20"
        onCopy={blockCopy}
        onCut={blockCopy}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-100/95">
            <Lock className="h-4 w-4 shrink-0 text-amber-400/90" aria-hidden />
            Wzór do przepisania (nie kopiuj — wpisz samodzielnie)
          </div>
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
            Kopiowanie wyłączone
          </span>
        </div>

        <pre
          className="max-h-[min(40vh,22rem)] overflow-auto select-none rounded-xl border border-slate-700/80 bg-slate-950/90 p-4 font-mono text-[13px] leading-relaxed text-blue-100/95 [user-select:none] [-webkit-user-select:none] [-webkit-touch-callout:none]"
          onCopy={blockCopy}
          onCut={blockCopy}
          onDragStart={(e) => e.preventDefault()}
        >
          {LAB_REFERENCE_CODE}
        </pre>
      </div>
    </div>
  )
}
