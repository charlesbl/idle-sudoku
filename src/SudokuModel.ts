export interface TileModel {
    value: number | undefined
    draftNumbers: boolean[]
}

export const generateSudoku = (): TileModel[] => {
    return Array(81).fill(0).map(() => ({ value: undefined, draftNumbers: Array(9).fill(false) }))
}
