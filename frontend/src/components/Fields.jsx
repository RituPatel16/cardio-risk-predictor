import React from 'react'

export function NumberField({ label, unit, value, onChange, min, max, step = 1, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5 flex items-center rounded-lg border border-line bg-white focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/20">
        <input
          type="number"
          className="w-full rounded-lg bg-transparent px-3 py-2.5 font-mono text-lg tabular text-ink outline-none"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
        {unit && <span className="pr-3 text-sm text-inkmute">{unit}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-inkmute">{hint}</span>}
    </label>
  )
}

export function OptionPicker({ label, value, onChange, options }) {
  return (
    <div>
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              value === opt.value
                ? 'border-blue bg-blue text-white'
                : 'border-line bg-white text-ink hover:border-blue/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
