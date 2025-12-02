import { useCallback, type FC } from 'react'
import { getValueFromRelativePosition } from './logics/knob'
import { KnobUI, type KnobPointerData } from './KnobUI'

interface KnobProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  disabled?: boolean
  range?: number
}

export const Knob: FC<KnobProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  range = 135,
}) => {
  const handlePointerEvent = useCallback(
    (event: KnobPointerData) => {
      const newValue = getValueFromRelativePosition(
        event.dx,
        event.dy,
        min,
        max,
        event.tickStep,
        range
      )
      onChange?.(newValue)
    },
    [min, max, range, onChange]
  )

  return (
    <KnobUI
      value={value}
      min={min}
      max={max}
      range={range}
      disabled={disabled}
      step={step}
      onPointerEvent={handlePointerEvent}
    />
  )
}

