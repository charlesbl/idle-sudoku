import useLocalStorageState from 'use-local-storage-state'

const START_MONEY = 0

export interface MoneyHook {
    money: number
    spend: (value: number) => boolean
    addMoney: (value: number) => void
}

export const useMoney = (): MoneyHook => {
    const [money, setMoney] = useLocalStorageState<number>('money', { defaultValue: START_MONEY })

    const addMoney = (value: number): void => {
        setMoney(money + value)
    }

    const spend = (value: number): boolean => {
        if (money < value) return false
        addMoney(-value)
        return true
    }

    return {
        money,
        addMoney,
        spend
    }
}
