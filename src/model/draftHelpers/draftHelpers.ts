import { getSquareId } from '../../utils/utils'
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

export const lineDraftHelper: DraftHelper = {
    id: 'line',
    help: (sudoku: SudokuModel, selectedTile: number): void => {
        const value = sudoku[selectedTile].value
        if (value === undefined) return
        const line = sudoku.filter((_, index) => Math.floor(index / 9) === Math.floor(selectedTile / 9))
        line.forEach((tile) => {
            if (tile.value === undefined) {
                tile.draftNumbers[value - 1] = false
            }
        })
    }
}

export const squareDraftHelper: DraftHelper = {
    id: 'square',
    help: (sudoku: SudokuModel, selectedTile: number): void => {
        const value = sudoku[selectedTile].value
        if (value === undefined) return
        const square = sudoku.filter((_, index) => getSquareId(index) === getSquareId(selectedTile))
        square.forEach((tile) => {
            if (tile.value === undefined) {
                tile.draftNumbers[value - 1] = false
            }
        })
    }
}

export const allDraftHelpers: DraftHelper[] = [
    lineDraftHelper,
    columnDraftHelper,
    squareDraftHelper
]
