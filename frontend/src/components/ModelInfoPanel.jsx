import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

const FEATURE_LABELS = {
  age: 'Age',
  gender: 'Gender',
  height: 'Height',
  weight: 'Weight',
  ap_hi: 'Systolic BP',
  ap_lo: 'Diastolic BP',
  cholesterol: 'Cholesterol',
  gluc: 'Glucose',
  smoke: 'Smoking',
  alco: 'Alcohol',
  active: 'Activity',
}

export default function ModelInfoPanel({ metrics }) {
  if (!metrics || !metrics.accuracy) {
    return <p className="text-sm text-inkmute">Model diagnostics unavailable — is the backend running?</p>
  }

  const cm = metrics.confusion_matrix // [[TN, FP], [FN, TP]]
  const importance = (metrics.feature_importance || []).map((d) => ({
    name: FEATURE_LABELS[d.feature] || d.feature,
    value: d.coefficient,
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <Stat label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} />
          <Stat label="AUC (ROC)" value={metrics.auc?.toFixed(3)} />
          <Stat label="Training rows" value={metrics.train_rows?.toLocaleString()} />
          <Stat label="Test rows" value={metrics.test_rows?.toLocaleString()} />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-inkmute">Confusion matrix</p>
        {cm && (
          <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
            <CmCell label="True Negative" value={cm[0][0]} tone="green" />
            <CmCell label="False Positive" value={cm[0][1]} tone="amber" />
            <CmCell label="False Negative" value={cm[1][0]} tone="amber" />
            <CmCell label="True Positive" value={cm[1][1]} tone="green" />
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-inkmute">ROC curve</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={metrics.roc_curve}>
            <CartesianGrid stroke="#D3DAE3" strokeDasharray="3 3" />
            <XAxis dataKey="fpr" tick={{ fontSize: 10, fill: '#5B6B82' }} tickFormatter={(v) => v.toFixed(1)} />
            <YAxis dataKey="tpr" tick={{ fontSize: 10, fill: '#5B6B82' }} tickFormatter={(v) => v.toFixed(1)} />
            <Tooltip formatter={(v) => v.toFixed(3)} />
            <Line type="monotone" dataKey="tpr" stroke="#2456A6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-inkmute">
          Feature influence (standardized coefficients)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={importance} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid stroke="#D3DAE3" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#5B6B82' }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#0F1B2D' }} />
            <Tooltip formatter={(v) => v.toFixed(3)} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {importance.map((d, i) => (
                <Cell key={i} fill={d.value >= 0 ? '#D6402C' : '#17845A'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2">
      <div className="font-mono text-xl font-semibold text-ink tabular">{value ?? '—'}</div>
      <div className="text-[11px] uppercase tracking-wide text-inkmute">{label}</div>
    </div>
  )
}

function CmCell({ label, value, tone }) {
  const toneClasses = tone === 'green' ? 'border-green/30 bg-green-soft text-green' : 'border-amber/30 bg-amber-soft text-amber'
  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClasses}`}>
      <div className="text-lg font-semibold tabular">{value}</div>
      <div className="text-[10px] font-sans uppercase tracking-wide opacity-80">{label}</div>
    </div>
  )
}
