interface SampleVolumeSliderProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export default function SampleVolumeSlider({ value, onChange, disabled }: SampleVolumeSliderProps) {
  const MIN = 100
  const MAX = 1000

  const getLabel = () => {
    if (value < 300) return 'Small Sample'
    if (value < 600) return 'Standard Sample'
    if (value < 850) return 'Large Sample'
    return 'Full Bag Sample'
  }

  const getColor = () => {
    if (value < 300) return 'text-amber-500'
    if (value < 600) return 'text-teal-500'
    return 'text-emerald-500'
  }

  const trackFill = `${((value - MIN) / (MAX - MIN)) * 100}%`

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Sample Volume
        </label>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 ${getColor()}`}>
            {getLabel()}
          </span>
          <span className={`text-lg font-bold tabular-nums ${getColor()}`}>
            {value} ml
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
                background: 'linear-gradient(90deg, #06b6d4, #10b981)',
              }}
            />
          </div>
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={50}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="relative w-full bg-transparent"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Tick labels */}
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 px-0.5">
        <span>100 ml</span>
        <span>300 ml</span>
        <span>500 ml</span>
        <span>750 ml</span>
        <span>1000 ml</span>
      </div>

      {/* Hint text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
        💧 Set the volume of water sampled from the transfer bag. The <span className="font-medium">total stocking count</span> is extrapolated from this relative to the full batch volume (default 10L bag).
      </p>
    </div>
  )
}
