import useLocalStorageState from 'use-local-storage-state'
import { type SudokuSolver } from '../../model/solvers/sudokuSolver'
import { allSolvers, defaultSolvers } from '../../model/solvers/solvers'

interface SolverHook {
    solvers: SudokuSolver[]
    autoSolvers: SudokuSolver[]
    currentSolver: SudokuSolver | undefined
    solverQueue: SudokuSolver[]
    setCurrentSolver: (solver?: SudokuSolver) => void
    setSolvers: (solvers: SudokuSolver[]) => void
    setSolverQueue: (solvers: SudokuSolver[]) => void
    queueSolver: (solver: SudokuSolver) => void
    setAutoSolverActive: (solver: SudokuSolver, active: boolean) => void
    resetSolvers: (solvers?: SudokuSolver[]) => void
}

export const useSolvers = (): SolverHook => {
    const [currentSolverId, setCurrentSolverId] = useLocalStorageState<string | undefined>('currentSolverId')
    const [solverQueueIds, setSolverQueueIds] = useLocalStorageState<string[]>('solverQueueIds', { defaultValue: [] })
    const [disabledAutoSolverIds, setDisabledAutoSolverIds] = useLocalStorageState<string[]>('disabledAutoSolverIds', { defaultValue: [] })
    const [solverIds, setSolverIds] = useLocalStorageState<string[]>('solverIds', {
        defaultValue: defaultSolvers.map(solver => solver.id)
    })

    const getSolver = (id: string): SudokuSolver | undefined => allSolvers.find(solver => solver.id === id)
    const isDefaultSolverReplaced = (defaultSolver: SudokuSolver): boolean =>
        solverIds.some((id) =>
            getSolver(id)?.replaces?.some(solver => solver.id === defaultSolver.id) ?? false
        )
    const defaultSolverIds = defaultSolvers
        .filter(solver => !isDefaultSolverReplaced(solver))
        .map(solver => solver.id)
    const solverIdsWithDefaults = [...defaultSolverIds, ...solverIds]
    const mapSolverIds = (ids: string[]): SudokuSolver[] =>
        ids
            .map(id => getSolver(id))
            .filter((solver): solver is SudokuSolver => solver !== undefined)
    const solvers = mapSolverIds([...new Set(solverIdsWithDefaults)]).sort((a, b) => {
        const indexA = allSolvers.findIndex(solver => solver.id === a.id)
        const indexB = allSolvers.findIndex(solver => solver.id === b.id)
        return indexA - indexB
    })
    const setSolvers = (solvers: SudokuSolver[]): void => { setSolverIds(solvers.map(solver => solver.id)) }

    const currentSolver = currentSolverId !== undefined ? getSolver(currentSolverId) : undefined
    const setCurrentSolver = (solver?: SudokuSolver): void => { setCurrentSolverId(solver?.id) }
    const solverIdsSet = new Set(solvers.map(solver => solver.id))
    const solverQueue = mapSolverIds(solverQueueIds).filter(solver => solverIdsSet.has(solver.id))
    const setSolverQueue = (solvers: SudokuSolver[]): void => { setSolverQueueIds(solvers.map(solver => solver.id)) }
    const queueSolver = (solver: SudokuSolver): void => {
        if (currentSolverId === undefined && solverQueueIds.length === 0) {
            setCurrentSolver(solver)
            return
        }
        setSolverQueueIds([...solverQueueIds, solver.id])
    }
    const disabledAutoSolverIdsSet = new Set(disabledAutoSolverIds)
    const autoSolvers = solvers.filter(solver => !disabledAutoSolverIdsSet.has(solver.id))
    const setAutoSolverActive = (solver: SudokuSolver, active: boolean): void => {
        if (active) {
            setDisabledAutoSolverIds(disabledAutoSolverIds.filter(id => id !== solver.id))
            return
        }
        setDisabledAutoSolverIds([...new Set([...disabledAutoSolverIds, solver.id])])
        setSolverQueueIds(solverQueueIds.filter(id => id !== solver.id))
    }
    const resetSolvers = (nextSolvers: SudokuSolver[] = []): void => {
        setCurrentSolverId(undefined)
        setSolverQueueIds([])
        setSolverIds(nextSolvers.map(solver => solver.id))
    }

    return {
        solvers,
        autoSolvers,
        currentSolver,
        solverQueue,
        setCurrentSolver,
        setSolvers,
        setSolverQueue,
        queueSolver,
        setAutoSolverActive,
        resetSolvers
    }
}
