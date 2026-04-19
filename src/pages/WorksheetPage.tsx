import { useMemo, useState, type KeyboardEvent } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  Code2,
  GraduationCap,
  Lightbulb,
} from 'lucide-react'
import { Stepper } from '../components/Stepper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { AgeGateSimulator } from '../components/AgeGateSimulator'
import { LabReferencePanels } from '../components/LabReferencePanels'
import { QUIZ_QUESTIONS } from '../data/quiz'
import { encodeToken } from '../lib/token'
import { LAB_MAX, QUIZ_MAX, SIMULATOR_BONUS, TOTAL_MAX } from '../lib/scoring'
import { gradeLabel, scoreToGrade } from '../lib/grade'
import { passesSimulatorSuite, validateLabSyntax } from '../lib/pythonIfLab'

const STEPS = [
  { id: 'reg', label: 'Dane' },
  { id: 'intro', label: 'Teoria' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'lab', label: 'Laboratorium' },
  { id: 'result', label: 'Wynik' },
]

export function WorksheetPage() {
  const [step, setStep] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [className, setClassName] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [code, setCode] = useState('')

  const quizScore = useMemo(() => {
    let n = 0
    for (const q of QUIZ_QUESTIONS) {
      if (answers[q.id] === q.correctIndex) n += 1
    }
    return n
  }, [answers])

  const labValidation = useMemo(() => validateLabSyntax(code), [code])
  const labPoints = labValidation.valid ? LAB_MAX : 0
  const simBonus = useMemo(() => (passesSimulatorSuite(code) ? SIMULATOR_BONUS : 0), [code])
  const totalPoints = quizScore + labPoints + simBonus
  const token = useMemo(() => {
    if (step < 4) return ''
    return encodeToken({
      className,
      surname,
      firstName,
      points: totalPoints,
      maxPoints: TOTAL_MAX,
      labPassed: labValidation.valid,
    })
  }, [step, className, surname, firstName, totalPoints, labValidation.valid])

  const grade = scoreToGrade(totalPoints, TOTAL_MAX)

  const canProceedReg = firstName.trim().length >= 2 && surname.trim().length >= 2 && className.trim().length >= 1
  const quizComplete = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined)

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token)
    } catch {
      /* ignore */
    }
  }

  const handleCodeKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()

    const el = e.currentTarget
    const value = code
    const start = el.selectionStart
    const end = el.selectionEnd
    const TAB = '    '

    // Shift+Tab: odejmij jedno wcięcie (do 4 spacji) z każdej zaznaczonej linii.
    if (e.shiftKey) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const lineEnd = value.indexOf('\n', end)
      const selectionEnd = lineEnd === -1 ? value.length : lineEnd
      const selected = value.slice(lineStart, selectionEnd)
      const lines = selected.split('\n')

      let removedFirstLine = 0
      let removedBeforeEnd = 0
      const outLines = lines.map((line, i) => {
        const m = line.match(/^ {1,4}/)
        const removeCount = m ? m[0].length : 0
        if (removeCount > 0) {
          if (i === 0) removedFirstLine = removeCount
          removedBeforeEnd += removeCount
        }
        return line.slice(removeCount)
      })

      const replaced = outLines.join('\n')
      setCode(value.slice(0, lineStart) + replaced + value.slice(selectionEnd))

      const newStart = Math.max(lineStart, start - removedFirstLine)
      const newEnd = Math.max(newStart, end - removedBeforeEnd)
      queueMicrotask(() => {
        el.selectionStart = newStart
        el.selectionEnd = newEnd
      })
      return
    }

    // Tab bez zaznaczenia: wstaw 4 spacje w miejscu kursora.
    if (start === end) {
      const next = value.slice(0, start) + TAB + value.slice(end)
      setCode(next)
      const pos = start + TAB.length
      queueMicrotask(() => {
        el.selectionStart = pos
        el.selectionEnd = pos
      })
      return
    }

    // Tab z zaznaczeniem: dodaj jedno wcięcie do każdej zaznaczonej linii.
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', end)
    const selectionEnd = lineEnd === -1 ? value.length : lineEnd
    const selected = value.slice(lineStart, selectionEnd)
    const indented = selected
      .split('\n')
      .map((line) => `${TAB}${line}`)
      .join('\n')

    setCode(value.slice(0, lineStart) + indented + value.slice(selectionEnd))

    const lineCount = selected.split('\n').length
    const newStart = start + TAB.length
    const newEnd = end + lineCount * TAB.length
    queueMicrotask(() => {
      el.selectionStart = newStart
      el.selectionEnd = newEnd
    })
  }

  return (
    <div>
      <Stepper steps={STEPS} currentIndex={step} />

      {step === 0 && (
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Start</h2>
              <p className="text-sm text-slate-400">Wpisz swoje dane — zostaną zakodowane w tokenie wyniku.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">Imię</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-2xl border border-slate-600 bg-slate-950/80 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50"
                autoComplete="given-name"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">Nazwisko</span>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="rounded-2xl border border-slate-600 bg-slate-950/80 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50"
                autoComplete="family-name"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-slate-400">Klasa</span>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="np. 8a"
                className="rounded-2xl border border-slate-600 bg-slate-950/80 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <Button disabled={!canProceedReg} onClick={() => setStep(1)}>
              Dalej
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-amber-400" />
            <h2 className="text-xl font-semibold">Instrukcje warunkowe: if, elif, else</h2>
          </div>
          <div className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed text-slate-300">
            <p>
              Instrukcja <code className="rounded bg-slate-800 px-1.5 py-0.5 text-blue-300">if</code> pozwala
              wykonać fragment kodu tylko wtedy, gdy warunek jest spełniony. Po słowie{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5">if</code> podajesz warunek, a na końcu linii
              musi znaleźć się <strong className="text-slate-100">dwukropek (:)</strong>.
            </p>
            <p>
              Linie wewnątrz bloku <code className="rounded bg-slate-800 px-1.5 py-0.5">if</code> muszą być
              wcięte (zwykle 4 spacje). To samo dotyczy <code className="rounded bg-slate-800 px-1.5 py-0.5">elif</code>{' '}
              i <code className="rounded bg-slate-800 px-1.5 py-0.5">else</code>.
            </p>
            <pre className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950/80 p-4 font-mono text-xs text-blue-200">
{`if temperatura > 30:
    print("Gorąco")
elif temperatura < 5:
    print("Zimno")
else:
    print("Umiarkowanie")`}
            </pre>
            <p className="text-slate-400">
              <code className="text-emerald-300">elif</code> to skrót od „else if” — kolejny warunek, jeśli
              poprzednie nie zadziałały. Gałąź <code className="text-emerald-300">else</code> wykonuje się, gdy
              żaden wcześniejszy warunek nie był prawdziwy.
            </p>
          </div>
          <div className="mt-6 flex justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Wstecz
            </Button>
            <Button onClick={() => setStep(2)}>
              Przejdź do quizu
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="mb-2 text-xl font-semibold">Quiz — operatory</h2>
          <p className="mb-6 text-sm text-slate-400">
            Pięć pytań, każde warte <strong className="text-slate-200">1 punkt</strong> (max {QUIZ_MAX}).
          </p>
          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, qi) => (
              <div key={q.id} className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4">
                <p className="mb-3 font-medium text-slate-100">
                  {qi + 1}. {q.question}
                </p>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                        answers[q.id] === oi
                          ? 'border-blue-500/50 bg-blue-600/15'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        className="accent-blue-500"
                        name={q.id}
                        checked={answers[q.id] === oi}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Wstecz
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Punkty z quizu: {quizScore}/{QUIZ_MAX}</span>
              <Button disabled={!quizComplete} onClick={() => setStep(3)}>
                Laboratorium
                <Code2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <h2 className="mb-2 text-xl font-semibold">Laboratorium — wiek i dostęp</h2>
            <p className="mb-4 text-sm text-slate-400">
              Napisz program: jeśli wiek &gt;= 18, wypisz <strong className="text-slate-200">„Dostęp przyznany”</strong>
              , w przeciwnym razie <strong className="text-slate-200">„Brak dostępu”</strong>. Użyj{' '}
              <code className="rounded bg-slate-800 px-1 text-xs">if</code> i{' '}
              <code className="rounded bg-slate-800 px-1 text-xs">else</code>, pamiętaj o dwukropku i wcięciach.
            </p>

            <LabReferencePanels />

            <label className="mt-6 flex flex-col gap-2 text-sm">
              <span className="text-slate-400">Twój kod (Python)</span>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                spellCheck={false}
                rows={12}
                placeholder="Wpisz tutaj program, przepisując wzór z ramki powyżej…"
                className="font-mono text-sm rounded-2xl border border-slate-600 bg-slate-950/90 p-4 leading-relaxed text-blue-100 outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/40"
              />
            </label>
            {labValidation.valid ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Składnia OK — max {LAB_MAX} pkt za laboratorium.
              </div>
            ) : (
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-amber-200/90">
                {labValidation.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Symulator bonusowy: +{SIMULATOR_BONUS} pkt, jeśli kod przechodzi testy dla wieków 20, 15 i 18.
            </p>
          </Card>

          <AgeGateSimulator code={code} />

          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Wstecz
            </Button>
            <Button onClick={() => setStep(4)}>
              Generuj wynik i token
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Podsumowanie</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
              <dt className="text-slate-500">Uczeń</dt>
              <dd className="font-medium text-slate-100">
                {firstName} {surname}, klasa {className}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
              <dt className="text-slate-500">Ocena (skala 1–6)</dt>
              <dd className="text-lg font-semibold text-blue-200">
                {grade} — {gradeLabel(grade)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
              <dt className="text-slate-500">Punkty łącznie</dt>
              <dd className="font-mono text-lg text-slate-100">
                {totalPoints} / {TOTAL_MAX}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
              <dt className="text-slate-500">Rozkład</dt>
              <dd className="text-slate-300">
                Quiz {quizScore}/{QUIZ_MAX}, laboratorium {labPoints}/{LAB_MAX}, symulator {simBonus}/
                {SIMULATOR_BONUS}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <p className="mb-2 text-sm text-slate-400">Token wyniku (wyślij nauczycielowi)</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <div className="flex-1 break-all rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 font-mono text-xs text-blue-100">
                {token}
              </div>
              <Button variant="secondary" className="shrink-0" onClick={copyToken}>
                <ClipboardCopy className="h-4 w-4" />
                Kopiuj
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setStep(3)}>
              Wróć do kodu
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStep(0)
                setAnswers({})
                setCode('')
              }}
            >
              Zacznij od nowa
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
