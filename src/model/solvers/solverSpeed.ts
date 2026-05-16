export interface SolverSpeedLevel {
    level: number
    label: string
    tileTimeMs: number
    tilesPerTick: number
}

export const solverSpeedLevels: SolverSpeedLevel[] = [
    { level: 0, label: 'Very slow', tileTimeMs: 220, tilesPerTick: 1 },
    { level: 1, label: 'Slow', tileTimeMs: 150, tilesPerTick: 1 },
    { level: 2, label: 'Steady', tileTimeMs: 95, tilesPerTick: 1 },
    { level: 3, label: 'Fast', tileTimeMs: 55, tilesPerTick: 1 },
    { level: 4, label: 'Very fast', tileTimeMs: 28, tilesPerTick: 1 },
    { level: 5, label: 'Rapid', tileTimeMs: 12, tilesPerTick: 1 },
    { level: 6, label: 'Blazing', tileTimeMs: 6, tilesPerTick: 1 },
    { level: 7, label: 'Extreme', tileTimeMs: 3, tilesPerTick: 1 },
    { level: 8, label: 'Instant', tileTimeMs: 1, tilesPerTick: 1 },
    { level: 9, label: 'Double scan', tileTimeMs: 1, tilesPerTick: 2 },
    { level: 10, label: 'Triple scan', tileTimeMs: 1, tilesPerTick: 3 },
    { level: 11, label: 'Wide scan', tileTimeMs: 1, tilesPerTick: 4 },
    { level: 12, label: 'Grid scan I', tileTimeMs: 1, tilesPerTick: 6 },
    { level: 13, label: 'Grid scan II', tileTimeMs: 1, tilesPerTick: 9 },
    { level: 14, label: 'Grid scan III', tileTimeMs: 1, tilesPerTick: 14 },
    { level: 15, label: 'Grid scan IV', tileTimeMs: 1, tilesPerTick: 21 },
    { level: 16, label: 'Grid scan V', tileTimeMs: 1, tilesPerTick: 32 },
    { level: 17, label: 'Grid scan VI', tileTimeMs: 1, tilesPerTick: 49 },
    { level: 18, label: 'Full board scan', tileTimeMs: 1, tilesPerTick: 81 }
]

export const maxSolverSpeedLevel = solverSpeedLevels.length - 1

const solverSpeedUpgradeCosts = [5, 10, 18, 30, 48, 75, 115, 170, 250, 360, 520, 750, 1080, 1550, 2250, 3250, 4700, 6800]

export const normalizeSolverSpeedLevel = (level: number | undefined): number => {
    if (level === undefined || !Number.isFinite(level)) return 0
    return Math.min(Math.max(Math.floor(level), 0), maxSolverSpeedLevel)
}

export const getSolverSpeedLevel = (level: number | undefined): SolverSpeedLevel => {
    return solverSpeedLevels[normalizeSolverSpeedLevel(level)]
}

export const getSolverSpeedUpgradeCost = (currentLevel: number): number => {
    return solverSpeedUpgradeCosts[normalizeSolverSpeedLevel(currentLevel)] ?? Infinity
}

export const getSolverSpeedDescription = (speedLevel: SolverSpeedLevel): string => {
    const tileLabel = speedLevel.tilesPerTick === 1 ? 'tile' : 'tiles'
    return `${speedLevel.tileTimeMs} ms/tick, ${speedLevel.tilesPerTick} ${tileLabel}/tick`
}

export const getSolverTileScanTimeMs = (speedLevel: SolverSpeedLevel): number => {
    return speedLevel.tileTimeMs / speedLevel.tilesPerTick
}
