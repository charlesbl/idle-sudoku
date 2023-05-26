import { type SudokuModel } from '../SudokuModel'
import { type TestedNumber } from './solver'

export const columnSolver = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
    const newSudoku = [...sudoku]
    const column = newSudoku.filter((_, index) => Math.floor(index % 9) === Math.floor(solvingTile % 9))
    testedNumbers.forEach((testedNb) => {
        if (column.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
    })
    return newSudoku
}

export const draftColumnSolver = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
    const newSudoku = [...sudoku]
    const column = newSudoku.map((tm, i) => ({ ...tm, i })).filter((_, index) => Math.floor(index % 9) === Math.floor(solvingTile % 9))
    testedNumbers.forEach((testedNb) => {
        if (column.every((tile) => tile.i === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
            newSudoku[solvingTile].value = testedNb.index + 1
        }
    })
    return newSudoku
}
