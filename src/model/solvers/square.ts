import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategies'

export const squareSolver: Strategy = {
    id: 'square',
    name: 'Square Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        const newSudoku = [...sudoku]
        const square = newSudoku.filter((_, index) => getSquareId(index) === getSquareId(solvingTile))
        testedNumbers.forEach((testedNb) => {
            if (square.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const draftSquareSolver: Strategy = {
    id: 'draft-square',
    name: 'Draft Square Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
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

const getSquareId = (tileId: number): number => (Math.floor((tileId % 27) / 3) % 3) + Math.floor(tileId / 27) * 3
