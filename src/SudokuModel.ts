import { getSudoku } from 'sudoku-gen'

export interface TileModel {
    value: number | undefined
    draftNumbers: boolean[]
    fixed: boolean
}

export type SudokuModel = TileModel[]

export const generateSudoku = (): [SudokuModel, SudokuModel] => {
    const sudokugen = getSudoku('easy')
    const puzzle = sudokugen.puzzle.split('').map((value) => {
        const fixed = value !== '-'
        return { value: fixed ? parseInt(value) : undefined, draftNumbers: Array(9).fill(true), fixed }
    })
    const solution = sudokugen.solution.split('').map((value) => {
        return { value: parseInt(value), draftNumbers: [], fixed: true }
    })
    return [puzzle, solution]
}
