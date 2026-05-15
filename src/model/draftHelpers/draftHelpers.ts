import { getBlockId } from '../../utils/utils'
import { type SudokuModel } from '../sudoku.model'

export interface DraftHelper {
    id: string
    help: (sudoku: SudokuModel, selectedTile: number) => void
}

export const columnDraftHelper: DraftHelper = {
    id: 'column',
    help: (sudoku: SudokuModel, selectedTile: number): void => {
        const value = sudoku[selectedTile].value
        if (value === undefined) return
        const column = sudoku.filter((_, index) => Math.floor(index % 9) === Math.floor(selectedTile % 9))
        column.forEach((tile) => {
            if (tile.value === undefined) {
                tile.draftNumbers[value - 1] = false
            }
        })
    }
}

export const rowDraftHelper: DraftHelper = {
    id: 'row',
    help: (sudoku: SudokuModel, selectedTile: number): void => {
        const value = sudoku[selectedTile].value
        if (value === undefined) return
        const row = sudoku.filter((_, index) => Math.floor(index / 9) === Math.floor(selectedTile / 9))
        row.forEach((tile) => {
            if (tile.value === undefined) {
                tile.draftNumbers[value - 1] = false
            }
        })
    }
}

export const blockDraftHelper: DraftHelper = {
    id: 'block',
    help: (sudoku: SudokuModel, selectedTile: number): void => {
        const value = sudoku[selectedTile].value
        if (value === undefined) return
        const block = sudoku.filter((_, index) => getBlockId(index) === getBlockId(selectedTile))
        block.forEach((tile) => {
            if (tile.value === undefined) {
                tile.draftNumbers[value - 1] = false
            }
        })
    }
}

export const allDraftHelpers: DraftHelper[] = [
    rowDraftHelper,
    columnDraftHelper,
    blockDraftHelper
]
