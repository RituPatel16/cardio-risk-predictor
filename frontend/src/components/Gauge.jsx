import React, { useEffect, useState } from 'react'

// Polar helper: point on a circle for a given angle (degrees, 180=left, 0=right)
function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const start = polar(cx, cy, r, startDeg)
  const end = polar(cx, cy, r, endDeg)
  const largeArc = Math.abs(startDeg - endDeg) > 180 ? 1 : 0
  // sweep-flag=1 traces the arc over the top of the semicircle given our
  // angle convention (180deg=left, 90deg=top, 0deg=right)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export default function Gauge({ probability = 0 }) {
  const [animated, setAnimated] = useState(0)
  const cx = 150
  const cy = 150
  const r = 118

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(probability))
    return () => cancelAnimationFrame(t)
  }, [probability])

  // Gauge sweeps 180deg (left) to 0deg (right) across the semicircle
  const needleAngle = 180 - animated * 180
  const pct = Math.round(probability * 100)

  const color = probability >= 0.66 ? '#D6402C' : probability >= 0.33 ? '#B4790C' : '#17845A'
  const label = probability >= 0.66 ? 'Elevated' : probability >= 0.33 ? 'Moderate' : 'Low'

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 175" width="280" height="163">
        {/* Track segments: low / moderate / elevated */}
        <path d={arcPath(cx, cy, r, 180, 120)} fill="none" stroke="#17845A" strokeOpacity="0.25" strokeWidth="20" strokeLinecap="round" />
        <path d={arcPath(cx, cy, r, 120, 60)} fill="none" stroke="#B4790C" strokeOpacity="0.25" strokeWidth="20" strokeLinecap="round" />
        <path d={arcPath(cx, cy, r, 60, 0)} fill="none" stroke="#D6402C" strokeOpacity="0.25" strokeWidth="20" strokeLinecap="round" />

        {/* Filled progress arc */}
        <path
          d={arcPath(cx, cy, r, 180, 180 - animated * 180)}
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          style={{ transition: 'all 1.4s cubic-bezier(0.22,1,0.36,1)' }}
        />

        {/* Needle: a fixed line pointing right (math-angle 0), rotated by -needleAngle
            (SVG rotate() is clockwise-positive, which points it toward needleAngle
            in our y-up polar convention). Only the group transform animates. */}
        <g className="gauge-needle" style={{ transform: `rotate(${-needleAngle}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <line
            x1={cx}
            y1={cy}
            x2={cx + (r - 30)}
            y2={cy}
            stroke="#0F1B2D"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <circle cx={cx} cy={cy} r="7" fill="#0F1B2D" />
      </svg>

      <div className="-mt-2 text-center">
        <div className="font-mono text-5xl font-semibold tabular" style={{ color }}>
          {pct}%
        </div>
        <div className="mt-1 text-sm font-medium uppercase tracking-wider text-inkmute">
          {label} probability
        </div>
      </div>
    </div>
  )
}
