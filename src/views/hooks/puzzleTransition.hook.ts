import useLocalStorageState from 'use-local-storage-state'
import { maxPuzzleTransitionLevel, normalizePuzzleTransitionLevel } from '../../model/puzzleTransition'

interface PuzzleTransitionHook {
    puzzleTransitionLevel: number
    setPuzzleTransitionLevel: (level: number) => void
    upgradePuzzleTransition: () => void
    resetPuzzleTransition: () => void
}

export const usePuzzleTransition = (): PuzzleTransitionHook => {
    const [storedPuzzleTransitionLevel, setPuzzleTransitionLevel] = useLocalStorageState<number>('puzzleTransitionLevel', { defaultValue: 0 })
    const puzzleTransitionLevel = normalizePuzzleTransitionLevel(storedPuzzleTransitionLevel)

    const upgradePuzzleTransition = (): void => {
        if (puzzleTransitionLevel >= maxPuzzleTransitionLevel) return
        setPuzzleTransitionLevel(puzzleTransitionLevel + 1)
    }

    const resetPuzzleTransition = (): void => {
        setPuzzleTransitionLevel(0)
    }

    return {
        puzzleTransitionLevel,
        setPuzzleTransitionLevel,
        upgradePuzzleTransition,
        resetPuzzleTransition
    }
}
