import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: Props) {
  return (
    <div
      className={`rounded-3xl border border-slate-700/50 bg-slate-900/60 p-6 shadow-xl shadow-blue-950/20 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}
