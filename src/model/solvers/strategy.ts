import { type Solver } from './solver'

export interface Strategy {
    id: string
    name: string
    solver: Solver
}
