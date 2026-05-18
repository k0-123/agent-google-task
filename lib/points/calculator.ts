export const BASE_POINTS: Record<string, number> = {
  boundary_6: 30,   // hardest to predict
  wicket: 25,
  boundary_4: 20,
  wide: 15,
  dot: 10,
  single: 10
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 3.0   // 🔥 LEGENDARY
  if (streak >= 7) return 2.5    // ⚡ ON FIRE  
  if (streak >= 5) return 2.0    // 🎯 HOT
  if (streak >= 3) return 1.5    // ✨ WARM
  return 1.0
}

export function calculatePoints(
  outcome: string, 
  predicted: string, 
  streak: number
): number {
  if (outcome !== predicted) return 0
  const base = BASE_POINTS[outcome] || 10
  const multiplier = getStreakMultiplier(streak)
  return Math.round(base * multiplier)
}

export function getStreakLabel(streak: number): string {
  if (streak >= 10) return '🔥 LEGENDARY'
  if (streak >= 7) return '⚡ ON FIRE'
  if (streak >= 5) return '🎯 HOT STREAK'
  if (streak >= 3) return '✨ WARMING UP'
  return ''
}
