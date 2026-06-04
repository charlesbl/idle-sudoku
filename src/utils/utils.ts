
export const getBlockId = (tileId: number): number => (Math.floor((tileId % 27) / 3) % 3) + Math.floor(tileId / 27) * 3

export const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString()
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
    }).format(num)
}
