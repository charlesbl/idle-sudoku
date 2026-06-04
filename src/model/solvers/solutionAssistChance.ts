export interface SolutionAssistChanceLevel {
    level: number
    label: string
    chancePercent: number
}

export const solutionAssistChanceLevels: SolutionAssistChanceLevel[] = [
    { level: 0, label: 'Almost never', chancePercent: 1 },
    { level: 1, label: 'Rare spark', chancePercent: 2 },
    { level: 2, label: 'Small chance', chancePercent: 4 },
    { level: 3, label: 'Lucky scan', chancePercent: 7 },
    { level: 4, label: 'Ten percent', chancePercent: 10 },
    { level: 5, label: 'Steady luck', chancePercent: 15 },
    { level: 6, label: 'One in five', chancePercent: 22 },
    { level: 7, label: 'Warm streak', chancePercent: 30 },
    { level: 8, label: 'Reliable hint', chancePercent: 42 },
    { level: 9, label: 'Coin flip', chancePercent: 55 },
    { level: 10, label: 'Strong signal', chancePercent: 70 },
    { level: 11, label: 'Near certain', chancePercent: 85 },
    { level: 12, label: 'Guaranteed', chancePercent: 100 }
]

export const maxSolutionAssistChanceLevel = solutionAssistChanceLevels.length - 1

const solutionAssistChanceUpgradeCosts = [120, 180, 260, 380, 560, 820, 1200, 1750, 2550, 3700, 5400, 7800]

export const normalizeSolutionAssistChanceLevel = (level: number | undefined): number => {
    if (level === undefined || !Number.isFinite(level)) return 0
    return Math.min(Math.max(Math.floor(level), 0), maxSolutionAssistChanceLevel)
}

export const getSolutionAssistChanceLevel = (level: number | undefined): SolutionAssistChanceLevel => {
    return solutionAssistChanceLevels[normalizeSolutionAssistChanceLevel(level)]
}

export const getSolutionAssistChanceUpgradeCost = (currentLevel: number): number => {
    return solutionAssistChanceUpgradeCosts[normalizeSolutionAssistChanceLevel(currentLevel)] ?? Infinity
}
