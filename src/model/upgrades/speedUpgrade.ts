export interface SpeedUpgradeModel {
    kind: 'speed'
    id: string
    name: string
    category: SpeedUpgradeCategory
    cost: number
    description: string
}

export type SpeedUpgradeCategory =
    | 'solverSpeed'
    | 'gridTiming'
    | 'autoQueueCooldown'
    | 'solutionAssist'

export const speedUpgradeCategoryOrder: SpeedUpgradeCategory[] = [
    'solverSpeed',
    'gridTiming',
    'autoQueueCooldown',
    'solutionAssist'
]

export const speedUpgradeCategoryLabels: Record<SpeedUpgradeCategory, string> = {
    solverSpeed: 'Solver speed',
    gridTiming: 'Grid timing',
    autoQueueCooldown: 'Auto queue cooldown',
    solutionAssist: 'Solution assist'
}
