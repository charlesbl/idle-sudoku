import { getSquareId } from '../../utils/utils'
import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategy'

export const lastTileDraftStrategy: Strategy = {
    id: 'last-tile-draft',
    name: 'Last tile draft strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]) => {
        if (testedNumbers.length !== 1 || sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        newSudoku[solvingTile].value = testedNumbers[0].index + 1
        return newSudoku
    }
}

export const lastLineDraftStrategy: Strategy = {
    id: 'last-line-draft',
    name: 'Last line draft strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const line = newSudoku.map((tm, i) => ({ ...tm, i })).filter((_, index) => Math.floor(index / 9) === Math.floor(solvingTile / 9))
        testedNumbers.forEach((testedNb) => {
            if (line.every((tile) => tile.i === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}

export const lastColumnDraftStrategy: Strategy = {
    id: 'last-column-draft',
    name: 'Last column draft strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const column = newSudoku.map((tm, i) => ({ ...tm, i })).filter((_, index) => Math.floor(index % 9) === Math.floor(solvingTile % 9))
        testedNumbers.forEach((testedNb) => {
            if (column.every((tile) => tile.i === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}

export const lastSquareDraftStrategy: Strategy = {
    id: 'last-square-draft',
    name: 'Last square draft strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const square = newSudoku.map((tm, i) => ({ ...tm, i })).filter((_, index) => getSquareId(index) === getSquareId(solvingTile))
        testedNumbers.forEach((testedNb) => {
            if (square.every((tile) => tile.i === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}

export const lastDraftStrategy: Strategy = {
    id: 'last-draft-all',
    name: 'Last draft strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        let newSudoku = lastLineDraftStrategy.solver(sudoku, solvingTile, testedNumbers)
        newSudoku = lastColumnDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        newSudoku = lastSquareDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        newSudoku = lastTileDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        return newSudoku
    },
    overrideStrategies: [lastLineDraftStrategy, lastColumnDraftStrategy, lastSquareDraftStrategy, lastTileDraftStrategy]
}
