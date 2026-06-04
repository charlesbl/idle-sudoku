import { cloneSudoku, type SudokuModel } from '../sudoku.model'
import { getBlockId } from '../../utils/utils'

export type SolverStep = (
    sudoku: SudokuModel,
    solvingTile: number,
    testedNumbers: TestedNumber[],
    solution?: number[],
    solutionAssistChancePercent?: number
) => SudokuModel
export interface TestedNumber {
    index: number
    isDraft: boolean
}

const keepSolverOutputSafe = (previousSudoku: SudokuModel, nextSudoku: SudokuModel, solution: number[]): SudokuModel => {
    if (nextSudoku.length !== previousSudoku.length || solution.length !== previousSudoku.length) {
        return previousSudoku
    }

    const isDraftStillLocallyValid = (tileIndex: number, value: number): boolean => {
        const rowId = Math.floor(tileIndex / 9)
        const columnId = tileIndex % 9
        const blockId = getBlockId(tileIndex)

        return previousSudoku.every((tile, index) => {
            if (tile.value !== value) return true
            return Math.floor(index / 9) !== rowId &&
                index % 9 !== columnId &&
                getBlockId(index) !== blockId
        })
    }

    return nextSudoku.map((nextTile, index) => {
        const previousTile = previousSudoku[index]
        const solutionValue = solution[index]
        const safeTile = {
            ...nextTile,
            draftNumbers: [...nextTile.draftNumbers]
        }

        if (previousTile.fixed || previousTile.value !== undefined) {
            return {
                ...previousTile,
                draftNumbers: [...previousTile.draftNumbers]
            }
        }

        if (safeTile.value !== undefined && safeTile.value !== solutionValue) {
            safeTile.value = undefined
            safeTile.error = previousTile.error
        }

        if (safeTile.value === undefined && previousTile.draftNumbers[solutionValue - 1]) {
            safeTile.draftNumbers[solutionValue - 1] = true
        }

        safeTile.draftNumbers = safeTile.draftNumbers.map((isDraft, draftIndex) => {
            if (isDraft || !previousTile.draftNumbers[draftIndex]) return isDraft
            return isDraftStillLocallyValid(index, draftIndex + 1)
        })

        return safeTile
    })
}

export const runSolverStep = (
    solverStep: SolverStep,
    sudoku: SudokuModel,
    solvingTile: number,
    solution?: number[],
    solutionAssistChancePercent?: number
): SudokuModel => {
    if (sudoku[solvingTile].fixed) return sudoku
    const previousSudoku = cloneSudoku(sudoku)
    const solverSudoku = cloneSudoku(sudoku)
    const testedNumbers = solverSudoku[solvingTile].draftNumbers.map((isDraft, i): TestedNumber => ({ index: i, isDraft })).filter((draftNb) => draftNb.isDraft)
    const nextSudoku = solverStep(solverSudoku, solvingTile, testedNumbers, solution, solutionAssistChancePercent)
    return solution === undefined
        ? nextSudoku
        : keepSolverOutputSafe(previousSudoku, nextSudoku, solution)
}
