export interface PuzzleTransitionLevel {
    level: number
    label: string
    delayMs: number
}

export const puzzleTransitionLevels: PuzzleTransitionLevel[] = [
    { level: 0, label: 'Pause', delayMs: 2000 },
    { level: 1, label: 'Short pause', delayMs: 1600 },
    { level: 2, label: 'Clean handoff', delayMs: 1250 },
    { level: 3, label: 'Quick handoff', delayMs: 950 },
    { level: 4, label: 'Swift handoff', delayMs: 700 },
    { level: 5, label: 'Rapid handoff', delayMs: 500 },
    { level: 6, label: 'Snap handoff', delayMs: 350 },
    { level: 7, label: 'Flash handoff', delayMs: 240 },
    { level: 8, label: 'Blink handoff', delayMs: 160 },
    { level: 9, label: 'Near instant', delayMs: 90 },
    { level: 10, label: 'Instant', delayMs: 0 }
]

export const maxPuzzleTransitionLevel = puzzleTransitionLevels.length - 1

const puzzleTransitionUpgradeCosts = [18, 32, 55, 90, 145, 230, 360, 560, 850, 1200]

export const normalizePuzzleTransitionLevel = (level: number | undefined): number => {
    if (level === undefined || !Number.isFinite(level)) return 0
    return Math.min(Math.max(Math.floor(level), 0), maxPuzzleTransitionLevel)
}

export const getPuzzleTransitionLevel = (level: number | undefined): PuzzleTransitionLevel => {
    return puzzleTransitionLevels[normalizePuzzleTransitionLevel(level)]
}

export const getPuzzleTransitionUpgradeCost = (currentLevel: number): number => {
    return puzzleTransitionUpgradeCosts[normalizePuzzleTransitionLevel(currentLevel)] ?? Infinity
}

export const formatPuzzleTransitionDelay = (delayMs: number): string => {
    if (delayMs < 1000) return `${delayMs} ms`
    return `${(delayMs / 1000).toFixed(1)} s`
}
