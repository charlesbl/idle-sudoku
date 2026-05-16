import { useState } from 'react'
import Upgrade from './Upgrade'
import styled from 'styled-components'
import { useSudoku } from './hooks/sudoku.context'
import { type UpgradeKind, upgradeKindLabels } from '../model/upgrades/upgrade'
import {
    getCurrentUnlockUpgradeCategory,
    unlockUpgradeCategoryLabels,
    unlockUpgradeCategoryOrder
} from '../model/upgrades/unlockUpgrade'
import {
    speedUpgradeCategoryLabels,
    speedUpgradeCategoryOrder,
    type SpeedUpgradeModel
} from '../model/upgrades/speedUpgrade'
import {
    getSolverSpeedDescription,
    getSolverSpeedLevel as getSolverSpeedLevelDetails,
    getSolverSpeedUpgradeCost,
    maxSolverSpeedLevel
} from '../model/solvers/solverSpeed'
import {
    formatPuzzleTransitionDelay,
    getPuzzleTransitionLevel,
    getPuzzleTransitionUpgradeCost,
    maxPuzzleTransitionLevel
} from '../model/puzzleTransition'
import {
    getAutoQueueCooldownLevel,
    getAutoQueueCooldownUpgradeCost,
    maxAutoQueueCooldownLevel
} from '../model/autoQueueCooldown'

interface PurchasableSpeedUpgrade extends SpeedUpgradeModel {
    handlePurchase: () => void
}

const UpgradesStyle = styled.aside`
    display: flex;
    flex: 0 1 430px;
    align-self: center;
    flex-direction: column;
    min-width: 300px;
    max-height: calc(100vh - 4rem);
    padding: 1rem;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    text-align: left;
    background: var(--panel-bg);
    box-shadow: 0 18px 50px rgb(0 0 0 / 28%);

    @media (width <= 1100px) {
        order: 2;
        flex: 1 1 100%;
        align-self: auto;
        width: 100%;
        min-width: 0;
        max-height: none;
    }

    @media (width <= 620px) {
        flex-basis: auto;
        width: 100%;
        max-width: 310px;
    }
`

const Title = styled.div`
    margin-bottom: 0.7rem;
    color: #f8fafc;
    font-size: 1.45rem;
    font-weight: bold;
    text-align: center;
`

const TabList = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem;
    margin-bottom: 0.9rem;
    padding: 0.25rem;
    border: 1px solid rgb(255 255 255 / 9%);
    border-radius: 8px;
    background: rgb(0 0 0 / 15%);
`

const TabButton = styled.button<{ $active: boolean }>`
    min-width: 0;
    min-height: 2.2rem;
    border: 1px solid ${props => props.$active ? 'rgb(81 214 194 / 56%)' : 'transparent'};
    border-radius: 7px;
    color: ${props => props.$active ? 'var(--accent-strong)' : 'var(--text-muted)'};
    font: inherit;
    font-size: 0.82rem;
    font-weight: 900;
    background: ${props => props.$active ? 'rgb(81 214 194 / 13%)' : 'transparent'};
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background 160ms ease,
        color 160ms ease;

    &:focus-visible {
        outline: 2px solid var(--accent-strong);
        outline-offset: 2px;
    }

    &:disabled {
        color: rgb(154 165 182 / 38%);
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        border-color: rgb(81 214 194 / 42%);
        color: var(--accent-strong);
        background: rgb(81 214 194 / 9%);
    }
`

const UpgradesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding-right: 0.25rem;
`

const UpgradeSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
`

const CategoryTitle = styled.h3`
    margin: 0;
    padding: 0.2rem 0.15rem 0;
    color: #94a3b8;
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0;
`

const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
`

const EmptyState = styled.div`
    padding: 1rem;
    border: 1px dashed rgb(255 255 255 / 18%);
    border-radius: 8px;
    color: var(--text-muted);
    text-align: center;
    background: rgb(255 255 255 / 3.5%);
`

const Upgrades = (): JSX.Element => {
    const {
        unlockUpgrades,
        solvers,
        getSolverSpeedLevel,
        hasUpgradeFeature,
        purchaseSolverSpeedUpgrade,
        puzzleTransitionLevel,
        purchasePuzzleTransitionUpgrade,
        autoQueueCooldownLevel,
        purchaseAutoQueueCooldownUpgrade
    } = useSudoku()
    const [selectedUpgradeKind, setSelectedUpgradeKind] = useState<UpgradeKind>('unlock')
    const currentUnlockUpgradeCategory = getCurrentUnlockUpgradeCategory(unlockUpgrades)
    const unlockUpgradeSections = unlockUpgradeCategoryOrder
        .map(category => ({
            category,
            upgrades: unlockUpgrades.filter(upgrade => upgrade.category === category)
        }))
        .filter(section => section.upgrades.length > 0)
    const solverSpeedUpgrades: PurchasableSpeedUpgrade[] = solvers
        .map((solver) => {
            const currentLevel = getSolverSpeedLevel(solver)
            const nextLevel = currentLevel + 1
            const currentSpeed = getSolverSpeedLevelDetails(currentLevel)
            const nextSpeed = getSolverSpeedLevelDetails(nextLevel)

            return {
                kind: 'speed' as const,
                id: `${solver.id}-speed-${nextLevel}`,
                solver,
                name: `${solver.name} speed`,
                category: 'solverSpeed' as const,
                currentLevel,
                currentSpeed,
                nextSpeed,
                cost: getSolverSpeedUpgradeCost(currentLevel),
                description: `Level ${currentLevel + 1}/${maxSolverSpeedLevel + 1}. ${currentSpeed.label} (${getSolverSpeedDescription(currentSpeed)}) -> ${nextSpeed.label} (${getSolverSpeedDescription(nextSpeed)}).`,
                handlePurchase: () => { purchaseSolverSpeedUpgrade(solver) }
            }
        })
        .filter(speedUpgrade => speedUpgrade.currentLevel < maxSolverSpeedLevel)
    const currentPuzzleTransition = getPuzzleTransitionLevel(puzzleTransitionLevel)
    const nextPuzzleTransition = getPuzzleTransitionLevel(puzzleTransitionLevel + 1)
    const hasPuzzleTransitionUpgrade = puzzleTransitionLevel < maxPuzzleTransitionLevel
    const currentAutoQueueCooldown = getAutoQueueCooldownLevel(autoQueueCooldownLevel)
    const nextAutoQueueCooldown = getAutoQueueCooldownLevel(autoQueueCooldownLevel + 1)
    const hasAutoQueueCooldownUpgrade = hasUpgradeFeature('autoSolverQueue') &&
        autoQueueCooldownLevel < maxAutoQueueCooldownLevel
    const gridTimingSpeedUpgrade: PurchasableSpeedUpgrade | undefined = hasPuzzleTransitionUpgrade
        ? {
            kind: 'speed',
            id: `puzzle-transition-${puzzleTransitionLevel + 1}`,
            name: 'New grid timing',
            category: 'gridTiming',
            cost: getPuzzleTransitionUpgradeCost(puzzleTransitionLevel),
            description: `Level ${puzzleTransitionLevel + 1}/${maxPuzzleTransitionLevel + 1}. ${currentPuzzleTransition.label} (${formatPuzzleTransitionDelay(currentPuzzleTransition.delayMs)}) -> ${nextPuzzleTransition.label} (${formatPuzzleTransitionDelay(nextPuzzleTransition.delayMs)}).`,
            handlePurchase: purchasePuzzleTransitionUpgrade
        }
        : undefined
    const autoQueueCooldownSpeedUpgrade: PurchasableSpeedUpgrade | undefined = hasAutoQueueCooldownUpgrade
        ? {
            kind: 'speed',
            id: `auto-queue-cooldown-${autoQueueCooldownLevel + 1}`,
            name: 'Auto queue restart',
            category: 'autoQueueCooldown',
            cost: getAutoQueueCooldownUpgradeCost(autoQueueCooldownLevel),
            description: `Level ${autoQueueCooldownLevel + 1}/${maxAutoQueueCooldownLevel + 1}. ${currentAutoQueueCooldown.label} (${formatPuzzleTransitionDelay(currentAutoQueueCooldown.delayMs)}) -> ${nextAutoQueueCooldown.label} (${formatPuzzleTransitionDelay(nextAutoQueueCooldown.delayMs)}).`,
            handlePurchase: purchaseAutoQueueCooldownUpgrade
        }
        : undefined
    const speedUpgrades = [
        ...solverSpeedUpgrades,
        ...(gridTimingSpeedUpgrade !== undefined ? [gridTimingSpeedUpgrade] : []),
        ...(autoQueueCooldownSpeedUpgrade !== undefined ? [autoQueueCooldownSpeedUpgrade] : [])
    ]
    const speedUpgradeSections = speedUpgradeCategoryOrder
        .map(category => ({
            category,
            upgrades: speedUpgrades.filter(upgrade => upgrade.category === category)
        }))
        .filter(section => section.upgrades.length > 0)
    const hasUnlockUpgrades = unlockUpgrades.length > 0
    const hasSpeedUpgrades = speedUpgrades.length > 0
    const hasAvailableUpgrades = hasUnlockUpgrades || hasSpeedUpgrades
    const activeUpgradeKind = selectedUpgradeKind === 'unlock' && !hasUnlockUpgrades && hasSpeedUpgrades
        ? 'speed'
        : selectedUpgradeKind === 'speed' && !hasSpeedUpgrades && hasUnlockUpgrades
            ? 'unlock'
            : selectedUpgradeKind

    return (
        <UpgradesStyle>
            <Title>Upgrades</Title>

            {hasAvailableUpgrades
                ? (
                    <>
                        <TabList
                            aria-label="Upgrade type"
                            role="tablist"
                        >
                            <TabButton
                                $active={activeUpgradeKind === 'unlock'}
                                aria-selected={activeUpgradeKind === 'unlock'}
                                disabled={!hasUnlockUpgrades}
                                onClick={() => { setSelectedUpgradeKind('unlock') }}
                                role="tab"
                                type="button"
                            >
                                {upgradeKindLabels.unlock}
                            </TabButton>

                            <TabButton
                                $active={activeUpgradeKind === 'speed'}
                                aria-selected={activeUpgradeKind === 'speed'}
                                disabled={!hasSpeedUpgrades}
                                onClick={() => { setSelectedUpgradeKind('speed') }}
                                role="tab"
                                type="button"
                            >
                                {upgradeKindLabels.speed}
                            </TabButton>
                        </TabList>

                        <UpgradesContainer>
                            {activeUpgradeKind === 'unlock' && unlockUpgradeSections.map((section) => {
                                const locked = section.category !== currentUnlockUpgradeCategory

                                return (
                                    <UpgradeSection key={section.category}>
                                        <CategoryTitle>{unlockUpgradeCategoryLabels[section.category]}</CategoryTitle>

                                        <CategoryList>
                                            {section.upgrades.map((upgrade) => {
                                                return (
                                                    <Upgrade
                                                        key={upgrade.id}
                                                        locked={locked}
                                                        unlockUpgrade={upgrade}
                                                    />
                                                )
                                            })}
                                        </CategoryList>
                                    </UpgradeSection>
                                )
                            })}

                            {activeUpgradeKind === 'speed' && speedUpgradeSections.map((section) => (
                                <UpgradeSection key={section.category}>
                                    <CategoryTitle>{speedUpgradeCategoryLabels[section.category]}</CategoryTitle>

                                    <CategoryList>
                                        {section.upgrades.map((speedUpgrade) => (
                                            <Upgrade
                                                cost={speedUpgrade.cost}
                                                description={speedUpgrade.description}
                                                key={speedUpgrade.id}
                                                locked={false}
                                                name={speedUpgrade.name}
                                                onPurchase={speedUpgrade.handlePurchase}
                                            />
                                        ))}
                                    </CategoryList>
                                </UpgradeSection>
                            ))}
                        </UpgradesContainer>
                    </>
                )
                : <EmptyState>No upgrades available</EmptyState>}
        </UpgradesStyle>
    )
}

export default Upgrades
