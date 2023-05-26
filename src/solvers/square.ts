import { type SudokuModel } from '../SudokuModel'
import { type TestedNumber, type SolverStrategy } from './solver'

export const squareSolver: SolverStrategy = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
    const newSudoku = [...sudoku]
    const square = newSudoku.filter((_, index) => getSquareId(index) === getSquareId(solvingTile))
    testedNumbers.forEach((testedNb) => {
        if (square.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
    })
    return newSudoku
}

const getSquareId = (tileId: number): number => (Math.floor((tileId % 27) / 3) % 3) + Math.floor(tileId / 27) * 3
