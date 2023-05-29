import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategy'

export const errorTrackerSolver: Strategy = {
    id: 'error-tracker',
    name: 'Error Tracker',
    solver: (sudoku: SudokuModel, solvingTile: number, _: TestedNumber[], solution?: number[]) => {
        if (solution === undefined) throw new Error('Solution is undefined')
        if (sudoku[solvingTile].value === undefined) {
            const newSudoku = [...sudoku]
            newSudoku[solvingTile].error = false
            return newSudoku
        }
        const newSudoku = [...sudoku]
        newSudoku[solvingTile].error = newSudoku[solvingTile].value !== solution[solvingTile]
        return newSudoku
    }
}
