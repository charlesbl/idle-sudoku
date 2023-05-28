import { getSquareId } from '../../utils/utils'
import { type SudokuModel } from '../sudoku.model'
import { type DraftHelper } from './draftHelpers'

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
