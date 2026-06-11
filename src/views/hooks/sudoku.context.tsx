import { type PropsWithChildren, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import type React from 'react'
import { generateSudoku, type SudokuModel } from '../../model/sudoku.model'
import {
    allUnlockUpgrades,
    isUnlockUpgradeCategoryAvailable,
    unlockUpgradeCategoryOrder,
    type UnlockUpgradeModel,
    type UpgradeFeature
} from '../../model/upgrades/unlockUpgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type SudokuSolver, areSolverPrerequisitesUnlocked } from '../../model/solvers/sudokuSolver'
import { useTick } from './tick.effect'
import { useSolvers } from './solvers.hook'
import { useUpgrades } from './upgrades.hook'
import { CORRECT_TILE_REWARD, PUZZLE_COMPLETE_BONUS, useMoney } from './money.hook'
import { trackSudokuErrors } from '../../model/solvers/errorTracker'
import { allDraftHelpers as draftHelpers, blockDraftHelper, columnDraftHelper, type DraftHelper, rowDraftHelper } from '../../model/draftHelpers/draftHelpers'
import { useSolverSpeeds, type SolverSpeedLevels } from './solverSpeeds.hook'
import { getSolverSpeedUpgradeCost, getSolverTotalSpeedUpgradeSpent, maxSolverSpeedLevel, normalizeSolverSpeedLevel } from '../../model/solvers/solverSpeed'
import { usePuzzleTransition } from './puzzleTransition.hook'
import {
    getPuzzleTransitionLevel,
    getPuzzleTransitionUpgradeCost,
    maxPuzzleTransitionLevel,
    normalizePuzzleTransitionLevel
} from '../../model/puzzleTransition'
import { fillValidDrafts } from '../../model/drafts'
import { useAutoQueueCooldown } from './autoQueueCooldown.hook'
import {
    getAutoQueueCooldownLevel,
    getAutoQueueCooldownUpgradeCost,
    maxAutoQueueCooldownLevel,
    normalizeAutoQueueCooldownLevel
} from '../../model/autoQueueCooldown'
import { getDifficultyTier, type DifficultyTier, type GameDifficulty } from '../../model/difficulty'
import { createPermanentUpgradeModel, type PermanentUpgradeModel } from '../../model/upgrades/permanentUpgrade'
import { useSolutionAssistChance } from './solutionAssistChance.hook'
import {
    getSolutionAssistChanceLevel,
    getSolutionAssistChanceUpgradeCost,
    maxSolutionAssistChanceLevel,
    normalizeSolutionAssistChanceLevel
} from '../../model/solvers/solutionAssistChance'

const MANUAL_VERY_EASY_SOLVED_GOAL = 3

interface AppliedUnlockState {
    solvers: SudokuSolver[]
    features: UpgradeFeature[]
}

export interface SudokuContextModel {
    solution: number[] | undefined
    sudoku: SudokuModel | undefined
    setSudoku: React.Dispatch<React.SetStateAction<SudokuModel | undefined>>
    selectedTile: number | undefined
    setSelectedTile: React.Dispatch<React.SetStateAction<number | undefined>>
    solverTile: number | undefined
    draftMode: boolean
    setDraftMode: React.Dispatch<React.SetStateAction<boolean>>
    solvers: SudokuSolver[]
    autoSolvers: SudokuSolver[]
    currentSolver: SudokuSolver | undefined
    solverQueue: SudokuSolver[]
    setCurrentSolver: (solver?: SudokuSolver) => void
    setSolverQueue: (solvers: SudokuSolver[]) => void
    queueSolver: (solver: SudokuSolver) => void
    runSolverManually: (solver: SudokuSolver) => void
    setAutoSolverActive: (solver: SudokuSolver, active: boolean) => void
    solverSpeedLevels: SolverSpeedLevels
    getSolverSpeedLevel: (solver: SudokuSolver) => number
    purchaseSolverSpeedUpgrade: (solver: SudokuSolver, buyMax?: boolean) => void
    puzzleTransitionLevel: number
    puzzleTransitionDelayMs: number
    purchasePuzzleTransitionUpgrade: (buyMax?: boolean) => void
    unlockUpgrades: UnlockUpgradeModel[]
    permanentUpgrades: PermanentUpgradeModel[]
    permanentSolvers: SudokuSolver[]
    upgradeFeatures: UpgradeFeature[]
    setUnlockUpgrades: (upgrades: UnlockUpgradeModel[]) => void
    hasUpgradeFeature: (feature: UpgradeFeature) => boolean
    autoSolverQueueEnabled: boolean
    autoSolverCooldownUntil: number | undefined
    autoQueueCooldownLevel: number
    autoQueueCooldownDelayMs: number
    purchaseAutoQueueCooldownUpgrade: (buyMax?: boolean) => void
    solutionAssistChanceLevel: number
    solutionAssistChancePercent: number
    purchaseSolutionAssistChanceUpgrade: (buyMax?: boolean) => void
    setAutoSolverQueueEnabled: React.Dispatch<React.SetStateAction<boolean>>
    setAutoSolverCooldownUntil: React.Dispatch<React.SetStateAction<number | undefined>>
    autoPrestigeUnlocked: boolean
    autoPrestigeEnabled: boolean
    setAutoPrestigeEnabled: React.Dispatch<React.SetStateAction<boolean>>
    purchasePermanentAutoPrestige: () => void
    cheatSolve: () => void
    reset: () => void
    isSolved: boolean
    setIsSolved: React.Dispatch<React.SetStateAction<boolean>>
    setSolverTile: React.Dispatch<React.SetStateAction<number | undefined>>
    money: number
    isShiftPressed: boolean
    addMoney: (amount: number) => void
    purchaseUnlockUpgrade: (upgrade: UnlockUpgradeModel) => void
    purchasePermanentUpgrade: (upgrade: PermanentUpgradeModel) => void
    draftHelpers: DraftHelper[]
    solverDraftHelpers: DraftHelper[]
    difficultyTier: DifficultyTier
    prestigeLevel: number
    prestigePoints: number
    prestigeGoal: number
    manualVeryEasySolvedCount: number
    manualVeryEasySolvedGoal: number
    manualOpeningComplete: boolean
    canPrestige: boolean
    prestige: () => void
    completeSolvedPuzzle: () => void
    selectedDifficultyIndex: number
    changeDifficulty: (index: number) => void
    prestigeReward: number
    permanentSolverSpeedLevel: number
    permanentGridTimingLevel: number
    permanentAutoQueueCooldownLevel: number
    permanentSolutionAssistChanceLevel: number
    purchasePermanentSolverSpeedLevel: () => void
    purchasePermanentGridTimingLevel: () => void
    purchasePermanentAutoQueueCooldownLevel: () => void
    purchasePermanentSolutionAssistChanceLevel: () => void
}

const SudokuContext = createContext<SudokuContextModel>({} as unknown as SudokuContextModel)

const getUpgradeRemovalIds = (upgrade: UnlockUpgradeModel): Set<string> => {
    const replacedSolverIds = upgrade.solver?.replaces?.map(solver => solver.id) ?? []
    return new Set([
        upgrade.id,
        ...allUnlockUpgrades
            .filter(candidate => candidate.solver !== undefined && replacedSolverIds.includes(candidate.solver.id))
            .map(candidate => candidate.id)
    ])
}

const getPermanentUnlockUpgrades = (permanentUpgradeIds: string[]): UnlockUpgradeModel[] => {
    const permanentUpgradeIdsSet = new Set(permanentUpgradeIds)
    return allUnlockUpgrades.filter(upgrade => permanentUpgradeIdsSet.has(upgrade.id))
}

const getPermanentlyCoveredUpgradeIds = (permanentUpgradeIds: string[]): Set<string> => {
    const coveredUpgradeIds = new Set<string>()
    getPermanentUnlockUpgrades(permanentUpgradeIds).forEach((upgrade) => {
        getUpgradeRemovalIds(upgrade).forEach(id => { coveredUpgradeIds.add(id) })
    })
    return coveredUpgradeIds
}

const sortUnlockUpgrades = (upgrades: UnlockUpgradeModel[]): UnlockUpgradeModel[] => {
    const getIndex = (upgrade: UnlockUpgradeModel): number => {
        return allUnlockUpgrades.findIndex(u => u.id === upgrade.id)
    }
    return [...upgrades].sort((a, b) => getIndex(a) - getIndex(b))
}

const addSolverToState = (solvers: SudokuSolver[], solver: SudokuSolver): SudokuSolver[] => {
    const replacedSolverIds = solver.replaces?.map(replacedSolver => replacedSolver.id) ?? []
    const nextSolvers = solvers.filter(existingSolver =>
        existingSolver.id !== solver.id && !replacedSolverIds.includes(existingSolver.id)
    )
    return [...nextSolvers, solver]
}

const getAppliedUnlockState = (upgrades: UnlockUpgradeModel[]): AppliedUnlockState => {
    return sortUnlockUpgrades(upgrades).reduce<AppliedUnlockState>((state, upgrade) => {
        const solvers = upgrade.solver !== undefined
            ? addSolverToState(state.solvers, upgrade.solver)
            : state.solvers
        const features = upgrade.feature !== undefined && !state.features.includes(upgrade.feature)
            ? [...state.features, upgrade.feature]
            : state.features

        return {
            solvers,
            features
        }
    }, { solvers: [], features: [] })
}

const getRemainingUnlockUpgrades = (permanentUpgradeIds: string[]): UnlockUpgradeModel[] => {
    const coveredUpgradeIds = getPermanentlyCoveredUpgradeIds(permanentUpgradeIds)
    return allUnlockUpgrades.filter(upgrade => !coveredUpgradeIds.has(upgrade.id))
}

const isOpeningCategoryAvailable = (
    category: UnlockUpgradeModel['category'],
    manualOpeningComplete: boolean
): boolean => {
    if (manualOpeningComplete) return true
    return unlockUpgradeCategoryOrder.indexOf(category) < unlockUpgradeCategoryOrder.indexOf('basicSolvers')
}

const isUpgradeAvailable = (
    upgrade: UnlockUpgradeModel,
    difficulty: GameDifficulty,
    manualOpeningComplete: boolean
): boolean =>
    isOpeningCategoryAvailable(upgrade.category, manualOpeningComplete) &&
    isUnlockUpgradeCategoryAvailable(upgrade.category, difficulty)

export const SudokuProvider = (props: PropsWithChildren): JSX.Element => {
    const [sudoku, setStoredSudoku] = useLocalStorageState<SudokuModel | undefined>('sudoku')
    const [solution, setSolution] = useLocalStorageState<number[] | undefined>('solution')
    const [selectedTile, setSelectedTile] = useState<number | undefined>(undefined)
    const [solverTile, setSolverTile] = useLocalStorageState<number | undefined>('solverTile')
    const [draftMode, setDraftMode] = useLocalStorageState<boolean>('draftMode', { defaultValue: false })
    const [isSolved, setIsSolved] = useLocalStorageState<boolean>('isSolved', { defaultValue: false })
    const [autoSolverQueueEnabled, setStoredAutoSolverQueueEnabled] = useLocalStorageState<boolean>('autoSolverQueueEnabled', { defaultValue: true })
    const [autoSolverCooldownUntil, setAutoSolverCooldownUntil] = useState<number | undefined>(undefined)
    const [autoPrestigeEnabled, setAutoPrestigeEnabled] = useLocalStorageState<boolean>('autoPrestigeEnabled', { defaultValue: true })
    const [autoPrestigeUnlocked, setAutoPrestigeUnlocked] = useLocalStorageState<boolean>('autoPrestigeUnlocked', { defaultValue: false })
    const [rewardedTileIndexes, setRewardedTileIndexes] = useLocalStorageState<number[]>('rewardedTileIndexes', { defaultValue: [] })
    const [prestigeLevel, setPrestigeLevel] = useLocalStorageState<number>('prestigeLevel', { defaultValue: 0 })
    const [selectedDifficultyIndex, setSelectedDifficultyIndex] = useLocalStorageState<number>('selectedDifficultyIndex', { defaultValue: 0 })
    const [prestigePoints, setPrestigePoints] = useLocalStorageState<number>('prestigePoints', { defaultValue: 0 })
    const [permanentUpgradeIds, setPermanentUpgradeIds] = useLocalStorageState<string[]>('permanentUpgradeIds', { defaultValue: [] })

    // Migration for permanent draft helper upgrades: since they are unlocked by default, remove them from permanentUpgradeIds
    const draftHelperUpgradeIds = ['row-draft-helper-upgrade', 'column-draft-helper-upgrade', 'block-draft-helper-upgrade', 'draft-helpers-upgrade']
    if (permanentUpgradeIds.some(id => draftHelperUpgradeIds.includes(id))) {
        const filteredIds = permanentUpgradeIds.filter(id => !draftHelperUpgradeIds.includes(id))
        setPermanentUpgradeIds([...new Set(filteredIds)])
    }

    const [manualVeryEasySolvedCount, setManualVeryEasySolvedCount] = useLocalStorageState<number>('manualVeryEasySolvedCount', { defaultValue: 0 })
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Shift') {
                setIsShiftPressed(true)
            }
        }
        const handleKeyUp = (e: KeyboardEvent): void => {
            if (e.key === 'Shift') {
                setIsShiftPressed(false)
            }
        }
        const handleBlur = (): void => {
            setIsShiftPressed(false)
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        window.addEventListener('blur', handleBlur)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.removeEventListener('blur', handleBlur)
        }
    }, [])

    const currentDifficultyIndex = Math.min(selectedDifficultyIndex, prestigeLevel)
    const difficultyTier = getDifficultyTier(currentDifficultyIndex)
    const prestigeReward = getDifficultyTier(prestigeLevel).prestigeReward
    const manualOpeningComplete = true
    const permanentlyCoveredUpgradeIds = getPermanentlyCoveredUpgradeIds(permanentUpgradeIds)
    const permanentSolvers = getAppliedUnlockState(getPermanentUnlockUpgrades(permanentUpgradeIds)).solvers

    const {
        unlockUpgrades: storedUnlockUpgrades,
        upgradeFeatures,
        setUnlockUpgrades,
        setUpgradeFeatures,
        unlockUpgradeFeature
    } = useUpgrades()

    const {
        setCurrentSolver,
        solvers,
        autoSolvers,
        currentSolver,
        setSolvers,
        solverQueue,
        setSolverQueue,
        queueSolver,
        setAutoSolverActive,
        resetSolvers
    } = useSolvers()

    const { money, addMoney, spend, setMoney } = useMoney()
    const {
        solverSpeedLevels,
        getSolverSpeedLevel: storedGetSolverSpeedLevel,
        setSolverSpeedLevel,
        resetSolverSpeeds
    } = useSolverSpeeds()
    const {
        puzzleTransitionLevel: storedPuzzleTransitionLevel,
        setPuzzleTransitionLevel,
        resetPuzzleTransition
    } = usePuzzleTransition()
    const {
        autoQueueCooldownLevel: storedAutoQueueCooldownLevel,
        setAutoQueueCooldownLevel,
        resetAutoQueueCooldown
    } = useAutoQueueCooldown()
    const {
        solutionAssistChanceLevel: storedSolutionAssistChanceLevel,
        setSolutionAssistChanceLevel,
        resetSolutionAssistChance
    } = useSolutionAssistChance()

    const [permanentSolverSpeedLevel, setPermanentSolverSpeedLevel] = useLocalStorageState<number>('permanentSolverSpeedLevel', { defaultValue: 0 })
    const [permanentGridTimingLevel, setPermanentGridTimingLevel] = useLocalStorageState<number>('permanentGridTimingLevel', { defaultValue: 0 })
    const [permanentAutoQueueCooldownLevel, setPermanentAutoQueueCooldownLevel] = useLocalStorageState<number>('permanentAutoQueueCooldownLevel', { defaultValue: 0 })
    const [permanentSolutionAssistChanceLevel, setPermanentSolutionAssistChanceLevel] = useLocalStorageState<number>('permanentSolutionAssistChanceLevel', { defaultValue: 0 })

    const getSolverSpeedLevel = (solver: SudokuSolver): number =>
        normalizeSolverSpeedLevel(storedGetSolverSpeedLevel(solver) + (permanentSolverSpeedLevel ?? 0))

    const puzzleTransitionLevel = normalizePuzzleTransitionLevel(storedPuzzleTransitionLevel + (permanentGridTimingLevel ?? 0))
    const autoQueueCooldownLevel = normalizeAutoQueueCooldownLevel(storedAutoQueueCooldownLevel + (permanentAutoQueueCooldownLevel ?? 0))
    const solutionAssistChanceLevel = normalizeSolutionAssistChanceLevel(storedSolutionAssistChanceLevel + (permanentSolutionAssistChanceLevel ?? 0))

    const puzzleTransitionDelayMs = getPuzzleTransitionLevel(puzzleTransitionLevel).delayMs
    const autoQueueCooldownDelayMs = getAutoQueueCooldownLevel(autoQueueCooldownLevel).delayMs
    const solutionAssistChancePercent = getSolutionAssistChanceLevel(solutionAssistChanceLevel).chancePercent
    const solverDraftHelpers = [
        upgradeFeatures.includes('solverRowDraftHelper') ? rowDraftHelper : undefined,
        upgradeFeatures.includes('solverColumnDraftHelper') ? columnDraftHelper : undefined,
        upgradeFeatures.includes('solverBlockDraftHelper') ? blockDraftHelper : undefined
    ].filter((helper): helper is DraftHelper => helper !== undefined)
    const unlockUpgrades = storedUnlockUpgrades.filter(upgrade =>
        !permanentlyCoveredUpgradeIds.has(upgrade.id) &&
        isUpgradeAvailable(upgrade, getDifficultyTier(prestigeLevel).difficulty, manualOpeningComplete)
    )
    const permanentUpgrades = allUnlockUpgrades
        .filter(upgrade =>
            !permanentlyCoveredUpgradeIds.has(upgrade.id) &&
            isUpgradeAvailable(upgrade, getDifficultyTier(prestigeLevel).difficulty, manualOpeningComplete)
        )
        .map(createPermanentUpgradeModel)
    const totalUnlockUpgradesCost = allUnlockUpgrades.reduce((sum, upgrade) => sum + upgrade.cost, 0)
    const prestigeGoal = totalUnlockUpgradesCost * Math.pow(2, prestigeLevel)
    const canPrestige = money >= prestigeGoal

    const hasValueUpdate = (nextSudoku: SudokuModel, previousSudoku?: SudokuModel): boolean =>
        previousSudoku === undefined ||
        nextSudoku.some((tile, index) => tile.value !== previousSudoku[index]?.value)

    const getRewardableCorrectTiles = (nextSudoku: SudokuModel, previousSudoku?: SudokuModel): number[] => {
        if (solution === undefined || previousSudoku === undefined) return []
        const rewardedTileIndexesSet = new Set(rewardedTileIndexes)

        return nextSudoku
            .map((tile, index) => ({ tile, index }))
            .filter(({ tile, index }) =>
                !tile.fixed &&
                !rewardedTileIndexesSet.has(index) &&
                tile.value === solution[index] &&
                previousSudoku[index]?.value !== solution[index]
            )
            .map(({ index }) => index)
    }

    const rewardCorrectTiles = (nextSudoku: SudokuModel, previousSudoku?: SudokuModel): void => {
        const correctTileIndexes = getRewardableCorrectTiles(nextSudoku, previousSudoku)
        if (correctTileIndexes.length === 0) return

        setRewardedTileIndexes([...new Set([...rewardedTileIndexes, ...correctTileIndexes])])
        addMoney(correctTileIndexes.length * CORRECT_TILE_REWARD * difficultyTier.rewardMultiplier)
    }

    const setSudoku: React.Dispatch<SetStateAction<SudokuModel | undefined>> = (action) => {
        const previousSudoku = sudoku
        const nextSudoku = typeof action === 'function'
            ? action(previousSudoku)
            : action

        if (nextSudoku === undefined || solution === undefined) {
            setStoredSudoku(nextSudoku)
            return
        }

        if (!hasValueUpdate(nextSudoku, previousSudoku)) {
            setStoredSudoku(nextSudoku)
            return
        }

        const trackedSudoku = trackSudokuErrors(nextSudoku, solution)
        rewardCorrectTiles(trackedSudoku, previousSudoku)
        setStoredSudoku(trackedSudoku)
    }

    const startPuzzle = (difficulty = difficultyTier.difficulty, features = upgradeFeatures): void => {
        const [puzzle, nextSolution] = generateSudoku(difficulty)
        setStoredSudoku(features.includes('startWithDrafts') ? fillValidDrafts(puzzle) : puzzle)
        setSolution(nextSolution)
        setIsSolved(false)
        setSolverTile(undefined)
        setCurrentSolver(undefined)
        setSolverQueue([])
        setAutoSolverCooldownUntil(undefined)
        setRewardedTileIndexes([])
    }

    const reset = (): void => {
        startPuzzle()
    }

    const hasUpgradeFeature = (feature: UpgradeFeature): boolean => upgradeFeatures.includes(feature)

    const setAutoSolverQueueEnabled: React.Dispatch<React.SetStateAction<boolean>> = (action) => {
        const nextEnabled = typeof action === 'function'
            ? action(autoSolverQueueEnabled)
            : action

        if (!nextEnabled) setAutoSolverCooldownUntil(undefined)
        setStoredAutoSolverQueueEnabled(nextEnabled)
    }

    const runSolverManually = (solver: SudokuSolver): void => {
        setAutoSolverCooldownUntil(undefined)
        setSolverQueue([])
        setCurrentSolver(solver)
        setSolverTile(0)
    }

    const removePurchasedUnlockUpgrade = (upgrade: UnlockUpgradeModel): void => {
        const removalIds = getUpgradeRemovalIds(upgrade)
        setUnlockUpgrades(storedUnlockUpgrades.filter(u => !removalIds.has(u.id)))
    }

    const applyUnlockUpgrade = (upgrade: UnlockUpgradeModel): void => {
        if (upgrade.solver !== undefined) {
            let newSolvers = addSolverToState(solvers, upgrade.solver)
            if (upgrade.solver.replaces !== undefined) {
                const totalRefund = upgrade.solver.replaces.reduce((sum, replacedSolver) => {
                    const level = getSolverSpeedLevel(replacedSolver)
                    return sum + getSolverTotalSpeedUpgradeSpent(level)
                }, 0)
                if (totalRefund > 0) {
                    addMoney(totalRefund)
                }
                setSolverSpeedLevel(upgrade.solver, 0)
                upgrade.solver.replaces.forEach(replacedSolver => {
                    setSolverSpeedLevel(replacedSolver, 0)
                })
                const replacedSolverIds = upgrade.solver.replaces.map(solver => solver.id)
                newSolvers = newSolvers.filter(solver => !replacedSolverIds.includes(solver.id) || solver.id === upgrade.solver?.id)
            }
            setSolvers(newSolvers)
        }
        if (upgrade.feature !== undefined) {
            unlockUpgradeFeature(upgrade.feature)
            if (upgrade.feature === 'autoSolverQueue') setAutoSolverQueueEnabled(true)
        }
    }

    const purchaseUnlockUpgrade = (upgrade: UnlockUpgradeModel): void => {
        const upgradeAvailable = unlockUpgrades.some((availableUpgrade) => availableUpgrade.id === upgrade.id)
        if (!upgradeAvailable) return
        if (upgrade.solver !== undefined && !areSolverPrerequisitesUnlocked(solvers, upgrade.solver)) return

        const spent = spend(upgrade.cost)
        if (!spent) return

        applyUnlockUpgrade(upgrade)
        removePurchasedUnlockUpgrade(upgrade)
    }

    const purchasePermanentUpgrade = (upgrade: PermanentUpgradeModel): void => {
        const upgradeAvailable = permanentUpgrades.some((availableUpgrade) => availableUpgrade.id === upgrade.id)
        if (!upgradeAvailable) return
        if (upgrade.solver !== undefined && !areSolverPrerequisitesUnlocked(permanentSolvers, upgrade.solver)) return
        if (prestigePoints < upgrade.permanentCost) return

        setPrestigePoints(currentPrestigePoints => currentPrestigePoints - upgrade.permanentCost)
        setPermanentUpgradeIds([...new Set([...permanentUpgradeIds, upgrade.id])])
        applyUnlockUpgrade(upgrade)
        removePurchasedUnlockUpgrade(upgrade)
    }

    const purchaseSolverSpeedUpgrade = (solver: SudokuSolver, buyMax?: boolean): void => {
        if (!solvers.some(unlockedSolver => unlockedSolver.id === solver.id)) return

        const currentLevel = getSolverSpeedLevel(solver)
        if (currentLevel >= maxSolverSpeedLevel) return

        if (buyMax === true) {
            let tempLevel = currentLevel
            let totalCost = 0
            while (tempLevel < maxSolverSpeedLevel) {
                const cost = getSolverSpeedUpgradeCost(tempLevel)
                if (totalCost + cost <= money) {
                    totalCost += cost
                    tempLevel++
                } else {
                    break
                }
            }
            if (tempLevel > currentLevel) {
                const spent = spend(totalCost)
                if (spent) {
                    setSolverSpeedLevel(solver, tempLevel - (permanentSolverSpeedLevel ?? 0))
                }
            }
        } else {
            const spent = spend(getSolverSpeedUpgradeCost(currentLevel))
            if (!spent) return
            setSolverSpeedLevel(solver, (solverSpeedLevels[solver.id] ?? 0) + 1)
        }
    }

    const purchasePuzzleTransitionUpgrade = (buyMax?: boolean): void => {
        if (puzzleTransitionLevel >= maxPuzzleTransitionLevel) return

        if (buyMax === true) {
            let tempLevel = puzzleTransitionLevel
            let totalCost = 0
            while (tempLevel < maxPuzzleTransitionLevel) {
                const cost = getPuzzleTransitionUpgradeCost(tempLevel)
                if (totalCost + cost <= money) {
                    totalCost += cost
                    tempLevel++
                } else {
                    break
                }
            }
            if (tempLevel > puzzleTransitionLevel) {
                const spent = spend(totalCost)
                if (spent) {
                    setPuzzleTransitionLevel(tempLevel - (permanentGridTimingLevel ?? 0))
                }
            }
        } else {
            const spent = spend(getPuzzleTransitionUpgradeCost(puzzleTransitionLevel))
            if (!spent) return
            setPuzzleTransitionLevel(storedPuzzleTransitionLevel + 1)
        }
    }

    const purchaseAutoQueueCooldownUpgrade = (buyMax?: boolean): void => {
        if (!upgradeFeatures.includes('autoSolverQueue')) return
        if (autoQueueCooldownLevel >= maxAutoQueueCooldownLevel) return

        if (buyMax === true) {
            let tempLevel = autoQueueCooldownLevel
            let totalCost = 0
            while (tempLevel < maxAutoQueueCooldownLevel) {
                const cost = getAutoQueueCooldownUpgradeCost(tempLevel)
                if (totalCost + cost <= money) {
                    totalCost += cost
                    tempLevel++
                } else {
                    break
                }
            }
            if (tempLevel > autoQueueCooldownLevel) {
                const spent = spend(totalCost)
                if (spent) {
                    setAutoSolverCooldownUntil(undefined)
                    setAutoQueueCooldownLevel(tempLevel - (permanentAutoQueueCooldownLevel ?? 0))
                }
            }
        } else {
            const spent = spend(getAutoQueueCooldownUpgradeCost(autoQueueCooldownLevel))
            if (!spent) return
            setAutoSolverCooldownUntil(undefined)
            setAutoQueueCooldownLevel(storedAutoQueueCooldownLevel + 1)
        }
    }

    const purchaseSolutionAssistChanceUpgrade = (buyMax?: boolean): void => {
        if (solutionAssistChanceLevel >= maxSolutionAssistChanceLevel) return

        if (buyMax === true) {
            let tempLevel = solutionAssistChanceLevel
            let totalCost = 0
            while (tempLevel < maxSolutionAssistChanceLevel) {
                const cost = getSolutionAssistChanceUpgradeCost(tempLevel)
                if (totalCost + cost <= money) {
                    totalCost += cost
                    tempLevel++
                } else {
                    break
                }
            }
            if (tempLevel > solutionAssistChanceLevel) {
                const spent = spend(totalCost)
                if (spent) {
                    setSolutionAssistChanceLevel(tempLevel - (permanentSolutionAssistChanceLevel ?? 0))
                }
            }
        } else {
            const spent = spend(getSolutionAssistChanceUpgradeCost(solutionAssistChanceLevel))
            if (!spent) return
            setSolutionAssistChanceLevel(storedSolutionAssistChanceLevel + 1)
        }
    }

    const purchasePermanentSolverSpeedLevel = (): void => {
        if (permanentSolverSpeedLevel >= maxSolverSpeedLevel) return
        const cost = 2 * (permanentSolverSpeedLevel + 1)
        if (prestigePoints < cost) return
        setPrestigePoints(current => current - cost)
        setPermanentSolverSpeedLevel(current => current + 1)
    }

    const purchasePermanentGridTimingLevel = (): void => {
        if (permanentGridTimingLevel >= maxPuzzleTransitionLevel) return
        const cost = permanentGridTimingLevel + 1
        if (prestigePoints < cost) return
        setPrestigePoints(current => current - cost)
        setPermanentGridTimingLevel(current => current + 1)
    }

    const purchasePermanentAutoQueueCooldownLevel = (): void => {
        if (permanentAutoQueueCooldownLevel >= maxAutoQueueCooldownLevel) return
        const cost = permanentAutoQueueCooldownLevel + 1
        if (prestigePoints < cost) return
        setPrestigePoints(current => current - cost)
        setPermanentAutoQueueCooldownLevel(current => current + 1)
    }

    const purchasePermanentSolutionAssistChanceLevel = (): void => {
        if (permanentSolutionAssistChanceLevel >= maxSolutionAssistChanceLevel) return
        const cost = permanentSolutionAssistChanceLevel + 1
        if (prestigePoints < cost) return
        setPrestigePoints(current => current - cost)
        setPermanentSolutionAssistChanceLevel(current => current + 1)
    }

    const completeSolvedPuzzle = (): void => {
        if (
            difficultyTier.difficulty === 'very-easy' &&
            prestigeLevel === 0 &&
            solvers.length === 0 &&
            manualVeryEasySolvedCount < MANUAL_VERY_EASY_SOLVED_GOAL
        ) {
            setManualVeryEasySolvedCount(currentCount => Math.min(currentCount + 1, MANUAL_VERY_EASY_SOLVED_GOAL))
        }

        addMoney(PUZZLE_COMPLETE_BONUS * difficultyTier.rewardMultiplier)
    }

    const changeDifficulty = (index: number): void => {
        const clampedIndex = Math.max(0, Math.min(index, prestigeLevel))
        setSelectedDifficultyIndex(clampedIndex)
        const nextTier = getDifficultyTier(clampedIndex)
        startPuzzle(nextTier.difficulty)
    }

    const prestige = (): void => {
        if (!canPrestige) return

        const nextPrestigeLevel = prestigeLevel + 1
        const nextDifficultyTier = getDifficultyTier(nextPrestigeLevel)
        const permanentState = getAppliedUnlockState(getPermanentUnlockUpgrades(permanentUpgradeIds))

        setPrestigePoints(currentPrestigePoints => currentPrestigePoints + prestigeReward)
        setPrestigeLevel(nextPrestigeLevel)
        setSelectedDifficultyIndex(nextPrestigeLevel)
        setMoney(0)
        resetSolverSpeeds()
        resetPuzzleTransition()
        resetAutoQueueCooldown()
        resetSolutionAssistChance()
        resetSolvers(permanentState.solvers)
        setUpgradeFeatures(permanentState.features)
        setUnlockUpgrades(getRemainingUnlockUpgrades(permanentUpgradeIds))
        setStoredAutoSolverQueueEnabled(permanentState.features.includes('autoSolverQueue'))
        setDraftMode(false)
        setSelectedTile(undefined)
        startPuzzle(nextDifficultyTier.difficulty, permanentState.features)
    }

    const cheatSolve = (): void => {
        if (solution === undefined || sudoku === undefined) return
        const newSudoku = sudoku.map((tile, i) => ({
            ...tile,
            value: solution[i],
            error: false
        }))
        setStoredSudoku(newSudoku)
        setIsSolved(true)
        setSolverTile(undefined)
        setCurrentSolver(undefined)
        setSolverQueue([])
    }

    const purchasePermanentAutoPrestige = (): void => {
        if (autoPrestigeUnlocked) return
        const cost = 6
        if (prestigePoints < cost) return
        setPrestigePoints(current => current - cost)
        setAutoPrestigeUnlocked(true)
        setAutoPrestigeEnabled(true)
    }

    useEffect(() => {
        if (autoPrestigeUnlocked && autoPrestigeEnabled && canPrestige) {
            prestige()
        }
    }, [money, prestigeGoal, canPrestige, autoPrestigeEnabled, autoPrestigeUnlocked, prestige])

    const value: SudokuContextModel = {
        sudoku,
        setSudoku,
        solution,
        selectedTile,
        setSelectedTile,
        solverTile,
        draftMode,
        setDraftMode,
        solvers,
        autoSolvers,
        currentSolver,
        solverQueue,
        unlockUpgrades,
        permanentUpgrades,
        permanentSolvers,
        upgradeFeatures,
        setUnlockUpgrades,
        cheatSolve,
        reset,
        isSolved,
        setIsSolved,
        setCurrentSolver,
        setSolverQueue,
        queueSolver,
        runSolverManually,
        setAutoSolverActive,
        solverSpeedLevels,
        getSolverSpeedLevel,
        purchaseSolverSpeedUpgrade,
        puzzleTransitionLevel,
        puzzleTransitionDelayMs,
        purchasePuzzleTransitionUpgrade,
        setSolverTile,
        money,
        isShiftPressed,
        addMoney,
        purchaseUnlockUpgrade,
        purchasePermanentUpgrade,
        hasUpgradeFeature,
        autoSolverQueueEnabled,
        autoSolverCooldownUntil,
        autoQueueCooldownLevel,
        autoQueueCooldownDelayMs,
        purchaseAutoQueueCooldownUpgrade,
        solutionAssistChanceLevel,
        solutionAssistChancePercent,
        purchaseSolutionAssistChanceUpgrade,
        setAutoSolverQueueEnabled,
        setAutoSolverCooldownUntil,
        autoPrestigeUnlocked,
        autoPrestigeEnabled,
        setAutoPrestigeEnabled,
        purchasePermanentAutoPrestige,
        draftHelpers,
        solverDraftHelpers,
        difficultyTier,
        prestigeLevel,
        prestigePoints,
        prestigeGoal,
        manualVeryEasySolvedCount,
        manualVeryEasySolvedGoal: MANUAL_VERY_EASY_SOLVED_GOAL,
        manualOpeningComplete,
        canPrestige,
        prestige,
        completeSolvedPuzzle,
        selectedDifficultyIndex,
        changeDifficulty,
        prestigeReward,
        permanentSolverSpeedLevel,
        permanentGridTimingLevel,
        permanentAutoQueueCooldownLevel,
        permanentSolutionAssistChanceLevel,
        purchasePermanentSolverSpeedLevel,
        purchasePermanentGridTimingLevel,
        purchasePermanentAutoQueueCooldownLevel,
        purchasePermanentSolutionAssistChanceLevel
    }

    useTick(value)

    return (
        <SudokuContext.Provider value={value}>
            {props.children}
        </SudokuContext.Provider>
    )
}

export const useSudoku = (): SudokuContextModel => {
    return useContext(SudokuContext)
}
