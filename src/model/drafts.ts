import { type SudokuModel } from './sudoku.model'

const isValidDraft = (sudoku: SudokuModel, tileIndex: number, value: number): boolean => {
    const row = Math.floor(tileIndex / 9)
    const column = tileIndex % 9
    const blockRow = Math.floor(row / 3)
    const blockColumn = Math.floor(column / 3)

    return sudoku.every((tile, index) => {
        if (tile.value !== value) return true

        const testedRow = Math.floor(index / 9)
        const testedColumn = index % 9
        const testedBlockRow = Math.floor(testedRow / 3)
        const testedBlockColumn = Math.floor(testedColumn / 3)

        return testedRow !== row &&
            testedColumn !== column &&
            (testedBlockRow !== blockRow || testedBlockColumn !== blockColumn)
    })
}

export const fillValidDrafts = (sudoku: SudokuModel): SudokuModel =>
    sudoku.map((tile, tileIndex) => ({
        ...tile,
        draftNumbers: tile.value !== undefined
            ? Array(9).fill(false)
            : Array.from({ length: 9 }, (_, valueIndex) => isValidDraft(sudoku, tileIndex, valueIndex + 1))
    }))
