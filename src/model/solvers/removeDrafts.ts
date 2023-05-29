import { getSquareId } from '../../utils/utils'
import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategy'

export const removeLineDraftStrategy: Strategy = {
    id: 'remove-line-draft',
    name: 'Remove line drafts strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const line = newSudoku.filter((_, index) => Math.floor(index / 9) === Math.floor(solvingTile / 9))
        testedNumbers.forEach((testedNb) => {
            if (line.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const removeColumnDraftStrategy: Strategy = {
    id: 'remove-column-draft',
    name: 'Remove column drafts strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const column = newSudoku.filter((_, index) => Math.floor(index % 9) === Math.floor(solvingTile % 9))
        testedNumbers.forEach((testedNb) => {
            if (column.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const removeSquareDraftStrategy: Strategy = {
    id: 'remove-square-draft',
    name: 'Remove square drafts strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const square = newSudoku.filter((_, index) => getSquareId(index) === getSquareId(solvingTile))
        testedNumbers.forEach((testedNb) => {
            if (square.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const removeAllDraftStrategy: Strategy = {
    id: 'remove-all-draft',
    name: 'Remove drafts strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        let newSudoku = removeLineDraftStrategy.solver(sudoku, solvingTile, testedNumbers)
        newSudoku = removeColumnDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        newSudoku = removeSquareDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        return newSudoku
    },
    overrideStrategies: [removeLineDraftStrategy, removeColumnDraftStrategy, removeSquareDraftStrategy]
}
