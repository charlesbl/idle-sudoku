import { getSudoku } from 'sudoku-gen'
import { type Difficulty } from 'sudoku-gen/dist/types/difficulty.type'

export type CustomDifficulty = Difficulty | 'very-easy'

export interface TileModel {
    value: number | undefined
    draftNumbers: boolean[]
    fixed: boolean
    error: boolean
}

export type SudokuModel = TileModel[]

export const cloneSudoku = (sudoku: SudokuModel): SudokuModel =>
    sudoku.map(tile => ({ ...tile, draftNumbers: [...tile.draftNumbers] }))

export const generateSudoku = (difficulty?: CustomDifficulty): [SudokuModel, number[]] => {
    const sudokugen = getSudoku(difficulty === 'very-easy' ? 'easy' : difficulty)
    const puzzle = sudokugen.puzzle.split('').map((value) => {
        const fixed = value !== '-'
        return { value: fixed ? parseInt(value) : undefined, draftNumbers: Array(9).fill(false), fixed, error: false }
    })
    const solution = sudokugen.solution.split('').map((value) => {
        return parseInt(value)
    })
    if (difficulty === 'very-easy') {
        puzzle.filter((tile) => tile.value === undefined).forEach((tile) => {
            if (Math.random() < 0.5) {
                tile.value = solution[puzzle.indexOf(tile)]
                tile.fixed = true
            }
        })
    }
    return [puzzle, solution]
}
