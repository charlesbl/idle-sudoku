import { getSudoku } from 'sudoku-gen'

export interface TileModel {
    value: number | undefined
    draftNumbers: boolean[]
    fixed: boolean
}

export const generateSudoku = (): TileModel[] => {
    const sudokugen = getSudoku('easy')
    return sudokugen.puzzle.split('').map((value) => {
        return { value: value === '-' ? undefined : parseInt(value), draftNumbers: Array(9).fill(false), fixed: true }
    })
}
