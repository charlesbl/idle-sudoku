import { type PropsWithChildren, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import type React from 'react'
import { generateSudoku, type SudokuModel } from '../../model/sudoku.model'
import {
    allUnlockUpgrades,
    draftHelpersPermanentUpgrade,
    getCurrentUnlockUpgradeCategory,
    isUnlockUpgradeCategoryAvailable,
    unlockUpgradeCategoryOrder,
    type UnlockUpgradeModel,
    type UpgradeFeature
} from '../../model/upgrades/unlockUpgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type SudokuSolver } from '../../model/solvers/sudokuSolver'
import { useTick } from './tick.effect'
import { useSolvers } from './solvers.hook'
import { useUpgrades } from './upgrades.hook'
import { CORRECT_TILE_REWARD, PUZZLE_COMPLETE_BONUS, useMoney } from './money.hook'
import { trackSudokuErrors } from '../../model/solvers/errorTracker'
import { blockDraftHelper, columnDraftHelper, type DraftHelper, rowDraftHelper } from '../../model/draftHelpers/draftHelpers'
import { useDraftHelpers } from './draftHelpers.hook'
import { useSolverSpeeds, type SolverSpeedLevels } from './solverSpeeds.hook'
import { getSolverSpeedUpgradeCost, getSolverTotalSpeedUpgradeSpent, maxSolverSpeedLevel } from '../../model/solvers/solverSpeed'
import { usePuzzleTransition } from './puzzleTransition.hook'
import {
    getPuzzleTransitionLevel,
    getPuzzleTransitionUpgradeCost,
    maxPuzzleTransitionLevel
} from '../../model/puzzleTransition'
import { fillValidDrafts } from '../../model/drafts'
import { useAutoQueueCooldown } from './autoQueueCooldown.hook'
import {
    getAutoQueueCooldownLevel,
    getAutoQueueCooldownUpgradeCost,
    maxAutoQueueCooldownLevel
} from '../../model/autoQueueCooldown'
import { getDifficultyTier, type DifficultyTier, type GameDifficulty } from '../../model/difficulty'
import { createPermanentUpgradeModel, type PermanentUpgradeModel } from '../../model/upgrades/permanentUpgrade'
import { useSolutionAssistChance } from './solutionAssistChance.hook'
import {
    getSolutionAssistChanceLevel,
    getSolutionAssistChanceUpgradeCost,
    maxSolutionAssistChanceLevel
} from '../../model/solvers/solutionAssistChance'

const MANUAL_VERY_EASY_SOLVED_GOAL = 3

interface AppliedUnlockState {
    solvers: SudokuSolver[]
    draftHelpers: DraftHelper[]
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
    addDraftHelper: (id: string) => void
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
}

const SudokuContext = createContext<SudokuContextModel>({} as any)

const getUpgradeRemovalIds = (upgrade: UnlockUpgradeModel): Set<string> => {
    const replacedSolverIds = upgrade.solver?.replaces?.map(solver => solver.id) ?? []
    const ids = new Set([
        upgrade.id,
        ...allUnlockUpgrades
            .filter(candidate => candidate.solver !== undefined && replacedSolverIds.includes(candidate.solver.id))
            .map(candidate => candidate.id)
    ])
    if (upgrade.id === 'draft-helpers-upgrade') {
        ids.add('row-draft-helper-upgrade')
        ids.add('column-draft-helper-upgrade')
        ids.add('block-draft-helper-upgrade')
    }
    return ids
}

const getPermanentUnlockUpgrades = (permanentUpgradeIds: string[]): UnlockUpgradeModel[] => {
    const permanentUpgradeIdsSet = new Set(permanentUpgradeIds)
    const upgrades = allUnlockUpgrades.filter(upgrade => permanentUpgradeIdsSet.has(upgrade.id))
    if (permanentUpgradeIdsSet.has(draftHelpersPermanentUpgrade.id)) {
        upgrades.push(draftHelpersPermanentUpgrade)
    }
    return upgrades
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
        if (upgrade.id === 'draft-helpers-upgrade') {
            return -1
        }
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
        let draftHelpers = state.draftHelpers
        if (upgrade.draftHelper !== undefined && !draftHelpers.some(helper => helper.id === upgrade.draftHelper?.id)) {
            draftHelpers = [...draftHelpers, upgrade.draftHelper]
        }
        if (upgrade.draftHelpers !== undefined) {
            upgrade.draftHelpers.forEach(helper => {
                if (!draftHelpers.some(h => h.id === helper.id)) {
                    draftHelpers = [...draftHelpers, helper]
                }
            })
        }
        const features = upgrade.feature !== undefined && !state.features.includes(upgrade.feature)
            ? [...state.features, upgrade.feature]
            : state.features

        return {
            solvers,
            draftHelpers,
            features
        }
    }, { solvers: [], draftHelpers: [], features: [] })
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
    const [rewardedTileIndexes, setRewardedTileIndexes] = useLocalStorageState<number[]>('rewardedTileIndexes', { defaultValue: [] })
    const [prestigeLevel, setPrestigeLevel] = useLocalStorageState<number>('prestigeLevel', { defaultValue: 0 })
    const [prestigePoints, setPrestigePoints] = useLocalStorageState<number>('prestigePoints', { defaultValue: 0 })
    const [permanentUpgradeIds, setPermanentUpgradeIds] = useLocalStorageState<string[]>('permanentUpgradeIds', { defaultValue: [] })

    // Migration for permanent draft helper upgrades:
    // If they bought any of the old draft helpers permanently, convert it to the new merged permanent upgrade
    const oldDraftHelperUpgradeIds = ['row-draft-helper-upgrade', 'column-draft-helper-upgrade', 'block-draft-helper-upgrade']
    if (permanentUpgradeIds.some(id => oldDraftHelperUpgradeIds.includes(id))) {
        const filteredIds = permanentUpgradeIds.filter(id => !oldDraftHelperUpgradeIds.includes(id))
        filteredIds.push('draft-helpers-upgrade')
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

    const difficultyTier = getDifficultyTier(prestigeLevel)
    const manualOpeningComplete = true
    const permanentlyCoveredUpgradeIds = getPermanentlyCoveredUpgradeIds(permanentUpgradeIds)

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
    const { draftHelpers, addDraftHelper, setDraftHelpers } = useDraftHelpers()

    // Ensure that if 'draft-helpers-upgrade' is bought permanently, all three draft helpers are active
    useEffect(() => {
        if (permanentUpgradeIds.includes('draft-helpers-upgrade')) {
            const hasRow = draftHelpers.some(h => h.id === 'row')
            const hasColumn = draftHelpers.some(h => h.id === 'column')
            const hasBlock = draftHelpers.some(h => h.id === 'block')
            if (!hasRow || !hasColumn || !hasBlock) {
                addDraftHelper('row')
                addDraftHelper('column')
                addDraftHelper('block')
            }
        }
    }, [permanentUpgradeIds, draftHelpers, addDraftHelper])
    const {
        solverSpeedLevels,
        getSolverSpeedLevel,
        setSolverSpeedLevel,
        upgradeSolverSpeed,
        resetSolverSpeeds
    } = useSolverSpeeds()
    const {
        puzzleTransitionLevel,
        setPuzzleTransitionLevel,
        upgradePuzzleTransition,
        resetPuzzleTransition
    } = usePuzzleTransition()
    const {
        autoQueueCooldownLevel,
        setAutoQueueCooldownLevel,
        upgradeAutoQueueCooldown,
        resetAutoQueueCooldown
    } = useAutoQueueCooldown()
    const {
        solutionAssistChanceLevel,
        setSolutionAssistChanceLevel,
        upgradeSolutionAssistChance,
        resetSolutionAssistChance
    } = useSolutionAssistChance()
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
        isUpgradeAvailable(upgrade, difficultyTier.difficulty, manualOpeningComplete)
    )
    const permanentUpgrades = [
        ...(!permanentlyCoveredUpgradeIds.has(draftHelpersPermanentUpgrade.id) &&
        isUpgradeAvailable(draftHelpersPermanentUpgrade, difficultyTier.difficulty, manualOpeningComplete)
            ? [createPermanentUpgradeModel(draftHelpersPermanentUpgrade)]
            : []),
        ...allUnlockUpgrades
            .filter(upgrade =>
                upgrade.category !== 'draftHelpers' &&
                !permanentlyCoveredUpgradeIds.has(upgrade.id) &&
                isUpgradeAvailable(upgrade, difficultyTier.difficulty, manualOpeningComplete)
            )
            .map(createPermanentUpgradeModel)
    ]
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
        if (upgrade.draftHelper !== undefined) {
            addDraftHelper(upgrade.draftHelper.id)
        }
        if (upgrade.draftHelpers !== undefined) {
            upgrade.draftHelpers.forEach(helper => {
                addDraftHelper(helper.id)
            })
        }
        if (upgrade.feature !== undefined) {
            unlockUpgradeFeature(upgrade.feature)
            if (upgrade.feature === 'autoSolverQueue') setAutoSolverQueueEnabled(true)
        }
    }

    const purchaseUnlockUpgrade = (upgrade: UnlockUpgradeModel): void => {
        const upgradeAvailable = unlockUpgrades.some((availableUpgrade) => availableUpgrade.id === upgrade.id)
        if (!upgradeAvailable || upgrade.category !== getCurrentUnlockUpgradeCategory(unlockUpgrades)) return

        const spent = spend(upgrade.cost)
        if (!spent) return

        applyUnlockUpgrade(upgrade)
        removePurchasedUnlockUpgrade(upgrade)
    }

    const purchasePermanentUpgrade = (upgrade: PermanentUpgradeModel): void => {
        const upgradeAvailable = permanentUpgrades.some((availableUpgrade) => availableUpgrade.id === upgrade.id)
        if (!upgradeAvailable || upgrade.category !== getCurrentUnlockUpgradeCategory(permanentUpgrades)) return
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
                    setSolverSpeedLevel(solver, tempLevel)
                }
            }
        } else {
            const spent = spend(getSolverSpeedUpgradeCost(currentLevel))
            if (!spent) return
            upgradeSolverSpeed(solver)
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
                    setPuzzleTransitionLevel(tempLevel)
                }
            }
        } else {
            const spent = spend(getPuzzleTransitionUpgradeCost(puzzleTransitionLevel))
            if (!spent) return
            upgradePuzzleTransition()
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
                    setAutoQueueCooldownLevel(tempLevel)
                }
            }
        } else {
            const spent = spend(getAutoQueueCooldownUpgradeCost(autoQueueCooldownLevel))
            if (!spent) return
            setAutoSolverCooldownUntil(undefined)
            upgradeAutoQueueCooldown()
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
                    setSolutionAssistChanceLevel(tempLevel)
                }
            }
        } else {
            const spent = spend(getSolutionAssistChanceUpgradeCost(solutionAssistChanceLevel))
            if (!spent) return
            upgradeSolutionAssistChance()
        }
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

    const prestige = (): void => {
        if (!canPrestige) return

        const nextPrestigeLevel = prestigeLevel + 1
        const nextDifficultyTier = getDifficultyTier(nextPrestigeLevel)
        const permanentState = getAppliedUnlockState(getPermanentUnlockUpgrades(permanentUpgradeIds))

        setPrestigePoints(currentPrestigePoints => currentPrestigePoints + difficultyTier.prestigeReward)
        setPrestigeLevel(nextPrestigeLevel)
        setMoney(0)
        resetSolverSpeeds()
        resetPuzzleTransition()
        resetAutoQueueCooldown()
        resetSolutionAssistChance()
        resetSolvers(permanentState.solvers)
        setDraftHelpers(permanentState.draftHelpers)
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
        draftHelpers,
        solverDraftHelpers,
        addDraftHelper,
        difficultyTier,
        prestigeLevel,
        prestigePoints,
        prestigeGoal,
        manualVeryEasySolvedCount,
        manualVeryEasySolvedGoal: MANUAL_VERY_EASY_SOLVED_GOAL,
        manualOpeningComplete,
        canPrestige,
        prestige,
        completeSolvedPuzzle
    }

    const tickeffect = useTick(value)
    tickeffect()

    return (
        <SudokuContext.Provider value={value}>
            {props.children}
        </SudokuContext.Provider>
    )
}

export const useSudoku = (): SudokuContextModel => {
    return useContext(SudokuContext)
}
