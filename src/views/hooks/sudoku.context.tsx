import { type PropsWithChildren, type SetStateAction, createContext, useContext, useState } from 'react'
import type React from 'react'
import { type CustomDifficulty, generateSudoku, type SudokuModel } from '../../model/sudoku.model'
import { getUnlockedUpgradeCategory, type UpgradeFeature, type UpgradeModel } from '../../model/upgrades/upgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type SudokuSolver } from '../../model/solvers/sudokuSolver'
import { useTick } from './tick.effect'
import { useSolvers } from './solvers.hook'
import { useUpgrades } from './upgrades.hook'
import { useMoney } from './money.hook'
import { trackSudokuErrors } from '../../model/solvers/errorTracker'
import { blockDraftHelper, columnDraftHelper, type DraftHelper, rowDraftHelper } from '../../model/draftHelpers/draftHelpers'
import { useDraftHelpers } from './draftHelpers.hook'

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
    upgrades: UpgradeModel[]
    upgradeFeatures: UpgradeFeature[]
    setUpgrades: (upgrades: UpgradeModel[]) => void
    hasUpgradeFeature: (feature: UpgradeFeature) => boolean
    autoSolverQueueEnabled: boolean
    setAutoSolverQueueEnabled: React.Dispatch<React.SetStateAction<boolean>>
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
    const [autoSolverQueueEnabled, setAutoSolverQueueEnabled] = useLocalStorageState<boolean>('autoSolverQueueEnabled', { defaultValue: true })

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
    const solverDraftHelpers = [
        upgradeFeatures.includes('solverRowDraftHelper') ? rowDraftHelper : undefined,
        upgradeFeatures.includes('solverColumnDraftHelper') ? columnDraftHelper : undefined,
        upgradeFeatures.includes('solverBlockDraftHelper') ? blockDraftHelper : undefined
    ].filter((helper): helper is DraftHelper => helper !== undefined)

    const hasValueUpdate = (nextSudoku: SudokuModel, previousSudoku?: SudokuModel): boolean =>
        previousSudoku === undefined ||
        nextSudoku.some((tile, index) => tile.value !== previousSudoku[index]?.value)

    const setSudoku: React.Dispatch<SetStateAction<SudokuModel | undefined>> = (action) => {
        setStoredSudoku((previousSudoku) => {
            const nextSudoku = typeof action === 'function'
                ? action(previousSudoku)
                : action

            if (nextSudoku === undefined || solution === undefined) return nextSudoku
            if (!hasValueUpdate(nextSudoku, previousSudoku)) return nextSudoku

            return trackSudokuErrors(nextSudoku, solution)
        })
    }

    const reset = (): void => {
        const [puzzle, solution] = generateSudoku(DIFFICULTY)
        setStoredSudoku(puzzle)
        setSolution(solution)
        setIsSolved(false)
        setSolverTile(undefined)
        setCurrentSolver(undefined)
        setSolverQueue([])
    }

    const hasUpgradeFeature = (feature: UpgradeFeature): boolean => upgradeFeatures.includes(feature)

    const purchaseUpgrade = (upgrade: UpgradeModel): void => {
        const upgradeAvailable = upgrades.some((availableUpgrade) => availableUpgrade.id === upgrade.id)
        if (!upgradeAvailable || upgrade.category !== getUnlockedUpgradeCategory(upgrades)) return

        const spent = spend(upgrade.cost)
        if (!spent) return
        if (upgrade.solver !== undefined) {
            let newSolvers = [...solvers, upgrade.solver]
            if (upgrade.solver.replaces !== undefined) {
                const replacedSolverIds = upgrade.solver.replaces.map(solver => solver.id)
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

    const cheatSolve = (): void => {
        if (solution === undefined || sudoku === undefined) return
        const newSudoku = sudoku.map((tile, i) => ({
            ...tile,
            value: solution[i],
            error: false
        }))
        setSudoku(newSudoku)
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
        setSolverTile,
        money,
        addMoney,
        purchaseUpgrade,
        hasUpgradeFeature,
        autoSolverQueueEnabled,
        setAutoSolverQueueEnabled,
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
