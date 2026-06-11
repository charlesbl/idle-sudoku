import { type Difficulty } from 'sudoku-gen/dist/types/difficulty.type'

export type GameDifficulty = Difficulty | 'very-easy'

export interface DifficultyTier {
    difficulty: GameDifficulty
    label: string
    rewardMultiplier: number
    prestigeReward: number
}

export const difficultyTiers: DifficultyTier[] = [
    { difficulty: 'very-easy', label: 'Very easy', rewardMultiplier: 1, prestigeReward: 4 },
    { difficulty: 'easy', label: 'Easy', rewardMultiplier: 2, prestigeReward: 6 },
    { difficulty: 'medium', label: 'Medium', rewardMultiplier: 4, prestigeReward: 9 },
    { difficulty: 'hard', label: 'Hard', rewardMultiplier: 8, prestigeReward: 14 },
    { difficulty: 'expert', label: 'Expert', rewardMultiplier: 16, prestigeReward: 20 }
]

export const getDifficultyTier = (prestigeLevel: number | undefined): DifficultyTier => {
    const normalizedPrestigeLevel = prestigeLevel === undefined || !Number.isFinite(prestigeLevel)
        ? 0
        : Math.max(Math.floor(prestigeLevel), 0)

    if (normalizedPrestigeLevel < difficultyTiers.length) {
        return difficultyTiers[normalizedPrestigeLevel]
    }

    const scale = Math.pow(2, normalizedPrestigeLevel)
    const expertTier = difficultyTiers[difficultyTiers.length - 1]
    return {
        ...expertTier,
        label: `${expertTier.label} +${normalizedPrestigeLevel - (difficultyTiers.length - 1)}`,
        rewardMultiplier: scale,
        prestigeReward: Math.round(4 * Math.pow(1.5, normalizedPrestigeLevel))
    }
}

export const getDifficultyIndex = (difficulty: GameDifficulty): number =>
    difficultyTiers.findIndex(tier => tier.difficulty === difficulty)

export const isDifficultyAtLeast = (difficulty: GameDifficulty, minimumDifficulty: GameDifficulty): boolean =>
    getDifficultyIndex(difficulty) >= getDifficultyIndex(minimumDifficulty)
