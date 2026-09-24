interface ConfidenceSliderProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export default function ConfidenceSlider({ value, onChange, disabled }: ConfidenceSliderProps) {
  const percentage = Math.round(value * 100)

  const getColor = () => {
    if (value < 0.35) return 'text-amber-500'
    if (value < 0.65) return 'text-teal-500'
    return 'text-emerald-500'
  }

  const getLabel = () => {
    if (value < 0.30) return 'Very Sensitive'
    if (value < 0.50) return 'Balanced'
    if (value < 0.70) return 'Conservative'
    return 'High Precision'
  }

  const trackFill = `${((value - 0.10) / (0.90 - 0.10)) * 100}%`

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Confidence Threshold
        </label>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 ${getColor()}`}>
            {getLabel()}
          </span>
          <span className={`text-lg font-bold tabular-nums ${getColor()}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative">
        <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: trackFill,
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              }}
            />
          </div>
        </div>
        <input
          type="range"
          min={0.10}
          max={0.90}
          step={0.01}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative w-full bg-transparent"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Tick labels */}
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 px-0.5">
        <span>0.10</span>
        <span>0.25</span>
        <span>0.50</span>
        <span>0.75</span>
        <span>0.90</span>
      </div>

      {/* Hint text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
        💡 <span className="font-medium">Lower threshold</span> to catch microscopic early spots;{' '}
        <span className="font-medium">raise</span> to eliminate natural shell marking false alarms.
      </p>
    </div>
  )
}
