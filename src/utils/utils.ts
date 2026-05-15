
export const getBlockId = (tileId: number): number => (Math.floor((tileId % 27) / 3) % 3) + Math.floor(tileId / 27) * 3
