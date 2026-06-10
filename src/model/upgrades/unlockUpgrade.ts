import { type DraftHelper } from '../draftHelpers/draftHelpers'
import { type GameDifficulty, isDifficultyAtLeast } from '../difficulty'
import { findSingleDraftsSolver, onlyDraftInCellSolver, singleDraftInBlockSolver, singleDraftInColumnSolver, singleDraftInRowSolver } from '../solvers/lastDraft'
import { clearBlockDraftsSolver, clearColumnDraftsSolver, clearImpossibleDraftsSolver, clearRowDraftsSolver } from '../solvers/removeDrafts'
import { calculateValidDraftsSolver, fillCellsWithDraftsSolver } from '../solvers/setDrafts'
import { solutionAssistSolver } from '../solvers/solutionAssist'
import { type SudokuSolver } from '../solvers/sudokuSolver'

export interface UnlockUpgradeModel {
    kind: 'unlock'
    id: string
    name: string
    category: UnlockUpgradeCategory
    cost: number
    description: string
    solver?: SudokuSolver
    draftHelper?: DraftHelper
    draftHelpers?: DraftHelper[]
    feature?: UpgradeFeature
}

export type UnlockUpgradeCategory =
    | 'basicSolvers'
    | 'singleDrafts'
    | 'solverQueue'
    | 'draftCleanup'
    | 'draftSetup'
    | 'startingDrafts'
    | 'advancedSingles'
    | 'solverAutomation'
    | 'automaticHelpers'

export type UpgradeFeature =
    | 'solverQueue'
    | 'autoSolverQueue'
    | 'startWithDrafts'
    | 'solverRowDraftHelper'
    | 'solverColumnDraftHelper'
    | 'solverBlockDraftHelper'

export const unlockUpgradeCategoryOrder: UnlockUpgradeCategory[] = [
    'basicSolvers',
    'singleDrafts',
    'solverQueue',
    'draftCleanup',
    'advancedSingles',
    'solverAutomation',
    'draftSetup',
    'automaticHelpers',
    'startingDrafts'
]

export const unlockUpgradeCategoryLabels: Record<UnlockUpgradeCategory, string> = {
    basicSolvers: 'Basic solvers',
    singleDrafts: 'Single drafts',
    solverQueue: 'Solver queue',
    draftCleanup: 'Draft cleanup',
    draftSetup: 'Draft setup',
    startingDrafts: 'Starting drafts',
    advancedSingles: 'Advanced singles',
    solverAutomation: 'Automation',
    automaticHelpers: 'Automatic helpers'
}

export const unlockUpgradeCategoryMinimumDifficulty: Partial<Record<UnlockUpgradeCategory, GameDifficulty>> = {}

export const isUnlockUpgradeCategoryAvailable = (
    category: UnlockUpgradeCategory,
    difficulty: GameDifficulty
): boolean => {
    const minimumDifficulty = unlockUpgradeCategoryMinimumDifficulty[category]
    return minimumDifficulty === undefined || isDifficultyAtLeast(difficulty, minimumDifficulty)
}

export const getCurrentUnlockUpgradeCategory = (upgrades: UnlockUpgradeModel[]): UnlockUpgradeCategory | undefined => {
    return unlockUpgradeCategoryOrder.find(category => upgrades.some(upgrade => upgrade.category === category))
}

const createSolverUnlockUpgrade = (
    solver: SudokuSolver,
    category: UnlockUpgradeCategory,
    description: string,
    cost: number
): UnlockUpgradeModel => ({
    kind: 'unlock',
    id: `${solver.id}-upgrade`,
    name: solver.name,
    category,
    cost,
    description,
    solver
})

export const allUnlockUpgrades: UnlockUpgradeModel[] = [
    createSolverUnlockUpgrade(fillCellsWithDraftsSolver, 'basicSolvers', 'Fill every empty cell with all drafts.', 8),
    createSolverUnlockUpgrade(clearRowDraftsSolver, 'basicSolvers', 'Remove drafts that already appear in the row.', 10),
    createSolverUnlockUpgrade(clearColumnDraftsSolver, 'basicSolvers', 'Remove drafts that already appear in the column.', 10),
    createSolverUnlockUpgrade(clearBlockDraftsSolver, 'basicSolvers', 'Remove drafts that already appear in the block.', 10),
    createSolverUnlockUpgrade(singleDraftInRowSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the row.', 25),
    createSolverUnlockUpgrade(singleDraftInColumnSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the column.', 25),
    createSolverUnlockUpgrade(singleDraftInBlockSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the block.', 25),
    createSolverUnlockUpgrade(onlyDraftInCellSolver, 'singleDrafts', 'Place a number when a cell has only one draft left.', 30),
    createSolverUnlockUpgrade(solutionAssistSolver, 'singleDrafts', 'Each scanned empty cell has a small chance to receive its correct solution value.', 35),
    {
        kind: 'unlock',
        id: 'solver-queue-upgrade',
        name: 'Solver queue',
        category: 'solverQueue',
        cost: 60,
        description: 'Queue solvers while another solver is already running.',
        feature: 'solverQueue'
    },
    createSolverUnlockUpgrade(clearImpossibleDraftsSolver, 'draftCleanup', 'Merges row, column, and block cleanup into one solver, replacing the separate cleanup solvers.', 100),
    createSolverUnlockUpgrade(findSingleDraftsSolver, 'advancedSingles', 'Merges the row, column, block, and cell single-draft solvers into one solver, replacing the separate versions.', 180),
    {
        kind: 'unlock',
        id: 'auto-solver-queue-upgrade',
        name: 'Auto-run solvers',
        category: 'solverAutomation',
        cost: 300,
        description: 'Automatically run every unlocked solver when the queue is empty.',
        feature: 'autoSolverQueue'
    },

    createSolverUnlockUpgrade(calculateValidDraftsSolver, 'draftSetup', 'Merges draft filling and cleanup into one solver, replacing the separate draft setup solvers.', 450),
    {
        kind: 'unlock',
        id: 'solver-row-draft-helper-upgrade',
        name: 'Auto row draft helper',
        category: 'automaticHelpers',
        cost: 600,
        description: 'When a solver places a number, remove its draft from the other cells in the row.',
        feature: 'solverRowDraftHelper'
    },
    {
        kind: 'unlock',
        id: 'solver-column-draft-helper-upgrade',
        name: 'Auto column draft helper',
        category: 'automaticHelpers',
        cost: 600,
        description: 'When a solver places a number, remove its draft from the other cells in the column.',
        feature: 'solverColumnDraftHelper'
    },
    {
        kind: 'unlock',
        id: 'solver-block-draft-helper-upgrade',
        name: 'Auto block draft helper',
        category: 'automaticHelpers',
        cost: 600,
        description: 'When a solver places a number, remove its draft from the other cells in the block.',
        feature: 'solverBlockDraftHelper'
    },
    {
        kind: 'unlock',
        id: 'start-with-drafts-upgrade',
        name: 'Prepared drafts',
        category: 'startingDrafts',
        cost: 2500,
        description: 'Start every new grid with valid drafts already filled in every empty cell.',
        feature: 'startWithDrafts'
    }
]
