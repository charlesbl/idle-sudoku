import { cloneSudoku, type SudokuModel } from '../sudoku.model'
import { type SudokuSolver } from './sudokuSolver'

export const solutionAssistSolver: SudokuSolver = {
    id: 'solution-assist',
    name: 'Lucky solution',
    solve: (
        sudoku: SudokuModel,
        solvingTile: number,
        _testedNumbers,
        solution?: number[],
        solutionAssistChancePercent = 1
    ): SudokuModel => {
        if (solution === undefined || sudoku[solvingTile].value !== undefined) return sudoku
        if (Math.random() * 100 >= solutionAssistChancePercent) return sudoku

        const newSudoku = cloneSudoku(sudoku)
        newSudoku[solvingTile].value = solution[solvingTile]
        newSudoku[solvingTile].error = false
        return newSudoku
    }
}
