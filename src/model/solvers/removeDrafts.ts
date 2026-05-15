import { getBlockId } from '../../utils/utils'
import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type SudokuSolver } from './sudokuSolver'

export const clearRowDraftsSolver: SudokuSolver = {
    id: 'clear-row-drafts',
    name: 'Clear row drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const row = newSudoku.filter((_, index) => Math.floor(index / 9) === Math.floor(solvingTile / 9))
        testedNumbers.forEach((testedNb) => {
            if (row.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const clearColumnDraftsSolver: SudokuSolver = {
    id: 'clear-column-drafts',
    name: 'Clear column drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const column = newSudoku.filter((_, index) => Math.floor(index % 9) === Math.floor(solvingTile % 9))
        testedNumbers.forEach((testedNb) => {
            if (column.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const clearBlockDraftsSolver: SudokuSolver = {
    id: 'clear-block-drafts',
    name: 'Clear block drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const block = newSudoku.filter((_, index) => getBlockId(index) === getBlockId(solvingTile))
        testedNumbers.forEach((testedNb) => {
            if (block.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const clearImpossibleDraftsSolver: SudokuSolver = {
    id: 'clear-impossible-drafts',
    name: 'Clear impossible drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        let newSudoku = clearRowDraftsSolver.solve(sudoku, solvingTile, testedNumbers)
        newSudoku = clearColumnDraftsSolver.solve(newSudoku, solvingTile, testedNumbers)
        newSudoku = clearBlockDraftsSolver.solve(newSudoku, solvingTile, testedNumbers)
        return newSudoku
    },
    replaces: [clearRowDraftsSolver, clearColumnDraftsSolver, clearBlockDraftsSolver]
}
