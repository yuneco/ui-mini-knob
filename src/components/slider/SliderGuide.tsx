import { type FC, useMemo } from 'react'
import { formatTickLabel, getRanges, normalizeValue } from '../knob/logics/knob'
import { calculateTickStep } from '../knob/logics/tick'
import {
  ACTIVE_COLOR,
  DIFF_COLOR_DECREASE,
  DIFF_COLOR_INCREASE,
  MAJOR_TICK_COLOR,
  TRACK_COLOR,
} from '../knob/defs/config'
import type { GuideMetrics } from './logics/slider'

const GUIDE_BACKGROUND_PADDING_HORIZONTAL = 24
const GUIDE_BACKGROUND_PADDING_VERTICAL = 16

interface SliderGuideProps {
  min: number
  max: number
  value: number
  startValue: number
  metrics: GuideMetrics
  trackLeft: number
  trackWidth: number
  sliderCenterY: number
  step: number
  tickStep: number
  majorTickStep: number
}

export const SliderGuide: FC<SliderGuideProps> = ({
  min,
  max,
  value,
  startValue,
  metrics,
  trackLeft,
  trackWidth,
  sliderCenterY,
  step,
  tickStep,
  majorTickStep,
}) => {
  const effectiveLineWidth = Math.max(metrics.lineWidth, 1)
  const derivedSteps = useMemo(() => {
    if (tickStep > 0 && majorTickStep > 0) {
      return { tickStep, majorTickStep }
    }
    const effectiveRadius = Math.max(effectiveLineWidth / (2 * Math.PI), 1)
    return calculateTickStep(effectiveRadius, 180, min, max, step)
  }, [tickStep, majorTickStep, effectiveLineWidth, min, max, step])
  const effectiveTickStep = derivedSteps.tickStep > 0 ? derivedSteps.tickStep : step
  const effectiveMajorTick =
    derivedSteps.majorTickStep > 0 ? derivedSteps.majorTickStep : effectiveTickStep * 10

  const diffColor = value >= startValue ? DIFF_COLOR_INCREASE : DIFF_COLOR_DECREASE

  const [lowerBoundary, upperBoundary] = getRanges(min, max, startValue, value)
  const lowerX =
    metrics.lineLeft +
    normalizeValue(lowerBoundary, min, max) * effectiveLineWidth
  const upperX =
    metrics.lineLeft +
    normalizeValue(upperBoundary, min, max) * effectiveLineWidth

  const trackValueX =
    trackLeft + normalizeValue(value, min, max) * Math.max(trackWidth, 1)
  const guideValueX =
    metrics.lineLeft +
    normalizeValue(value, min, max) * effectiveLineWidth

  const sliderValueLine = (
    <line
      x1={trackValueX}
      y1={sliderCenterY}
      x2={guideValueX}
      y2={metrics.lineY}
      stroke="#999"
      strokeWidth={2}
    />
  )

  const tickElements = []
  const labelElements = []

  const tickCount =
    effectiveTickStep > 0 ? Math.floor((max - min) / effectiveTickStep) + 1 : 0
  const majorInterval =
    effectiveTickStep > 0
      ? Math.max(1, Math.round(effectiveMajorTick / effectiveTickStep))
      : 1

  for (let i = 0; i < tickCount; i++) {
    const tickValue = min + i * effectiveTickStep
    if (tickValue > max + tickStep * 0.5) break

    const ratio = normalizeValue(tickValue, min, max)
    const x = metrics.lineLeft + ratio * effectiveLineWidth
    const isMajor = i % majorInterval === 0
    const tickLength = isMajor ? 12 : 8
    const half = tickLength / 2

    tickElements.push(
      <line
        key={`tick-${i}`}
        x1={x}
        y1={metrics.lineY - half}
        x2={x}
        y2={metrics.lineY + half}
        stroke={isMajor ? MAJOR_TICK_COLOR : '#999'}
        strokeWidth={isMajor ? 2 : 1}
      />
    )

    if (isMajor) {
      const labelOffset = metrics.direction === 'down' ? -(half + 12) : half + 12
      labelElements.push(
        <text
          key={`label-${i}`}
          x={x}
          y={metrics.lineY + labelOffset}
          fontSize={10}
          fill="#666"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {formatTickLabel(tickValue, step)}
        </text>
      )
    }
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: metrics.lineLeft - GUIDE_BACKGROUND_PADDING_HORIZONTAL,
          top: metrics.lineY - GUIDE_BACKGROUND_PADDING_VERTICAL,
          width: metrics.lineWidth + GUIDE_BACKGROUND_PADDING_HORIZONTAL * 2,
          height: GUIDE_BACKGROUND_PADDING_VERTICAL * 2,
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          pointerEvents: 'none',
          zIndex: 999,
        }}
      />
      <svg
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: metrics.viewportWidth,
          height: metrics.viewportHeight,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
        viewBox={`0 0 ${metrics.viewportWidth} ${metrics.viewportHeight}`}
      >
        {sliderValueLine}
        <line
          x1={metrics.lineLeft}
          y1={metrics.lineY}
          x2={metrics.lineRight}
          y2={metrics.lineY}
          stroke={TRACK_COLOR}
          strokeWidth={4}
        />
        <line
          x1={metrics.lineLeft}
          y1={metrics.lineY}
          x2={lowerX}
          y2={metrics.lineY}
          stroke={ACTIVE_COLOR}
          strokeWidth={4}
        />
        <line
          x1={lowerX}
          y1={metrics.lineY}
          x2={upperX}
          y2={metrics.lineY}
          stroke={diffColor}
          strokeWidth={4}
        />
        {tickElements}
        {labelElements}
        <circle
          cx={guideValueX}
          cy={metrics.lineY}
          r={6}
          fill={ACTIVE_COLOR}
          stroke="#fff"
          strokeWidth={2}
        />
      </svg>
    </>
  )
}

