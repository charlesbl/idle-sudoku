import { blockDraftHelper, columnDraftHelper, type DraftHelper, rowDraftHelper } from '../draftHelpers/draftHelpers'
import { findSingleDraftsSolver, onlyDraftInCellSolver, singleDraftInBlockSolver, singleDraftInColumnSolver, singleDraftInRowSolver } from '../solvers/lastDraft'
import { clearImpossibleDraftsSolver } from '../solvers/removeDrafts'
import { calculateValidDraftsSolver } from '../solvers/setDrafts'
import { type SudokuSolver } from '../solvers/sudokuSolver'

export interface UpgradeModel {
    id: string
    name: string
    category: UpgradeCategory
    cost: number
    description: string
    solver?: SudokuSolver
    draftHelper?: DraftHelper
    feature?: UpgradeFeature
}

export type UpgradeCategory =
    | 'draftHelpers'
    | 'singleDrafts'
    | 'solverQueue'
    | 'draftCleanup'
    | 'draftSetup'
    | 'advancedSingles'
    | 'solverAutomation'
    | 'automaticHelpers'

export type UpgradeFeature =
    | 'solverQueue'
    | 'autoSolverQueue'
    | 'solverRowDraftHelper'
    | 'solverColumnDraftHelper'
    | 'solverBlockDraftHelper'

export const upgradeCategoryOrder: UpgradeCategory[] = [
    'draftHelpers',
    'singleDrafts',
    'solverQueue',
    'draftCleanup',
    'draftSetup',
    'advancedSingles',
    'solverAutomation',
    'automaticHelpers'
]

export const upgradeCategoryLabels: Record<UpgradeCategory, string> = {
    draftHelpers: 'Draft helpers',
    singleDrafts: 'Single drafts',
    solverQueue: 'Solver queue',
    draftCleanup: 'Draft cleanup',
    draftSetup: 'Draft setup',
    advancedSingles: 'Advanced singles',
    solverAutomation: 'Automation',
    automaticHelpers: 'Automatic helpers'
}

export const getUnlockedUpgradeCategory = (upgrades: UpgradeModel[]): UpgradeCategory | undefined => {
    return upgradeCategoryOrder.find(category => upgrades.some(upgrade => upgrade.category === category))
}

const createSolverUpgrade = (solver: SudokuSolver, category: UpgradeCategory, description: string, cost: number): UpgradeModel => ({
    id: `${solver.id}-upgrade`,
    name: solver.name,
    category,
    cost,
    description,
    solver
})

export const allUpgrades: UpgradeModel[] = [
    // draft helpers
    {
        id: `${rowDraftHelper.id}-draft-helper-upgrade`,
        name: 'Row draft helper',
        category: 'draftHelpers',
        cost: 1,
        description: 'When you place a number, remove its draft from the other cells in the row.',
        draftHelper: rowDraftHelper
    },
    {
        id: `${columnDraftHelper.id}-draft-helper-upgrade`,
        name: 'Column draft helper',
        category: 'draftHelpers',
        cost: 1,
        description: 'When you place a number, remove its draft from the other cells in the column.',
        draftHelper: columnDraftHelper
    },
    {
        id: `${blockDraftHelper.id}-draft-helper-upgrade`,
        name: 'Block draft helper',
        category: 'draftHelpers',
        cost: 1,
        description: 'When you place a number, remove its draft from the other cells in the block.',
        draftHelper: blockDraftHelper
    },
    // single drafts
    createSolverUpgrade(singleDraftInRowSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the row.', 1),
    createSolverUpgrade(singleDraftInColumnSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the column.', 1),
    createSolverUpgrade(singleDraftInBlockSolver, 'singleDrafts', 'Place a number when its draft appears in only one cell of the block.', 1),
    createSolverUpgrade(onlyDraftInCellSolver, 'singleDrafts', 'Place a number when a cell has only one draft left.', 1),
    {
        id: 'solver-queue-upgrade',
        name: 'Solver queue',
        category: 'solverQueue',
        cost: 1,
        description: 'Queue solvers while another solver is already running.',
        feature: 'solverQueue'
    },
    // merged solvers
    createSolverUpgrade(clearImpossibleDraftsSolver, 'draftCleanup', 'Merges row, column, and block cleanup into one solver, replacing the separate cleanup solvers.', 1),
    createSolverUpgrade(calculateValidDraftsSolver, 'draftSetup', 'Merges draft filling and cleanup into one solver, replacing the separate draft setup solvers.', 1),
    createSolverUpgrade(findSingleDraftsSolver, 'advancedSingles', 'Merges the row, column, block, and cell single-draft solvers into one solver, replacing the separate versions.', 1),
    {
        id: 'auto-solver-queue-upgrade',
        name: 'Auto-run solvers',
        category: 'solverAutomation',
        cost: 1,
        description: 'Automatically run every unlocked solver when the queue is empty.',
        feature: 'autoSolverQueue'
    },
    {
        id: 'solver-row-draft-helper-upgrade',
        name: 'Auto row draft helper',
        category: 'automaticHelpers',
        cost: 1,
        description: 'When a solver places a number, remove its draft from the other cells in the row.',
        feature: 'solverRowDraftHelper'
    },
    {
        id: 'solver-column-draft-helper-upgrade',
        name: 'Auto column draft helper',
        category: 'automaticHelpers',
        cost: 1,
        description: 'When a solver places a number, remove its draft from the other cells in the column.',
        feature: 'solverColumnDraftHelper'
    },
    {
        id: 'solver-block-draft-helper-upgrade',
        name: 'Auto block draft helper',
        category: 'automaticHelpers',
        cost: 1,
        description: 'When a solver places a number, remove its draft from the other cells in the block.',
        feature: 'solverBlockDraftHelper'
    }
]
