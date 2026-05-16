import { blockDraftHelper, columnDraftHelper, type DraftHelper, rowDraftHelper } from '../draftHelpers/draftHelpers'
import { findSingleDraftsSolver, onlyDraftInCellSolver, singleDraftInBlockSolver, singleDraftInColumnSolver, singleDraftInRowSolver } from '../solvers/lastDraft'
import { clearImpossibleDraftsSolver } from '../solvers/removeDrafts'
import { calculateValidDraftsSolver } from '../solvers/setDrafts'
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
    feature?: UpgradeFeature
}

export type UnlockUpgradeCategory =
    | 'draftHelpers'
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
    'draftHelpers',
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
    draftHelpers: 'Draft helpers',
    singleDrafts: 'Single drafts',
    solverQueue: 'Solver queue',
    draftCleanup: 'Draft cleanup',
    draftSetup: 'Draft setup',
    startingDrafts: 'Starting drafts',
    advancedSingles: 'Advanced singles',
    solverAutomation: 'Automation',
    automaticHelpers: 'Automatic helpers'
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
    {
        kind: 'unlock',
        id: `${rowDraftHelper.id}-draft-helper-upgrade`,
        name: 'Row draft helper',
        category: 'draftHelpers',
        cost: 4,
        description: 'When you place a number, remove its draft from the other cells in the row.',
        draftHelper: rowDraftHelper
    },
    {
        kind: 'unlock',
        id: `${columnDraftHelper.id}-draft-helper-upgrade`,
        name: 'Column draft helper',
        category: 'draftHelpers',
        cost: 4,
        description: 'When you place a number, remove its draft from the other cells in the column.',
        draftHelper: columnDraftHelper
    },
    {
        kind: 'unlock',
        id: `${blockDraftHelper.id}-draft-helper-upgrade`,
        name: 'Block draft helper',
        category: 'draftHelpers',
        cost: 4,
        description: 'When you place a number, remove its draft from the other cells in the block.',
        draftHelper: blockDraftHelper
    },
    createSolverUnlockUpgrade(singleDraftInRowSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the row.', 10),
    createSolverUnlockUpgrade(singleDraftInColumnSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the column.', 10),
    createSolverUnlockUpgrade(singleDraftInBlockSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the block.', 10),
    createSolverUnlockUpgrade(onlyDraftInCellSolver, 'singleDrafts', 'Place a number when a cell has only one draft left.', 12),
    {
        kind: 'unlock',
        id: 'solver-queue-upgrade',
        name: 'Solver queue',
        category: 'solverQueue',
        cost: 18,
        description: 'Queue solvers while another solver is already running.',
        feature: 'solverQueue'
    },
    createSolverUnlockUpgrade(clearImpossibleDraftsSolver, 'draftCleanup', 'Merges row, column, and block cleanup into one solver, replacing the separate cleanup solvers.', 24),
    createSolverUnlockUpgrade(findSingleDraftsSolver, 'advancedSingles', 'Merges the row, column, block, and cell single-draft solvers into one solver, replacing the separate versions.', 45),
    {
        kind: 'unlock',
        id: 'auto-solver-queue-upgrade',
        name: 'Auto-run solvers',
        category: 'solverAutomation',
        cost: 55,
        description: 'Automatically run every unlocked solver when the queue is empty.',
        feature: 'autoSolverQueue'
    },
    createSolverUnlockUpgrade(calculateValidDraftsSolver, 'draftSetup', 'Merges draft filling and cleanup into one solver, replacing the separate draft setup solvers.', 35),
    {
        kind: 'unlock',
        id: 'solver-row-draft-helper-upgrade',
        name: 'Auto row draft helper',
        category: 'automaticHelpers',
        cost: 25,
        description: 'When a solver places a number, remove its draft from the other cells in the row.',
        feature: 'solverRowDraftHelper'
    },
    {
        kind: 'unlock',
        id: 'solver-column-draft-helper-upgrade',
        name: 'Auto column draft helper',
        category: 'automaticHelpers',
        cost: 25,
        description: 'When a solver places a number, remove its draft from the other cells in the column.',
        feature: 'solverColumnDraftHelper'
    },
    {
        kind: 'unlock',
        id: 'solver-block-draft-helper-upgrade',
        name: 'Auto block draft helper',
        category: 'automaticHelpers',
        cost: 25,
        description: 'When a solver places a number, remove its draft from the other cells in the block.',
        feature: 'solverBlockDraftHelper'
    },
    {
        kind: 'unlock',
        id: 'start-with-drafts-upgrade',
        name: 'Prepared drafts',
        category: 'startingDrafts',
        cost: 500,
        description: 'Start every new grid with valid drafts already filled in every empty cell.',
        feature: 'startWithDrafts'
    }
]
