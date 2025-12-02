import { useState, useRef, useCallback, useMemo, type FC } from 'react'
import { useEventListener } from 'usehooks-ts'
import { getRanges, normalizeValue, formatKnobValue } from './logics/knob'
import { calculateTickStep } from './logics/tick'
import { OverlayGuide, OVERLAY_GUIDE_RADIUS } from './OverlayGuide'
import {
  RING_STROKE_WIDTH,
  ACTIVE_COLOR,
  DIFF_COLOR_INCREASE,
  DIFF_COLOR_DECREASE,
  TRACK_COLOR,
} from './defs/config'

const RING_MASK = `radial-gradient(circle, transparent calc(50% - ${RING_STROKE_WIDTH}px), black calc(50% - ${RING_STROKE_WIDTH}px), black 50%, transparent 50%)`

interface ArcComputationResult {
  startAngle: number
  background: string
  baseBoundary: number
  diffBoundary: number
}

const buildArcRendering = (
  min: number,
  max: number,
  range: number,
  startValue: number,
  currentValue: number
): ArcComputationResult => {
  const totalSweep = range * 2
  const startAngle = -range
  const [baseBoundary, diffBoundary] = getRanges(
    min,
    max,
    startValue,
    currentValue
  )
  const baseRatio = normalizeValue(baseBoundary, min, max)
  const diffRatio = normalizeValue(diffBoundary, min, max)
  const baseDegrees = baseRatio * totalSweep
  const diffDegrees = Math.max(0, (diffRatio - baseRatio) * totalSweep)
  const trackDegrees = Math.max(0, totalSweep - baseDegrees - diffDegrees)

  // 値が増えたか減ったかで色を決定
  const diffColor =
    currentValue >= startValue ? DIFF_COLOR_INCREASE : DIFF_COLOR_DECREASE

  const segments: string[] = []
  let cumulative = 0
  const pushSegment = (color: string, degrees: number) => {
    if (degrees <= 0) return
    const from = cumulative
    const to = cumulative + degrees
    segments.push(`${color} ${from}deg ${to}deg`)
    cumulative = to
  }

  pushSegment(ACTIVE_COLOR, baseDegrees)
  pushSegment(diffColor, diffDegrees)
  pushSegment(TRACK_COLOR, trackDegrees)
  pushSegment(TRACK_COLOR, Math.max(0, 360 - cumulative))

  return {
    startAngle,
    background: `conic-gradient(from ${startAngle}deg, ${segments.join(', ')})`,
    baseBoundary,
    diffBoundary,
  }
}

export interface KnobPointerData {
  x: number
  y: number
  dx: number
  dy: number
  angle: number
  distance: number
  tickStep: number
}

interface KnobUIProps {
  value: number
  min: number
  max: number
  disabled?: boolean
  onPointerEvent?: (event: KnobPointerData) => void
  range: number
  step?: number
}

export const KnobUI: FC<KnobUIProps> = ({
  value,
  min,
  max,
  disabled = false,
  onPointerEvent,
  range,
  step = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartValue, setDragStartValue] = useState<number | null>(null)
  const [knobCenter, setKnobCenter] = useState<{ x: number; y: number } | null>(
    null
  )
  const [distance, setDistance] = useState<number>(0)
  const knobRef = useRef<HTMLDivElement>(null)

  // マウス位置を極座標に変換
  const convertToPolar = useCallback(
    (clientX: number, clientY: number): Omit<KnobPointerData, 'tickStep'> | null => {
      if (!knobRef.current) return null

      const rect = knobRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const x = clientX
      const y = clientY
      const dx = clientX - centerX
      const dy = clientY - centerY

      // 極座標に変換（6時方向を起点にする）
      const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI)
      const angle = ((rawAngle - 90 + 360) % 360 + 360) % 360
      const distance = Math.sqrt(dx * dx + dy * dy)

      return { x, y, dx, dy, angle, distance }
    },
    []
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    setDragStartValue(value)

    // ノブの中心座標を計算
    if (knobRef.current) {
      const rect = knobRef.current.getBoundingClientRect()
      setKnobCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }

    const polar = convertToPolar(e.clientX, e.clientY)
    if (polar) {
      setDistance(polar.distance)
      const actualRadius = Math.max(polar.distance, OVERLAY_GUIDE_RADIUS)
      const { tickStep } = calculateTickStep(actualRadius, range, min, max, step)
      onPointerEvent?.({ ...polar, tickStep })
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled) return

      const polar = convertToPolar(e.clientX, e.clientY)
      if (polar) {
        setDistance(polar.distance)
        const actualRadius = Math.max(polar.distance, OVERLAY_GUIDE_RADIUS)
        const { tickStep } = calculateTickStep(actualRadius, range, min, max, step)
        onPointerEvent?.({ ...polar, tickStep })
      }
    },
    [isDragging, disabled, convertToPolar, onPointerEvent, range, min, max, step]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    setDragStartValue(null)
    setKnobCenter(null)
    setDistance(0)
  }, [isDragging])

  useEventListener('mousemove', handleMouseMove)
  useEventListener('mouseup', handleMouseUp)

  const size = 64
  const radius = size / 2 - 10
  const labelDistance = radius + 10
  const createLabelStyle = (targetAngle: number) => {
    const rad = ((targetAngle - 90) * Math.PI) / 180
    const offsetX = Math.cos(rad) * labelDistance
    const offsetY = Math.sin(rad) * labelDistance
    return {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
      fontSize: '9px',
      color: '#666',
      pointerEvents: 'none' as const,
      whiteSpace: 'nowrap' as const,
    }
  }

  const effectiveStartValue = dragStartValue ?? value
  const { background: knobBackground } = buildArcRendering(
    min,
    max,
    range,
    effectiveStartValue,
    value
  )
  const formattedValue = useMemo(
    () => formatKnobValue(value, step),
    [value, step]
  )

  // Calculate optimal tick steps for overlay guide
  const { tickStep, majorTickStep } = useMemo(() => {
    const actualRadius = Math.max(distance, OVERLAY_GUIDE_RADIUS)
    return calculateTickStep(actualRadius, range, min, max, step)
  }, [distance, range, min, max, step])

  return (
    <>
      <div
        ref={knobRef}
        style={{
          width: size,
          height: size,
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* 円形のノブ */}
        <div
          style={{
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            border: '2px solid #333',
            background: knobBackground,
            maskImage: RING_MASK,
            WebkitMaskImage: RING_MASK,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* 値を表示 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '10px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{formattedValue}</div>
        </div>
        <div style={createLabelStyle(-range)}>{min}</div>
        <div style={createLabelStyle(range)}>{max}</div>
      </div>
      {knobCenter && (
        <OverlayGuide
          centerX={knobCenter.x}
          centerY={knobCenter.y}
          distance={distance}
          min={min}
          max={max}
          range={range}
          value={value}
          startValue={dragStartValue ?? value}
          tickStep={tickStep}
          majorTickStep={majorTickStep}
          innerRadius={radius}
          step={step}
        />
      )}
    </>
  )
}

