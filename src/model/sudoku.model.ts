import { getSudoku } from 'sudoku-gen'
import { type Difficulty } from 'sudoku-gen/dist/types/difficulty.type'

export interface TileModel {
    value: number | undefined
    draftNumbers: boolean[]
    fixed: boolean
}

export type SudokuModel = TileModel[]

export const generateSudoku = (difficulty?: Difficulty): [SudokuModel, SudokuModel] => {
    const sudokugen = getSudoku(difficulty)
    const puzzle = sudokugen.puzzle.split('').map((value) => {
        const fixed = value !== '-'
        return { value: fixed ? parseInt(value) : undefined, draftNumbers: Array(9).fill(true), fixed }
    })
    const solution = sudokugen.solution.split('').map((value) => {
        return { value: parseInt(value), draftNumbers: [], fixed: true }
    })
    return [puzzle, solution]
}
