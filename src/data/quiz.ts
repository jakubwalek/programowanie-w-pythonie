export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  /** Indeks poprawnej odpowiedzi (0-based). */
  correctIndex: number
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Jaki jest wynik wyrażenia 7 == 7 w Pythonie?',
    options: ['True', 'False', '7', 'None'],
    correctIndex: 0,
  },
  {
    id: 'q2',
    question: 'Czy warunek 4 > 9 jest spełniony?',
    options: ['Tak', 'Nie', 'Zależy od kontekstu', 'Błąd składni'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    question: 'Jaki jest wynik porównania "ala" != "ala"?',
    options: ['True', 'False', 'ala', 'SyntaxError'],
    correctIndex: 1,
  },
  {
    id: 'q4',
    question: 'Jaki jest wynik: True and False?',
    options: ['True', 'False', 'None', '1'],
    correctIndex: 1,
  },
  {
    id: 'q5',
    question: 'Jaki jest wynik: False or True?',
    options: ['True', 'False', 'None', '0'],
    correctIndex: 0,
  },
]
