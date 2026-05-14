import { type SudokuModel } from '../sudoku.model'

export const trackSudokuErrors = (sudoku: SudokuModel, solution: number[]): SudokuModel =>
    sudoku.map((tile, index) => ({
        ...tile,
        error: tile.value !== undefined && tile.value !== solution[index]
    }))
