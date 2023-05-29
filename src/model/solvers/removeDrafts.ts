import { type SudokuModel } from '../sudoku.model'
import { columnSolver } from './column'
import { lineSolver } from './line'
import { type TestedNumber } from './solver'
import { squareSolver } from './square'
import { type Strategy } from './strategy'

export const removeDraftSolver: Strategy = {
    id: 'remove-draft-solver',
    name: 'Remove Draft Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        let newSudoku = lineSolver.solver(sudoku, solvingTile, testedNumbers)
        newSudoku = columnSolver.solver(newSudoku, solvingTile, testedNumbers)
        newSudoku = squareSolver.solver(newSudoku, solvingTile, testedNumbers)
        return newSudoku
    }
}
