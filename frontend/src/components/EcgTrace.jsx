import React from 'react'

/**
 * A single heartbeat waveform unit, roughly: flat -> P wave -> flat -> QRS spike -> T wave -> flat.
 * `amplitude` scales the QRS spike height (used to convey calm vs. elevated risk).
 */
function buildBeatPath(startX, amplitude = 1) {
  const baseline = 40
  const spike = 34 * amplitude
  return [
    `M ${startX} ${baseline}`,
    `L ${startX + 18} ${baseline}`,
    `Q ${startX + 24} ${baseline - 8} ${startX + 30} ${baseline}`, // P wave
    `L ${startX + 42} ${baseline}`,
    `L ${startX + 48} ${baseline + 6}`,
    `L ${startX + 54} ${baseline - spike}`, // R spike
    `L ${startX + 60} ${baseline + 10}`,
    `L ${startX + 66} ${baseline}`,
    `L ${startX + 76} ${baseline}`,
    `Q ${startX + 86} ${baseline - 14} ${startX + 96} ${baseline}`, // T wave
    `L ${startX + 120} ${baseline}`,
  ].join(' ')
}

export default function EcgTrace({
  beats = 6,
  amplitude = 1,
  color = '#2456A6',
  height = 80,
  animateDraw = true,
  scroll = false,
  speed = 6,
  className = '',
}) {
  let d = ''
  for (let i = 0; i < beats; i++) {
    d += buildBeatPath(i * 120, amplitude) + ' '
  }
  const width = beats * 120

  return (
    <div className={`overflow-hidden ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${width} 80`}
        width={scroll ? width * 2 : width}
        height={height}
        preserveAspectRatio="none"
        className={scroll ? 'ecg-scroll' : ''}
        style={scroll ? { animationDuration: `${speed}s`, width: '200%' } : { width: '100%' }}
      >
        <path
          d={scroll ? d + d.replace(/M [\d.]+/, `M ${width}`) : d}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animateDraw ? 'ecg-draw' : ''}
        />
      </svg>
    </div>
  )
}
