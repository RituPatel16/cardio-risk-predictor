import React from 'react'
import Gauge from './Gauge.jsx'
import EcgTrace from './EcgTrace.jsx'

const FEATURE_LABELS = {
  age: 'Age', gender: 'Gender', height: 'Height', weight: 'Weight',
  ap_hi: 'Systolic BP', ap_lo: 'Diastolic BP', cholesterol: 'Cholesterol',
  gluc: 'Glucose', smoke: 'Smoking', alco: 'Alcohol', active: 'Activity',
}

export default function ResultPanel({ result, onRestart }) {
  const isHigh = result.prediction === 1
  const amplitude = isHigh ? 1.7 : 0.75
  const color = isHigh ? '#D6402C' : '#17845A'
  const speed = isHigh ? 3 : 6

  return (
    <div className="fade-up">
      <div className="rounded-t-card border border-line bg-panel px-6 pt-5">
        <EcgTrace beats={5} amplitude={amplitude} color={color} scroll speed={speed} height={70} />
      </div>

      <div className="grid gap-6 rounded-b-card border border-t-0 border-line bg-panel p-6 md:grid-cols-[280px_1fr] md:p-8">
        <div className="flex flex-col items-center justify-center">
          <Gauge probability={result.probability} />
          <span
            className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              isHigh ? 'bg-red-soft text-red' : 'bg-green-soft text-green'
            }`}
          >
            {isHigh ? 'Elevated cardiovascular risk' : 'Lower cardiovascular risk'}
          </span>
        </div>

        <div>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat label="BMI" value={result.bmi} sub={result.bmi_category} />
            <MiniStat label="Pulse pressure" value={`${result.pulse_pressure}`} sub="mmHg" />
            <MiniStat label="Model verdict" value={result.risk_label} sub="risk class" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-inkmute">
            What moved this reading most
          </p>
          <div className="space-y-2">
            {result.top_contributors.map((c) => {
              const magnitude = Math.min(Math.abs(c.contribution) / 2, 1)
              const raising = c.contribution > 0
              return (
                <div key={c.feature} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-ink">
                    {FEATURE_LABELS[c.feature] || c.feature}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${magnitude * 100}%`,
                        backgroundColor: raising ? '#D6402C' : '#17845A',
                      }}
                    />
                  </div>
                  <span className={`w-16 shrink-0 text-right text-xs font-mono ${raising ? 'text-red' : 'text-green'}`}>
                    {raising ? 'raises' : 'lowers'}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-inkmute">
            This estimate comes from a logistic regression model trained on the Cardiovascular Disease dataset
            (~62k cleaned records). It is a student / academic project, not a diagnosis — please talk to a
            clinician about your actual cardiovascular health.
          </p>

          <button
            onClick={onRestart}
            className="mt-5 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-blue hover:text-blue"
          >
            Run another reading
          </button>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-line bg-paper/60 px-3 py-2.5">
      <div className="font-mono text-lg font-semibold tabular text-ink">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-inkmute">
        {label} <span className="opacity-70">· {sub}</span>
      </div>
    </div>
  )
}
