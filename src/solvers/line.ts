import { type SudokuModel } from '../SudokuModel'
import { type TestedNumber, type SolverStrategy } from './solver'

export const lineSolver: SolverStrategy = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
    const newSudoku = [...sudoku]
    const line = newSudoku.filter((_, index) => Math.floor(index / 9) === Math.floor(solvingTile / 9))
    testedNumbers.forEach((testedNb) => {
        if (line.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
    })
    return newSudoku
}

export const draftLineSolver: SolverStrategy = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
    const newSudoku = [...sudoku]
    const line = newSudoku.map((tm, i) => ({ ...tm, i })).filter((_, index) => Math.floor(index / 9) === Math.floor(solvingTile / 9))
    testedNumbers.forEach((testedNb) => {
        if (line.every((tile) => tile.i === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
            newSudoku[solvingTile].value = testedNb.index + 1
        }
    })
    return newSudoku
}
