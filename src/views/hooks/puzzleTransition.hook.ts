import useLocalStorageState from 'use-local-storage-state'
import { maxPuzzleTransitionLevel, normalizePuzzleTransitionLevel } from '../../model/puzzleTransition'

interface PuzzleTransitionHook {
    puzzleTransitionLevel: number
    upgradePuzzleTransition: () => void
}

export const usePuzzleTransition = (): PuzzleTransitionHook => {
    const [storedPuzzleTransitionLevel, setPuzzleTransitionLevel] = useLocalStorageState<number>('puzzleTransitionLevel', { defaultValue: 0 })
    const puzzleTransitionLevel = normalizePuzzleTransitionLevel(storedPuzzleTransitionLevel)

    const upgradePuzzleTransition = (): void => {
        if (puzzleTransitionLevel >= maxPuzzleTransitionLevel) return
        setPuzzleTransitionLevel(puzzleTransitionLevel + 1)
    }

    return {
        puzzleTransitionLevel,
        upgradePuzzleTransition
    }
}
