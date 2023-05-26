import { type SudokuModel } from '../SudokuModel'
import { columnSolver, draftColumnSolver } from './column'
import { lastDraftSolver } from './lastDraft'
import { draftLineSolver, lineSolver } from './line'
import { draftSquareSolver, squareSolver } from './square'

export type SolverStrategy = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]) => SudokuModel
export interface TestedNumber {
    index: number
    isDraft: boolean
}

export const solve = (strategy: SolverStrategy, sudoku: SudokuModel, solvingTile: number): SudokuModel => {
    if (sudoku[solvingTile].value !== undefined) return sudoku
    const testedNumbers = sudoku[solvingTile].draftNumbers.map((isDraft, i): TestedNumber => ({ index: i, isDraft })).filter((draftNb) => draftNb.isDraft)
    if (testedNumbers.length === 0) return sudoku
    return strategy(sudoku, solvingTile, testedNumbers)
}

export const strategies = [
    lineSolver,
    columnSolver,
    squareSolver,
    draftLineSolver,
    draftColumnSolver,
    draftSquareSolver,
    lastDraftSolver
]
