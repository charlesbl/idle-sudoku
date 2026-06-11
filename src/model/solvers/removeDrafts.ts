import { getBlockId } from '../../utils/utils'
import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type SudokuSolver } from './sudokuSolver'

export const clearRowDraftsSolver: SudokuSolver = {
    id: 'clear-row-drafts',
    name: 'Clear row drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[], solution?: number[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        testedNumbers.forEach((testedNb) => {
            if (newSudoku.some((tile, index) =>
                Math.floor(index / 9) === Math.floor(solvingTile / 9) &&
                tile.value === testedNb.index + 1 &&
                (solution === undefined || tile.value === solution[index])
            )) {
                newSudoku[solvingTile].draftNumbers[testedNb.index] = false
            }
        })
        return newSudoku
    }
}

export const clearColumnDraftsSolver: SudokuSolver = {
    id: 'clear-column-drafts',
    name: 'Clear column drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[], solution?: number[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        testedNumbers.forEach((testedNb) => {
            if (newSudoku.some((tile, index) =>
                Math.floor(index % 9) === Math.floor(solvingTile % 9) &&
                tile.value === testedNb.index + 1 &&
                (solution === undefined || tile.value === solution[index])
            )) {
                newSudoku[solvingTile].draftNumbers[testedNb.index] = false
            }
        })
        return newSudoku
    }
}

export const clearBlockDraftsSolver: SudokuSolver = {
    id: 'clear-block-drafts',
    name: 'Clear block drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[], solution?: number[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        testedNumbers.forEach((testedNb) => {
            if (newSudoku.some((tile, index) =>
                getBlockId(index) === getBlockId(solvingTile) &&
                tile.value === testedNb.index + 1 &&
                (solution === undefined || tile.value === solution[index])
            )) {
                newSudoku[solvingTile].draftNumbers[testedNb.index] = false
            }
        })
        return newSudoku
    }
}

export const clearImpossibleDraftsSolver: SudokuSolver = {
    id: 'clear-impossible-drafts',
    name: 'Clear impossible drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[], solution?: number[]): SudokuModel => {
        let newSudoku = clearRowDraftsSolver.solve(sudoku, solvingTile, testedNumbers, solution)
        newSudoku = clearColumnDraftsSolver.solve(newSudoku, solvingTile, testedNumbers, solution)
        newSudoku = clearBlockDraftsSolver.solve(newSudoku, solvingTile, testedNumbers, solution)
        return newSudoku
    },
    replaces: [clearRowDraftsSolver, clearColumnDraftsSolver, clearBlockDraftsSolver]
}
