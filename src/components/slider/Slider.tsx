import { type FC } from 'react'
import { SliderUI } from './SliderUI'

export interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  disabled?: boolean
}

export const Slider: FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
}) => {
  return (
    <SliderUI
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      disabled={disabled}
    />
  )
}

