export const getDecimalPlaces = (step: number): number => {
  if (!Number.isFinite(step) || step <= 0) return 0
  const stepString = step.toString()
  if (stepString.includes('e-')) {
    const [, exponent] = stepString.split('e-')
    const parsed = parseInt(exponent ?? '0', 10)
    return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0)
  }
  const decimalPart = stepString.split('.')[1]
  return decimalPart ? decimalPart.length : 0
}

export const formatKnobValue = (value: number, step: number): string => {
  const decimals = getDecimalPlaces(step)
  if (decimals === 0) {
    return Math.round(value).toString()
  }
  return value.toFixed(decimals)
}

export const formatTickLabel = (value: number, step: number): string => {
  const decimals = getDecimalPlaces(step)
  if (decimals === 0) {
    return Math.round(value).toString()
  }
  // toFixedで丸めてからNumberで変換することで末尾の0を削除
  return Number(value.toFixed(decimals)).toString()
}

// 中心を0,0とした相対座標から値を計算
export function getValueFromRelativePosition(
  dx: number,
  dy: number,
  min: number,
  max: number,
  step: number,
  range: number = 135
): number {
  // 角度を計算（-180度から180度）
  let angle = Math.atan2(dy, dx) * (180 / Math.PI)
  // -range度からrange度の範囲に変換
  angle = angle + 90 // 0度を上にする
  if (angle > 180) angle -= 360
  if (angle < -range) angle = -range
  if (angle > range) angle = range

  // 角度を値に変換
  const normalized = (angle + range) / (range * 2)
  let newValue = min + normalized * (max - min)

  // stepに合わせて丸める
  newValue = Math.round(newValue / step) * step

  // min/maxの範囲内に制限
  return Math.max(min, Math.min(max, newValue))
}

export const normalizeValue = (value: number, min: number, max: number) => {
  if (min === max) return 0
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

export const getRanges = (
  min: number,
  max: number,
  startValue: number,
  currentValue: number
): [number, number] => {
  if (max <= min) {
    return [min, min]
  }
  const clamp = (value: number) => Math.min(max, Math.max(min, value))
  const clampedStart = clamp(startValue)
  const clampedCurrent = clamp(currentValue)
  const lower = Math.min(clampedStart, clampedCurrent)
  const upper = Math.max(clampedStart, clampedCurrent)
  return [lower, upper]
}

