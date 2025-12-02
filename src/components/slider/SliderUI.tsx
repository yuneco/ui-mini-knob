import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FC,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { useEventListener } from 'usehooks-ts'
import {
  formatKnobValue,
  getRanges,
  normalizeValue,
} from '../knob/logics/knob'
import {
  ACTIVE_COLOR,
  DIFF_COLOR_DECREASE,
  DIFF_COLOR_INCREASE,
  TRACK_COLOR,
} from '../knob/defs/config'
import { calculateTickStep } from '../knob/logics/tick'
import { SliderGuide } from './SliderGuide'
import {
  BASE_GUIDE_OFFSET,
  computeGuideMetrics,
  snapToStep,
  type GuideMetrics,
  type GuideDirection,
} from './logics/slider'

const SLIDER_TRACK_WIDTH = 32
const SLIDER_CONTAINER_HEIGHT = 32
const SLIDER_TRACK_THICKNESS = 4

interface SliderUIProps {
  value: number
  min: number
  max: number
  step: number
  onChange?: (value: number) => void
  disabled?: boolean
}

interface GuideOverlayState {
  metrics: GuideMetrics
  trackLeft: number
  trackWidth: number
  sliderCenterY: number
  tickStep: number
  majorTickStep: number
}

const clampValue = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max)

export const SliderUI: FC<SliderUIProps> = ({
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartValue, setDragStartValue] = useState<number | null>(null)
  const [guideState, setGuideState] = useState<GuideOverlayState | null>(null)

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const sliderCenterY = rect.top + rect.height / 2
      const pointerDistanceVertical = Math.abs(clientY - sliderCenterY)
      const viewportWidth =
        typeof window !== 'undefined' ? window.innerWidth : rect.width
      const viewportHeight =
        typeof window !== 'undefined' ? window.innerHeight : rect.bottom + 200
      const direction: GuideDirection =
        typeof window !== 'undefined' && sliderCenterY > window.innerHeight / 2
          ? 'up'
          : 'down'
      const distance = Math.max(pointerDistanceVertical, BASE_GUIDE_OFFSET)
      const metrics = computeGuideMetrics(
        rect,
        distance,
        direction,
        viewportWidth,
        viewportHeight
      )

      const guideRatio =
        metrics.lineWidth <= 0
          ? 0
          : Math.min(
              Math.max(
                (clientX - metrics.lineLeft) / metrics.lineWidth,
                0
              ),
              1
            )
      const rawValue = min + guideRatio * (max - min)

      const effectiveRadius = Math.max(metrics.lineWidth / (2 * Math.PI), 1)
      const { tickStep, majorTickStep } = calculateTickStep(
        effectiveRadius,
        180,
        min,
        max,
        step
      )
      const appliedTickStep = tickStep > 0 ? tickStep : step
      const snappedValue = clampValue(
        min + snapToStep(rawValue - min, appliedTickStep),
        min,
        max
      )
      onChange?.(snappedValue)

      setGuideState({
        metrics,
        trackLeft: rect.left,
        trackWidth: rect.width,
        sliderCenterY,
        tickStep,
        majorTickStep,
      })
    },
    [disabled, max, min, onChange, step]
  )

  const handleMouseDown = (event: ReactMouseEvent) => {
    if (disabled) return
    event.preventDefault()
    setIsDragging(true)
    setDragStartValue(value)
    updateFromPointer(event.clientX, event.clientY)
  }

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || disabled) return
      updateFromPointer(event.clientX, event.clientY)
    },
    [disabled, isDragging, updateFromPointer]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    setDragStartValue(null)
    setGuideState(null)
  }, [isDragging])

  useEventListener('mousemove', handleMouseMove)
  useEventListener('mouseup', handleMouseUp)

  const effectiveStartValue = dragStartValue ?? value
  const [lowerBoundary, upperBoundary] = useMemo(
    () => getRanges(min, max, effectiveStartValue, value),
    [effectiveStartValue, max, min, value]
  )
  const baseRatio = normalizeValue(lowerBoundary, min, max)
  const diffRatio = normalizeValue(upperBoundary, min, max)
  const diffColor =
    value >= effectiveStartValue ? DIFF_COLOR_INCREASE : DIFF_COLOR_DECREASE
  const formattedValue = useMemo(
    () => formatKnobValue(value, step),
    [value, step]
  )

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: disabled ? 'not-allowed' : 'grab',
          userSelect: 'none',
        }}
      >
        <div
          ref={sliderRef}
          style={{
            width: SLIDER_TRACK_WIDTH,
            height: SLIDER_CONTAINER_HEIGHT,
            position: 'relative',
          }}
          onMouseDown={handleMouseDown}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#222',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {formattedValue}
          </div>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: SLIDER_TRACK_THICKNESS,
              borderRadius: SLIDER_TRACK_THICKNESS / 2,
              backgroundColor: TRACK_COLOR,
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: `${baseRatio * 100}%`,
              height: SLIDER_TRACK_THICKNESS,
              backgroundColor: ACTIVE_COLOR,
              transform: 'translateY(-50%)',
              borderTopLeftRadius: SLIDER_TRACK_THICKNESS / 2,
              borderBottomLeftRadius: SLIDER_TRACK_THICKNESS / 2,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${baseRatio * 100}%`,
              width: `${Math.max(0, diffRatio - baseRatio) * 100}%`,
              height: SLIDER_TRACK_THICKNESS,
              backgroundColor: diffColor,
              transform: 'translateY(-50%)',
              borderTopRightRadius:
                diffRatio >= 1 ? SLIDER_TRACK_THICKNESS / 2 : 0,
              borderBottomRightRadius:
                diffRatio >= 1 ? SLIDER_TRACK_THICKNESS / 2 : 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: '#666',
              pointerEvents: 'none',
            }}
          >
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
      {guideState && (
        <SliderGuide
          min={min}
          max={max}
          value={value}
          startValue={effectiveStartValue}
          metrics={guideState.metrics}
          trackLeft={guideState.trackLeft}
          trackWidth={guideState.trackWidth}
          sliderCenterY={guideState.sliderCenterY}
          step={step}
          tickStep={guideState.tickStep}
          majorTickStep={guideState.majorTickStep}
        />
      )}
    </>
  )
}

