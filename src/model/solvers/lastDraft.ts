import { type SudokuModel } from '../SudokuModel'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategies'

export const lastDraftSolver: Strategy = {
    id: 'last-draft',
    name: 'Last Draft Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]) => {
        if (testedNumbers.length !== 1) return sudoku
        const newSudoku = [...sudoku]
        newSudoku[solvingTile].value = testedNumbers[0].index + 1
        return newSudoku
    }
}
