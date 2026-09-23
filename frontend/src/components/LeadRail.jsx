import React from 'react'

export default function LeadRail({ steps, activeIndex }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {steps.map((step, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
        return (
          <div
            key={step.lead}
            className={`flex flex-1 min-w-[110px] items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
              state === 'active'
                ? 'border-blue bg-blue-soft'
                : state === 'done'
                ? 'border-green/40 bg-green-soft'
                : 'border-line bg-white'
            }`}
          >
            <span
              className={`font-mono text-[11px] font-semibold uppercase tracking-wide ${
                state === 'active' ? 'text-blue' : state === 'done' ? 'text-green' : 'text-inkmute'
              }`}
            >
              {step.lead}
            </span>
            <span className="text-xs text-inkmute">·</span>
            <span className={`text-xs font-medium ${state === 'pending' ? 'text-inkmute' : 'text-ink'}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
