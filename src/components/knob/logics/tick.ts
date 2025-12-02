/**
 * Minimum spacing between tick marks in pixels
 */
const MIN_TICK_SPACING_PX = 4

/**
 * Result of tick step calculation
 */
export interface TickStepResult {
  tickStep: number
  majorTickStep: number
}

/**
 * Calculate optimal tick step for circular guide based on available arc length
 * 
 * @param radius - Radius of the guide circle in pixels
 * @param range - Angular range in degrees (half of total sweep)
 * @param min - Minimum value of the knob
 * @param max - Maximum value of the knob
 * @param step - Base step size for the knob
 * @returns Optimal tick steps (regular and major) that maintain minimum spacing
 */
export const calculateTickStep = (
  radius: number,
  range: number,
  min: number,
  max: number,
  step: number
): TickStepResult => {
  // Calculate available arc length
  // Total sweep is range * 2 degrees
  const totalSweepDegrees = range * 2
  const arcLengthPx = (2 * Math.PI * radius * totalSweepDegrees) / 360

  // Calculate number of ticks and spacing with base step
  const valueRange = max - min
  const tickCount = Math.floor(valueRange / step) + 1
  
  if (tickCount <= 1) {
    const majorTickStep = Math.pow(10, Math.floor(Math.log10(step)) + 1)
    return { tickStep: step, majorTickStep }
  }

  const spacingPx = arcLengthPx / (tickCount - 1)

  let optimalTickStep = step

  // If base step already maintains minimum spacing, use it
  if (spacingPx < MIN_TICK_SPACING_PX) {

    // Find optimal multiplier from sequence: 2, 5, 10, 20, 50, 100, 200, 500, 1000, ...
    // This is [2, 5] * 10^n pattern
    let multiplier = 1
    let power = 0

    while (true) {
      const multipliers = [2, 5, 10]
      
      for (const base of multipliers) {
        multiplier = base * Math.pow(10, power)
        const candidateStep = step * multiplier
        
        // Calculate spacing with this candidate step
        const candidateTickCount = Math.floor(valueRange / candidateStep) + 1
        if (candidateTickCount <= 1) {
          optimalTickStep = candidateStep
          break
        }
        
        const candidateSpacing = arcLengthPx / (candidateTickCount - 1)
        
        if (candidateSpacing >= MIN_TICK_SPACING_PX) {
          optimalTickStep = candidateStep
          break
        }
      }
      
      if (optimalTickStep !== step) {
        break
      }
      
      power++
      
      // Safety limit to prevent infinite loop
      if (power > 10) {
        optimalTickStep = step * multiplier
        break
      }
    }
  }

  // Calculate major tick step (10^n times the optimal tick step)
  // For tickStep 1,2 -> majorTickStep 10
  // For tickStep 5,10,20 -> majorTickStep 100
  // For tickStep 50,100,200 -> majorTickStep 1000
  // (x5 series gets one extra power)
  const power = Math.floor(Math.log10(optimalTickStep))
  const normalized = optimalTickStep / Math.pow(10, power)
  
  // Check if it's a x5 series (5, 50, 500, ...)
  const is5x = normalized >= 4 && normalized < 7
  const majorTickStep = is5x 
    ? Math.pow(10, power + 2)
    : Math.pow(10, power + 1)

  return {
    tickStep: optimalTickStep,
    majorTickStep,
  }
}

