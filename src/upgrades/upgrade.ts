export interface UpgradeModel {
    name: string
    cost: number
    description: string
    onPurchase: () => void
}

export const allUpgrades: UpgradeModel[] = [
    {
        name: 'Line Strategy',
        cost: 10,
        description: 'Unlock the line strategy for the solver',
        onPurchase: () => {
            console.log('Line Strategy purchased')
        }
    },
    {
        name: 'Column Strategy',
        cost: 10,
        description: 'Unlock the column strategy for the solver',
        onPurchase: () => {
            console.log('Column Strategy purchased')
        }
    }
]
