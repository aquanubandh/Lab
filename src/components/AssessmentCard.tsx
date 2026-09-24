import { AlertTriangle, CheckCircle2, Clock, Cpu, ShieldAlert } from 'lucide-react'
import type { ApiResponse } from '../pages/AppPage'

interface AssessmentCardProps {
  apiResponse: ApiResponse
  processingMs: number
}

const DISEASE_INFO: Record<string, { fullName: string; desc: string }> = {
  WSSV: {
    fullName: 'White Spot Syndrome Virus',
    desc: 'Highly contagious viral disease. Immediate quarantine recommended. Remove affected shrimp and treat pond with approved biosecurity protocols.',
  },
  BGD: {
    fullName: 'Black Gill Disease',
    desc: 'Caused by fungi or bacteria. Leads to blackened gills and respiratory distress. Improve aeration and water quality.',
  },
  BSD: {
    fullName: 'Black Spot Disease',
    desc: 'Shell disease caused by bacterial infection, leading to melanized lesions. Enhance water quality.',
  },
  'Early Mortality': {
    fullName: 'Acute Hepatopancreatic Necrosis (AHPND)',
    desc: 'Associated with Vibrio parahaemolyticus. Drain and disinfect pond. Contact local fisheries authority.',
  },
}

export default function AssessmentCard({ apiResponse, processingMs }: AssessmentCardProps) {
  const isHealthy = apiResponse.result === 'unknown'
  const diseases = apiResponse.diseases_detected || []
  const confidences = apiResponse.confidences || []

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Status banner */}
      {isHealthy ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
              Condition Status: Shrimp Appears Healthy
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
              No anomalies found. Routine monitoring recommended.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800/60">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
              ⚠ Active Infection Detected
            </p>
            <div className="mt-2 space-y-2">
              {diseases.map((d, i) => (
                <div key={i} className="p-3 rounded-xl bg-red-100/80 dark:bg-red-900/40 border border-red-200 dark:border-red-800/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle size={13} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span className="font-bold text-red-800 dark:text-red-200 text-sm">
                      Detected: {d}
                    </span>
                    {confidences[i] !== undefined && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">
                        {confidences[i].toFixed(2)}%
                      </span>
                    )}
                  </div>
                  {DISEASE_INFO[d] && (
                    <div className="mt-2 space-y-0.5">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                        {DISEASE_INFO[d].fullName}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                        {DISEASE_INFO[d].desc}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Engine meta strip */}
      <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock size={12} />
          <span>Processed in <span className="font-semibold text-slate-700 dark:text-slate-200">{processingMs}ms</span></span>
        </div>
        <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-600" />
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Cpu size={12} />
          <span>Engine: <span className="font-semibold text-slate-700 dark:text-slate-200">YOLOv11s Custom Core</span></span>
        </div>
      </div>
    </div>
  )
}
