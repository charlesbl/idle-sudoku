import useLocalStorageState from 'use-local-storage-state'
import { maxSolutionAssistChanceLevel, normalizeSolutionAssistChanceLevel } from '../../model/solvers/solutionAssistChance'

interface SolutionAssistChanceHook {
    solutionAssistChanceLevel: number
    setSolutionAssistChanceLevel: (level: number) => void
    upgradeSolutionAssistChance: () => void
    resetSolutionAssistChance: () => void
}

export const useSolutionAssistChance = (): SolutionAssistChanceHook => {
    const [storedSolutionAssistChanceLevel, setSolutionAssistChanceLevel] = useLocalStorageState<number>('solutionAssistChanceLevel', { defaultValue: 0 })
    const solutionAssistChanceLevel = normalizeSolutionAssistChanceLevel(storedSolutionAssistChanceLevel)

    const upgradeSolutionAssistChance = (): void => {
        if (solutionAssistChanceLevel >= maxSolutionAssistChanceLevel) return
        setSolutionAssistChanceLevel(solutionAssistChanceLevel + 1)
    }

    const resetSolutionAssistChance = (): void => {
        setSolutionAssistChanceLevel(0)
    }

    return {
        solutionAssistChanceLevel,
        setSolutionAssistChanceLevel,
        upgradeSolutionAssistChance,
        resetSolutionAssistChance
    }
}
