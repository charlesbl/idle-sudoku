import { type SudokuModel } from '../SudokuModel'
import { type TestedNumber, type SolverStrategy } from './solver'

export const lastDraftSolver: SolverStrategy = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]) => {
    if (testedNumbers.length !== 1) return sudoku
    const newSudoku = [...sudoku]
    newSudoku[solvingTile].value = testedNumbers[0].index + 1
    return newSudoku
}
