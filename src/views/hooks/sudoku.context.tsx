import { type PropsWithChildren, type SetStateAction, createContext, useContext, useState } from 'react'
import type React from 'react'
import { type CustomDifficulty, generateSudoku, type SudokuModel } from '../../model/sudoku.model'
import { getUnlockedUpgradeCategory, type UpgradeFeature, type UpgradeModel } from '../../model/upgrades/upgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type SudokuSolver } from '../../model/solvers/sudokuSolver'
import { useTick } from './tick.effect'
import { useSolvers } from './solvers.hook'
import { useUpgrades } from './upgrades.hook'
import { CORRECT_TILE_REWARD, useMoney } from './money.hook'
import { trackSudokuErrors } from '../../model/solvers/errorTracker'
import { blockDraftHelper, columnDraftHelper, type DraftHelper, rowDraftHelper } from '../../model/draftHelpers/draftHelpers'
import { useDraftHelpers } from './draftHelpers.hook'
import { useSolverSpeeds, type SolverSpeedLevels } from './solverSpeeds.hook'
import { getSolverSpeedUpgradeCost, maxSolverSpeedLevel } from '../../model/solvers/solverSpeed'
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

const DIFFICULTY: CustomDifficulty = 'medium'

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
    setAutoSolverActive: (solver: SudokuSolver, active: boolean) => void
    solverSpeedLevels: SolverSpeedLevels
    getSolverSpeedLevel: (solver: SudokuSolver) => number
    purchaseSolverSpeedUpgrade: (solver: SudokuSolver) => void
    puzzleTransitionLevel: number
    puzzleTransitionDelayMs: number
    purchasePuzzleTransitionUpgrade: () => void
    upgrades: UpgradeModel[]
    upgradeFeatures: UpgradeFeature[]
    setUpgrades: (upgrades: UpgradeModel[]) => void
    hasUpgradeFeature: (feature: UpgradeFeature) => boolean
    autoSolverQueueEnabled: boolean
    autoSolverCooldownUntil: number | undefined
    autoQueueCooldownLevel: number
    autoQueueCooldownDelayMs: number
    purchaseAutoQueueCooldownUpgrade: () => void
    setAutoSolverQueueEnabled: React.Dispatch<React.SetStateAction<boolean>>
    setAutoSolverCooldownUntil: React.Dispatch<React.SetStateAction<number | undefined>>
    cheatSolve: () => void
    reset: () => void
    isSolved: boolean
    setIsSolved: React.Dispatch<React.SetStateAction<boolean>>
    setSolverTile: React.Dispatch<React.SetStateAction<number | undefined>>
    money: number
    addMoney: (amount: number) => void
    purchaseUpgrade: (upgrade: UpgradeModel) => void
    draftHelpers: DraftHelper[]
    solverDraftHelpers: DraftHelper[]
    addDraftHelper: (id: string) => void
}

const SudokuContext = createContext<SudokuContextModel>({} as any)

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

    const { upgrades, upgradeFeatures, setUpgrades, unlockUpgradeFeature } = useUpgrades()

    const {
        setCurrentSolver,
        solvers,
        autoSolvers,
        currentSolver,
        setSolvers,
        solverQueue,
        setSolverQueue,
        queueSolver,
        setAutoSolverActive
    } = useSolvers()

    const { money, addMoney, spend } = useMoney()
    const { draftHelpers, addDraftHelper } = useDraftHelpers()
    const {
        solverSpeedLevels,
        getSolverSpeedLevel,
        setSolverSpeedLevel,
        upgradeSolverSpeed
    } = useSolverSpeeds()
    const {
        puzzleTransitionLevel,
        upgradePuzzleTransition
    } = usePuzzleTransition()
    const {
        autoQueueCooldownLevel,
        upgradeAutoQueueCooldown
    } = useAutoQueueCooldown()
    const puzzleTransitionDelayMs = getPuzzleTransitionLevel(puzzleTransitionLevel).delayMs
    const autoQueueCooldownDelayMs = getAutoQueueCooldownLevel(autoQueueCooldownLevel).delayMs
    const solverDraftHelpers = [
        upgradeFeatures.includes('solverRowDraftHelper') ? rowDraftHelper : undefined,
        upgradeFeatures.includes('solverColumnDraftHelper') ? columnDraftHelper : undefined,
        upgradeFeatures.includes('solverBlockDraftHelper') ? blockDraftHelper : undefined
    ].filter((helper): helper is DraftHelper => helper !== undefined)

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
        addMoney(correctTileIndexes.length * CORRECT_TILE_REWARD)
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

    const reset = (): void => {
        const [puzzle, solution] = generateSudoku(DIFFICULTY)
        setStoredSudoku(upgradeFeatures.includes('startWithDrafts') ? fillValidDrafts(puzzle) : puzzle)
        setSolution(solution)
        setIsSolved(false)
        setSolverTile(undefined)
        setCurrentSolver(undefined)
        setSolverQueue([])
        setAutoSolverCooldownUntil(undefined)
        setRewardedTileIndexes([])
    }

    const hasUpgradeFeature = (feature: UpgradeFeature): boolean => upgradeFeatures.includes(feature)

    const setAutoSolverQueueEnabled: React.Dispatch<React.SetStateAction<boolean>> = (action) => {
        const nextEnabled = typeof action === 'function'
            ? action(autoSolverQueueEnabled)
            : action

        if (!nextEnabled) setAutoSolverCooldownUntil(undefined)
        setStoredAutoSolverQueueEnabled(nextEnabled)
    }

    const purchaseUpgrade = (upgrade: UpgradeModel): void => {
        const upgradeAvailable = upgrades.some((availableUpgrade) => availableUpgrade.id === upgrade.id)
        if (!upgradeAvailable || upgrade.category !== getUnlockedUpgradeCategory(upgrades)) return

        const spent = spend(upgrade.cost)
        if (!spent) return
        if (upgrade.solver !== undefined) {
            let newSolvers = [...solvers, upgrade.solver]
            if (upgrade.solver.replaces !== undefined) {
                const replacedSolverIds = upgrade.solver.replaces.map(solver => solver.id)
                const inheritedSpeedLevel = Math.max(
                    getSolverSpeedLevel(upgrade.solver),
                    ...upgrade.solver.replaces.map(solver => getSolverSpeedLevel(solver))
                )
                setSolverSpeedLevel(upgrade.solver, inheritedSpeedLevel)
                newSolvers = newSolvers.filter(solver => !replacedSolverIds.includes(solver.id))
            }
            setSolvers(newSolvers)
        }
        if (upgrade.draftHelper !== undefined) {
            addDraftHelper(upgrade.draftHelper.id)
        }
        if (upgrade.feature !== undefined) {
            unlockUpgradeFeature(upgrade.feature)
            if (upgrade.feature === 'autoSolverQueue') setAutoSolverQueueEnabled(true)
        }
        const replacedSolverIds = upgrade.solver?.replaces?.map(solver => solver.id) ?? []
        setUpgrades(upgrades.filter((u) =>
            u.id !== upgrade.id &&
            (u.solver === undefined || !replacedSolverIds.includes(u.solver.id))
        ))
    }

    const purchaseSolverSpeedUpgrade = (solver: SudokuSolver): void => {
        if (!solvers.some(unlockedSolver => unlockedSolver.id === solver.id)) return

        const currentLevel = getSolverSpeedLevel(solver)
        if (currentLevel >= maxSolverSpeedLevel) return

        const spent = spend(getSolverSpeedUpgradeCost(currentLevel))
        if (!spent) return

        upgradeSolverSpeed(solver)
    }

    const purchasePuzzleTransitionUpgrade = (): void => {
        if (puzzleTransitionLevel >= maxPuzzleTransitionLevel) return

        const spent = spend(getPuzzleTransitionUpgradeCost(puzzleTransitionLevel))
        if (!spent) return

        upgradePuzzleTransition()
    }

    const purchaseAutoQueueCooldownUpgrade = (): void => {
        if (!upgradeFeatures.includes('autoSolverQueue')) return
        if (autoQueueCooldownLevel >= maxAutoQueueCooldownLevel) return

        const spent = spend(getAutoQueueCooldownUpgradeCost(autoQueueCooldownLevel))
        if (!spent) return

        setAutoSolverCooldownUntil(undefined)
        upgradeAutoQueueCooldown()
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
        upgrades,
        upgradeFeatures,
        setUpgrades,
        cheatSolve,
        reset,
        isSolved,
        setIsSolved,
        setCurrentSolver,
        setSolverQueue,
        queueSolver,
        setAutoSolverActive,
        solverSpeedLevels,
        getSolverSpeedLevel,
        purchaseSolverSpeedUpgrade,
        puzzleTransitionLevel,
        puzzleTransitionDelayMs,
        purchasePuzzleTransitionUpgrade,
        setSolverTile,
        money,
        addMoney,
        purchaseUpgrade,
        hasUpgradeFeature,
        autoSolverQueueEnabled,
        autoSolverCooldownUntil,
        autoQueueCooldownLevel,
        autoQueueCooldownDelayMs,
        purchaseAutoQueueCooldownUpgrade,
        setAutoSolverQueueEnabled,
        setAutoSolverCooldownUntil,
        draftHelpers,
        solverDraftHelpers,
        addDraftHelper
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
