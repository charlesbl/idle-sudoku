export interface AutoQueueCooldownLevel {
    level: number
    label: string
    delayMs: number
}

export const autoQueueCooldownLevels: AutoQueueCooldownLevel[] = [
    { level: 0, label: 'Long cooldown', delayMs: 10000 },
    { level: 1, label: 'Measured cooldown', delayMs: 7500 },
    { level: 2, label: 'Short cooldown', delayMs: 5000 },
    { level: 3, label: 'Quick cooldown', delayMs: 3500 },
    { level: 4, label: 'Swift cooldown', delayMs: 2500 },
    { level: 5, label: 'Rapid cooldown', delayMs: 1600 },
    { level: 6, label: 'Snap cooldown', delayMs: 1000 },
    { level: 7, label: 'Flash cooldown', delayMs: 600 },
    { level: 8, label: 'Blink cooldown', delayMs: 300 },
    { level: 9, label: 'No cooldown', delayMs: 0 }
]

export const maxAutoQueueCooldownLevel = autoQueueCooldownLevels.length - 1

const autoQueueCooldownUpgradeCosts = [35, 60, 95, 150, 230, 350, 520, 780, 1150]

export const normalizeAutoQueueCooldownLevel = (level: number | undefined): number => {
    if (level === undefined || !Number.isFinite(level)) return 0
    return Math.min(Math.max(Math.floor(level), 0), maxAutoQueueCooldownLevel)
}

export const getAutoQueueCooldownLevel = (level: number | undefined): AutoQueueCooldownLevel => {
    return autoQueueCooldownLevels[normalizeAutoQueueCooldownLevel(level)]
}

export const getAutoQueueCooldownUpgradeCost = (currentLevel: number): number => {
    return autoQueueCooldownUpgradeCosts[normalizeAutoQueueCooldownLevel(currentLevel)] ?? Infinity
}
