import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, ShieldCheck } from 'lucide-react'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-blue-600/25 text-blue-100 ring-1 ring-blue-500/40'
      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
  }`

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-400/90">Python</p>
            <h1 className="text-lg font-semibold text-slate-50">Instrukcje warunkowe</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/" end className={linkClass}>
              <BookOpen className="h-4 w-4" />
              Karta pracy
            </NavLink>
            <NavLink to="/validator" className={linkClass}>
              <ShieldCheck className="h-4 w-4" />
              Weryfikator
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Karta pracy — if / elif / else — front-end only, bez zapisu na serwerze.
      </footer>
    </div>
  )
}
