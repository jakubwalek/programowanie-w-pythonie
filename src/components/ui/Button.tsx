import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 border border-blue-500/30',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/60',
  ghost: 'bg-transparent hover:bg-slate-800/80 text-slate-200 border border-transparent',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: Variant
}

export function Button({ children, variant = 'primary', className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
