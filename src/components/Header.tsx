import { Moon, Sun, Share2 } from 'lucide-react'

interface HeaderProps {
  dark: boolean
  setDark: (v: boolean) => void
  onShare?: () => void
  showShare?: boolean
}

export default function Header({ dark, setDark, onShare, showShare = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-200/60 dark:border-slate-700/60 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Brand */}
        <a href="/lab" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-200 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Aquanubandh Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:opacity-80 transition-opacity">
            Aquanubandh
          </span>
        </a>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {showShare && (
            <button
              onClick={onShare}
              title="Share as PDF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                         bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                         dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60
                         transition-all duration-200 active:scale-95"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Share PDF</span>
            </button>
          )}

          <button
            onClick={() => setDark(!dark)}
            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                       bg-slate-100 text-slate-600 hover:bg-slate-200
                       dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                       transition-all duration-200 active:scale-95"
          >
            {dark
              ? <Sun size={18} className="text-amber-400" />
              : <Moon size={18} />
            }
          </button>
        </div>
      </div>
    </header>
  )
}
