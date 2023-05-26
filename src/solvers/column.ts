import { type SudokuModel } from '../SudokuModel'
import { type TestedNumber } from './solver'

export const columnSolver = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
    const newSudoku = [...sudoku]
    const lineId = Math.floor(solvingTile % 9)
    const line = newSudoku.filter((_, index) => Math.floor(index % 9) === lineId)
    testedNumbers.forEach((testedNb) => {
        if (line.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
    })
    return newSudoku
}
