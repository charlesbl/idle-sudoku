import { findSingleDraftsSolver, onlyDraftInCellSolver, singleDraftInBlockSolver, singleDraftInColumnSolver, singleDraftInRowSolver } from './lastDraft'
import { clearBlockDraftsSolver, clearColumnDraftsSolver, clearImpossibleDraftsSolver, clearRowDraftsSolver } from './removeDrafts'
import { calculateValidDraftsSolver, fillCellsWithDraftsSolver } from './setDrafts'
import { solutionAssistSolver } from './solutionAssist'
import { type SudokuSolver } from './sudokuSolver'

export const defaultSolvers: SudokuSolver[] = []

export const allSolvers: SudokuSolver[] = [
    fillCellsWithDraftsSolver,
    clearRowDraftsSolver,
    clearColumnDraftsSolver,
    clearBlockDraftsSolver,
    clearImpossibleDraftsSolver,
    calculateValidDraftsSolver,
    singleDraftInRowSolver,
    singleDraftInColumnSolver,
    singleDraftInBlockSolver,
    onlyDraftInCellSolver,
    findSingleDraftsSolver,
    solutionAssistSolver
]
