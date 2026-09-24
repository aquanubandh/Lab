import { Clock, Cpu, Droplets } from 'lucide-react'
import type { PLCountResult } from './PLOutputFrame'

interface PLAssessmentCardProps {
  result: PLCountResult
  processingMs: number
}

export default function PLAssessmentCard({ result, processingMs }: PLAssessmentCardProps) {
  const { frameCount } = result

  return (
    <div className="space-y-3 animate-slide-up">

      {/* PLs in Frame — single stat card */}
      <div className="rounded-2xl border p-4 flex items-center gap-4 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/50">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 flex-shrink-0">
          <Droplets size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-0.5">PLs in Frame</p>
          <p className="text-3xl font-extrabold text-cyan-700 dark:text-cyan-300">{frameCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Engine meta strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock size={12} />
          <span>Processed in <span className="font-semibold text-slate-700 dark:text-slate-200">{processingMs}ms</span></span>
        </div>
        <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-600 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Cpu size={12} />
          <span>Engine: <span className="font-semibold text-slate-700 dark:text-slate-200">YOLOv26s</span></span>
        </div>
      </div>
    </div>
  )
}
