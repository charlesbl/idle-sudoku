import useLocalStorageState from 'use-local-storage-state'

const START_MONEY = 0

export const CORRECT_TILE_REWARD = 1
export const PUZZLE_COMPLETE_BONUS = 20

export interface MoneyHook {
    money: number
    spend: (value: number) => boolean
    addMoney: (value: number) => void
    setMoney: (value: number) => void
}

export const useMoney = (): MoneyHook => {
    const [money, setMoney] = useLocalStorageState<number>('money', { defaultValue: START_MONEY })

    const addMoney = (value: number): void => {
        setMoney(currentMoney => currentMoney + value)
    }

    const spend = (value: number): boolean => {
        if (money < value) return false
        setMoney(currentMoney => currentMoney - value)
        return true
    }

    return {
        money,
        addMoney,
        spend,
        setMoney
    }
}
