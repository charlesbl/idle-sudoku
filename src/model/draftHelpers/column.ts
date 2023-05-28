import { type SudokuModel } from '../sudoku.model'
import { type DraftHelper } from './draftHelpers'

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
