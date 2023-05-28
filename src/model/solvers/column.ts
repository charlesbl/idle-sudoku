import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategy'

export const columnSolver: Strategy = {
    id: 'column',
    name: 'Column Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const column = newSudoku.filter((_, index) => Math.floor(index % 9) === Math.floor(solvingTile % 9))
        testedNumbers.forEach((testedNb) => {
            if (column.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const draftColumnSolver: Strategy = {
    id: 'draft-column',
    name: 'Draft Column Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const column = newSudoku.map((tm, i) => ({ ...tm, i })).filter((_, index) => Math.floor(index % 9) === Math.floor(solvingTile % 9))
        testedNumbers.forEach((testedNb) => {
            if (column.every((tile) => tile.i === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}
