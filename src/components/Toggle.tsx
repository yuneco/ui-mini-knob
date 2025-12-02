import { type FC } from 'react'
import { ACTIVE_COLOR, TRACK_COLOR } from './knob/defs/config'

interface ToggleProps {
  value: boolean
  onChange: (value: boolean) => void
  leftLabel?: string
  rightLabel?: string
}

export const Toggle: FC<ToggleProps> = ({
  value,
  onChange,
  leftLabel,
  rightLabel,
}) => {
  const handleClick = () => {
    onChange(!value)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={handleClick}
    >
      {leftLabel && (
        <span
          style={{
            fontSize: '12px',
            color: value ? '#333' : '#999',
            fontWeight: value ? 600 : 400,
            transition: 'all 0.2s ease',
          }}
        >
          {leftLabel}
        </span>
      )}
      <div
        style={{
          width: 40,
          height: 20,
          borderRadius: 14,
          backgroundColor: TRACK_COLOR,
          border: '2px solid #ddd',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: '#fff',
            position: 'absolute',
            top: '50%',
            left: value ? '3px' : 'calc(100% - 17px)',
            transform: 'translateY(-50%)',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          }}
        />
      </div>
      {rightLabel && (
        <span
          style={{
            fontSize: '12px',
            color: value ? '#999' : '#333',
            fontWeight: value ? 400 : 600,
            transition: 'all 0.2s ease',
          }}
        >
          {rightLabel}
        </span>
      )}
    </div>
  )
}

