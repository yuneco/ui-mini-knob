export const BASE_GUIDE_OFFSET = 64

export type GuideDirection = 'up' | 'down'

export interface GuideMetrics {
  lineLeft: number
  lineRight: number
  lineWidth: number
  lineY: number
  direction: GuideDirection
  clampedDistance: number
  ratio: number
  viewportWidth: number
  viewportHeight: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const snapToStep = (value: number, step: number): number => {
  if (step <= 0) return value
  return Math.round(value / step) * step
}

export const getRatioFromPosition = (clientX: number, rect: DOMRect): number => {
  if (rect.width === 0) return 0
  const ratio = (clientX - rect.left) / rect.width
  return clamp(ratio, 0, 1)
}

export const computeGuideMetrics = (
  rect: DOMRect,
  distance: number,
  direction: GuideDirection,
  viewportWidth: number,
  viewportHeight: number
): GuideMetrics => {
  const sliderCenterY = rect.top + rect.height / 2
  const maxDistance =
    direction === 'down'
      ? Math.max(BASE_GUIDE_OFFSET, viewportHeight - sliderCenterY)
      : Math.max(BASE_GUIDE_OFFSET, sliderCenterY)

  const clampedDistance = clamp(distance, BASE_GUIDE_OFFSET, maxDistance)
  const distanceRange = Math.max(maxDistance - BASE_GUIDE_OFFSET, 0)
  const ratio =
    distanceRange <= 0
      ? 0
      : clamp(
          (clampedDistance - BASE_GUIDE_OFFSET) / distanceRange,
          0,
          1
        )

  const rawLineY =
    direction === 'down'
      ? sliderCenterY + clampedDistance
      : sliderCenterY - clampedDistance
  const lineY = clamp(
    rawLineY,
    0,
    viewportHeight
  )

  const startLeft = rect.left
  const startRight = rect.right
  const endLeft = 0
  const endRight = viewportWidth

  const lineLeft = clamp(
    startLeft + (endLeft - startLeft) * ratio,
    0,
    viewportWidth
  )
  const lineRight = clamp(
    startRight + (endRight - startRight) * ratio,
    0,
    viewportWidth
  )

  const adjustedLeft = Math.min(lineLeft, lineRight)
  const adjustedRight = Math.max(lineLeft, lineRight)

  return {
    lineLeft: adjustedLeft,
    lineRight: adjustedRight,
    lineWidth: Math.max(10, adjustedRight - adjustedLeft),
    lineY,
    direction,
    clampedDistance,
    ratio,
    viewportWidth,
    viewportHeight,
  }
}

