import { type SudokuModel } from '../sudoku.model'

export type SolverStep = (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[], solution?: number[]) => SudokuModel
export interface TestedNumber {
    index: number
    isDraft: boolean
}

export const runSolverStep = (solverStep: SolverStep, sudoku: SudokuModel, solvingTile: number, solution?: number[]): SudokuModel => {
    if (sudoku[solvingTile].fixed) return sudoku
    const testedNumbers = sudoku[solvingTile].draftNumbers.map((isDraft, i): TestedNumber => ({ index: i, isDraft })).filter((draftNb) => draftNb.isDraft)
    return solverStep(sudoku, solvingTile, testedNumbers, solution)
}
