import { getSudoku } from 'sudoku-gen'

export interface TileModel {
    value: number | undefined
    draftNumbers: boolean[]
    fixed: boolean
}

export const generateSudoku = (): TileModel[] => {
    const sudokugen = getSudoku('easy')
    return sudokugen.puzzle.split('').map((value) => {
        const fixed = value !== '-'
        return { value: fixed ? parseInt(value) : undefined, draftNumbers: Array(9).fill(false), fixed }
    })
}
