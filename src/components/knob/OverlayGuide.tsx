import type { FC } from 'react'
import {
  ACTIVE_COLOR,
  DIFF_COLOR_INCREASE,
  DIFF_COLOR_DECREASE,
  MAJOR_TICK_COLOR,
} from './defs/config'
import { getRanges, formatTickLabel } from './logics/knob'

export const OVERLAY_GUIDE_RADIUS = 64

interface OverlayGuideProps {
  centerX: number
  centerY: number
  distance: number
  min: number
  max: number
  range: number 
  value: number
  startValue: number
  tickStep: number
  majorTickStep: number
  innerRadius: number
  step: number
}

export const OverlayGuide: FC<OverlayGuideProps> = ({
  centerX,
  centerY,
  distance,
  min,
  max,
  range,
  value,
  startValue,
  tickStep,
  majorTickStep,
  innerRadius,
  step,
}) => {
  const actualRadius = Math.max(distance, OVERLAY_GUIDE_RADIUS)

  // 値から角度を計算する関数（度数法）
  const getAngleFromValue = (val: number) => {
    const normalized = (val - min) / (max - min)
    return -range + normalized * (range * 2) - 90
  }

  // 値から円周上の座標を計算する関数
  const getPositionFromValue = (val: number) => {
    const angle = getAngleFromValue(val)
    const angleRad = (angle * Math.PI) / 180
    const x = Math.cos(angleRad) * actualRadius
    const y = Math.sin(angleRad) * actualRadius
    return { x, y }
  }

  // SVG arc pathを生成する関数
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${start.x} ${start.y} A ${actualRadius} ${actualRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  }

  const polarToCartesian = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      x: Math.cos(angleRad) * actualRadius,
      y: Math.sin(angleRad) * actualRadius,
    }
  }

  const currentPos = getPositionFromValue(value)

  // 半径線用の座標（中心から少し離れた位置から開始）
  const radiusLineStartDistance = 32 // ノブに被らないように
  const valueAngle = getAngleFromValue(value)
  const valueAngleRad = (valueAngle * Math.PI) / 180
  const radiusLineStart = {
    x: Math.cos(valueAngleRad) * radiusLineStartDistance,
    y: Math.sin(valueAngleRad) * radiusLineStartDistance,
  }

  // 弧の計算
  const [baseBoundary, diffBoundary] = getRanges(min, max, startValue, value)
  const baseAngle = getAngleFromValue(baseBoundary)
  const diffAngle = getAngleFromValue(diffBoundary)
  const diffColor = value >= startValue ? DIFF_COLOR_INCREASE : DIFF_COLOR_DECREASE

  // 目盛り線とラベルを生成
  const ticks = []
  const labels = []
  const numTicks = Math.floor((max - min) / tickStep) + 1
  
  for (let i = 0; i < numTicks; i++) {
    const tickValue = min + i * tickStep
    
    // Check if this is a major tick (using integer index for precision)
    // Calculate how many ticks make up one major tick
    const majorTickInterval = Math.round(majorTickStep / tickStep)
    const isMajorTick = i % majorTickInterval === 0

    const normalized = (tickValue - min) / (max - min)
    const angle = -range + normalized * (range * 2) - 90 // 六時方向が起点
    const angleRad = (angle * Math.PI) / 180

    // 円周上の点を計算
    const x = Math.cos(angleRad) * actualRadius
    const y = Math.sin(angleRad) * actualRadius

    // 目盛りの長さ（大きな目盛は長く）
    const tickLength = isMajorTick ? 12 : 8
    const innerX = Math.cos(angleRad) * (actualRadius - tickLength)
    const innerY = Math.sin(angleRad) * (actualRadius - tickLength)

    ticks.push(
      <line
        key={i}
        x1={innerX}
        y1={innerY}
        x2={x}
        y2={y}
        stroke={isMajorTick ? MAJOR_TICK_COLOR : "#999"}
        strokeWidth={isMajorTick ? 2 : 1}
      />
    )

    // 大きな目盛にはラベルを表示
    if (isMajorTick) {
      const labelDistance = actualRadius + 15
      const labelX = Math.cos(angleRad) * labelDistance
      const labelY = Math.sin(angleRad) * labelDistance

      labels.push(
        <text
          key={`label-${i}`}
          x={labelX}
          y={labelY}
          fontSize="10"
          fill="#666"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {formatTickLabel(tickValue, step)}
        </text>
      )
    }
  }

  const padding = 30
  const viewBoxSize = actualRadius * 2 + padding * 2

  return (
    <>
      <style>
        {`
          @keyframes overlayGuideAppear {
            from {
              transform: translate(-50%, -50%) scale(0);
            }
            to {
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}
      </style>
      {/* すりガラス風のドーナツ型背景 */}
      <div
        style={{
          position: 'fixed',
          left: centerX,
          top: centerY,
          width: actualRadius * 2,
          height: actualRadius * 2,
          transform: 'translate(-50%, -50%) scale(1)',
          pointerEvents: 'none',
          zIndex: 999,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: `radial-gradient(circle, transparent ${innerRadius}px, black ${innerRadius}px)`,
          WebkitMaskImage: `radial-gradient(circle, transparent ${innerRadius}px, black ${innerRadius}px)`,
          animation: 'overlayGuideAppear 0.15s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <svg
        style={{
          position: 'fixed',
          left: centerX,
          top: centerY,
          width: actualRadius * 2,
          height: actualRadius * 2,
          transform: 'translate(-50%, -50%) scale(1)',
          pointerEvents: 'none',
          zIndex: 1000,
          animation: 'overlayGuideAppear 0.15s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        viewBox={`${-actualRadius - padding} ${-actualRadius - padding} ${viewBoxSize} ${viewBoxSize}`}
      >
      <circle
        cx="0"
        cy="0"
        r={actualRadius}
        fill="transparent"
        stroke="#999"
        strokeWidth="2"
      />
      {/* active弧 */}
      {baseBoundary !== diffBoundary && (
        <path
          d={describeArc(getAngleFromValue(min), baseAngle)}
          fill="none"
          stroke={ACTIVE_COLOR}
          strokeWidth="4"
        />
      )}
      {/* diff弧 */}
      {baseBoundary !== diffBoundary && (
        <path
          d={describeArc(baseAngle, diffAngle)}
          fill="none"
          stroke={diffColor}
          strokeWidth="4"
        />
      )}
      {ticks}
      {labels}
      {/* 半径線 */}
      <line
        x1={radiusLineStart.x}
        y1={radiusLineStart.y}
        x2={currentPos.x}
        y2={currentPos.y}
        stroke="#999"
        strokeWidth="2"
      />
      {/* valueの位置 */}
      <circle cx={currentPos.x} cy={currentPos.y} r={8} fill={ACTIVE_COLOR} />
    </svg>
    </>
  )
}

