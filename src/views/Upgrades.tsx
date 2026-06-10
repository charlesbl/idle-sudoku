import { useState } from 'react'
import Upgrade from './Upgrade'
import styled from 'styled-components'
import { useSudoku } from './hooks/sudoku.context'
import { areSolverPrerequisitesUnlocked } from '../model/solvers/sudokuSolver'
import { Tooltip, TooltipAnchor } from './Tooltip'
import { type UpgradeKind, upgradeKindLabels } from '../model/upgrades/upgrade'
import {
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
import { solutionAssistSolver } from '../model/solvers/solutionAssist'
import {
    getSolutionAssistChanceLevel,
    getSolutionAssistChanceUpgradeCost,
    maxSolutionAssistChanceLevel
} from '../model/solvers/solutionAssistChance'

interface PurchasableSpeedUpgrade extends SpeedUpgradeModel {
    handlePurchase: (buyMax?: boolean) => void
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

const TabTooltipAnchor = styled(TooltipAnchor)`
    display: flex;
    width: 100%;

    button {
        width: 100%;
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
        permanentUpgrades,
        solvers,
        permanentSolvers,
        getSolverSpeedLevel,
        hasUpgradeFeature,
        purchaseSolverSpeedUpgrade,
        puzzleTransitionLevel,
        purchasePuzzleTransitionUpgrade,
        autoQueueCooldownLevel,
        purchaseAutoQueueCooldownUpgrade,
        solutionAssistChanceLevel,
        purchaseSolutionAssistChanceUpgrade,
        prestigePoints,
        purchasePermanentUpgrade,
        isShiftPressed,
        money,
        permanentSolverSpeedLevel,
        permanentGridTimingLevel,
        permanentAutoQueueCooldownLevel,
        permanentSolutionAssistChanceLevel,
        purchasePermanentSolverSpeedLevel,
        purchasePermanentGridTimingLevel,
        purchasePermanentAutoQueueCooldownLevel,
        purchasePermanentSolutionAssistChanceLevel,
        autoPrestigeUnlocked,
        purchasePermanentAutoPrestige
    } = useSudoku()

    const hasAnyPermanentSpeedUpgrade = permanentSolverSpeedLevel < maxSolverSpeedLevel ||
        permanentGridTimingLevel < maxPuzzleTransitionLevel ||
        permanentAutoQueueCooldownLevel < maxAutoQueueCooldownLevel ||
        permanentSolutionAssistChanceLevel < maxSolutionAssistChanceLevel ||
        !autoPrestigeUnlocked
    const [selectedUpgradeKind, setSelectedUpgradeKind] = useState<UpgradeKind>('unlock')
    const unlockUpgradeSections = unlockUpgradeCategoryOrder
        .map(category => ({
            category,
            upgrades: unlockUpgrades.filter(upgrade => upgrade.category === category)
        }))
        .filter(section => section.upgrades.length > 0)
    const permanentUpgradeSections = unlockUpgradeCategoryOrder
        .map(category => ({
            category,
            upgrades: permanentUpgrades.filter(upgrade => upgrade.category === category)
        }))
        .filter(section => section.upgrades.length > 0)
    const solverSpeedUpgrades: PurchasableSpeedUpgrade[] = solvers
        .map((solver) => {
            const currentLevel = getSolverSpeedLevel(solver)
            const currentSpeed = getSolverSpeedLevelDetails(currentLevel)

            let buyMaxCost = 0
            let buyMaxLevelCount = 0
            let tempLevel = currentLevel
            while (tempLevel < maxSolverSpeedLevel) {
                const cost = getSolverSpeedUpgradeCost(tempLevel)
                if (buyMaxCost + cost <= money) {
                    buyMaxCost += cost
                    buyMaxLevelCount++
                    tempLevel++
                } else {
                    break
                }
            }

            const isBuyMaxActive = isShiftPressed && buyMaxLevelCount > 0
            const displayedCost = isBuyMaxActive ? buyMaxCost : getSolverSpeedUpgradeCost(currentLevel)

            const nextLevel = currentLevel + (isBuyMaxActive ? buyMaxLevelCount : 1)
            const nextSpeed = getSolverSpeedLevelDetails(nextLevel)

            const description = isBuyMaxActive
                ? `Buy ${buyMaxLevelCount} levels. Level ${currentLevel + 1} -> ${nextLevel}/${maxSolverSpeedLevel + 1}. Speed: ${currentSpeed.label} -> ${nextSpeed.label}.`
                : `Level ${currentLevel + 1}/${maxSolverSpeedLevel + 1}. ${currentSpeed.label} (${getSolverSpeedDescription(currentSpeed)}) -> ${nextSpeed.label} (${getSolverSpeedDescription(nextSpeed)}).`

            return {
                kind: 'speed' as const,
                id: `${solver.id}-speed-${nextLevel}`,
                solver,
                name: `${solver.name} speed`,
                category: 'solverSpeed' as const,
                currentLevel,
                currentSpeed,
                nextSpeed,
                cost: displayedCost,
                description,
                handlePurchase: (buyMax?: boolean) => { purchaseSolverSpeedUpgrade(solver, buyMax) }
            }
        })
        .filter(speedUpgrade => speedUpgrade.currentLevel < maxSolverSpeedLevel)
    const currentPuzzleTransition = getPuzzleTransitionLevel(puzzleTransitionLevel)
    const hasPuzzleTransitionUpgrade = puzzleTransitionLevel < maxPuzzleTransitionLevel

    let puzzleTransitionBuyMaxCost = 0
    let puzzleTransitionBuyMaxLevelCount = 0
    let tempPTLevel = puzzleTransitionLevel
    while (tempPTLevel < maxPuzzleTransitionLevel) {
        const cost = getPuzzleTransitionUpgradeCost(tempPTLevel)
        if (puzzleTransitionBuyMaxCost + cost <= money) {
            puzzleTransitionBuyMaxCost += cost
            puzzleTransitionBuyMaxLevelCount++
            tempPTLevel++
        } else {
            break
        }
    }
    const isPTBuyMaxActive = isShiftPressed && puzzleTransitionBuyMaxLevelCount > 0
    const displayedPTCost = isPTBuyMaxActive ? puzzleTransitionBuyMaxCost : getPuzzleTransitionUpgradeCost(puzzleTransitionLevel)
    const ptNextLevel = puzzleTransitionLevel + (isPTBuyMaxActive ? puzzleTransitionBuyMaxLevelCount : 1)
    const nextPuzzleTransition = getPuzzleTransitionLevel(ptNextLevel)
    const ptDescription = isPTBuyMaxActive
        ? `Buy ${puzzleTransitionBuyMaxLevelCount} levels. Level ${puzzleTransitionLevel + 1} -> ${ptNextLevel}/${maxPuzzleTransitionLevel + 1}. Delay: ${formatPuzzleTransitionDelay(currentPuzzleTransition.delayMs)} -> ${formatPuzzleTransitionDelay(nextPuzzleTransition.delayMs)}.`
        : `Level ${puzzleTransitionLevel + 1}/${maxPuzzleTransitionLevel + 1}. ${currentPuzzleTransition.label} (${formatPuzzleTransitionDelay(currentPuzzleTransition.delayMs)}) -> ${nextPuzzleTransition.label} (${formatPuzzleTransitionDelay(nextPuzzleTransition.delayMs)}).`

    const currentAutoQueueCooldown = getAutoQueueCooldownLevel(autoQueueCooldownLevel)
    const hasAutoQueueCooldownUpgrade = hasUpgradeFeature('autoSolverQueue') &&
        autoQueueCooldownLevel < maxAutoQueueCooldownLevel

    let autoQueueBuyMaxCost = 0
    let autoQueueBuyMaxLevelCount = 0
    let tempAQLevel = autoQueueCooldownLevel
    while (tempAQLevel < maxAutoQueueCooldownLevel) {
        const cost = getAutoQueueCooldownUpgradeCost(tempAQLevel)
        if (autoQueueBuyMaxCost + cost <= money) {
            autoQueueBuyMaxCost += cost
            autoQueueBuyMaxLevelCount++
            tempAQLevel++
        } else {
            break
        }
    }
    const isAQBuyMaxActive = isShiftPressed && autoQueueBuyMaxLevelCount > 0
    const displayedAQCost = isAQBuyMaxActive ? autoQueueBuyMaxCost : getAutoQueueCooldownUpgradeCost(autoQueueCooldownLevel)
    const aqNextLevel = autoQueueCooldownLevel + (isAQBuyMaxActive ? autoQueueBuyMaxLevelCount : 1)
    const nextAutoQueueCooldown = getAutoQueueCooldownLevel(aqNextLevel)
    const aqDescription = isAQBuyMaxActive
        ? `Buy ${autoQueueBuyMaxLevelCount} levels. Level ${autoQueueCooldownLevel + 1} -> ${aqNextLevel}/${maxAutoQueueCooldownLevel + 1}. Cooldown: ${formatPuzzleTransitionDelay(currentAutoQueueCooldown.delayMs)} -> ${formatPuzzleTransitionDelay(nextAutoQueueCooldown.delayMs)}.`
        : `Level ${autoQueueCooldownLevel + 1}/${maxAutoQueueCooldownLevel + 1}. ${currentAutoQueueCooldown.label} (${formatPuzzleTransitionDelay(currentAutoQueueCooldown.delayMs)}) -> ${nextAutoQueueCooldown.label} (${formatPuzzleTransitionDelay(nextAutoQueueCooldown.delayMs)}).`

    const currentSolutionAssistChance = getSolutionAssistChanceLevel(solutionAssistChanceLevel)
    const hasSolutionAssistUpgrade = solvers.some(solver => solver.id === solutionAssistSolver.id) &&
        solutionAssistChanceLevel < maxSolutionAssistChanceLevel

    let solutionAssistBuyMaxCost = 0
    let solutionAssistBuyMaxLevelCount = 0
    let tempSALevel = solutionAssistChanceLevel
    while (tempSALevel < maxSolutionAssistChanceLevel) {
        const cost = getSolutionAssistChanceUpgradeCost(tempSALevel)
        if (solutionAssistBuyMaxCost + cost <= money) {
            solutionAssistBuyMaxCost += cost
            solutionAssistBuyMaxLevelCount++
            tempSALevel++
        } else {
            break
        }
    }
    const isSABuyMaxActive = isShiftPressed && solutionAssistBuyMaxLevelCount > 0
    const displayedSACost = isSABuyMaxActive ? solutionAssistBuyMaxCost : getSolutionAssistChanceUpgradeCost(solutionAssistChanceLevel)
    const saNextLevel = solutionAssistChanceLevel + (isSABuyMaxActive ? solutionAssistBuyMaxLevelCount : 1)
    const nextSolutionAssistChance = getSolutionAssistChanceLevel(saNextLevel)
    const saDescription = isSABuyMaxActive
        ? `Buy ${solutionAssistBuyMaxLevelCount} levels. Level ${solutionAssistChanceLevel + 1} -> ${saNextLevel}/${maxSolutionAssistChanceLevel + 1}. Chance: ${currentSolutionAssistChance.chancePercent}% -> ${nextSolutionAssistChance.chancePercent}%.`
        : `Level ${solutionAssistChanceLevel + 1}/${maxSolutionAssistChanceLevel + 1}. ${currentSolutionAssistChance.label} (${currentSolutionAssistChance.chancePercent}%) -> ${nextSolutionAssistChance.label} (${nextSolutionAssistChance.chancePercent}%).`

    const gridTimingSpeedUpgrade: PurchasableSpeedUpgrade | undefined = hasPuzzleTransitionUpgrade
        ? {
            kind: 'speed',
            id: `puzzle-transition-${puzzleTransitionLevel + 1}`,
            name: 'New grid timing',
            category: 'gridTiming',
            cost: displayedPTCost,
            description: ptDescription,
            handlePurchase: purchasePuzzleTransitionUpgrade
        }
        : undefined
    const autoQueueCooldownSpeedUpgrade: PurchasableSpeedUpgrade | undefined = hasAutoQueueCooldownUpgrade
        ? {
            kind: 'speed',
            id: `auto-queue-cooldown-${autoQueueCooldownLevel + 1}`,
            name: 'Auto queue restart',
            category: 'autoQueueCooldown',
            cost: displayedAQCost,
            description: aqDescription,
            handlePurchase: purchaseAutoQueueCooldownUpgrade
        }
        : undefined
    const solutionAssistSpeedUpgrade: PurchasableSpeedUpgrade | undefined = hasSolutionAssistUpgrade
        ? {
            kind: 'speed',
            id: `solution-assist-chance-${solutionAssistChanceLevel + 1}`,
            name: 'Lucky solution chance',
            category: 'solutionAssist',
            cost: displayedSACost,
            description: saDescription,
            handlePurchase: purchaseSolutionAssistChanceUpgrade
        }
        : undefined
    const speedUpgrades = [
        ...solverSpeedUpgrades,
        ...(gridTimingSpeedUpgrade !== undefined ? [gridTimingSpeedUpgrade] : []),
        ...(autoQueueCooldownSpeedUpgrade !== undefined ? [autoQueueCooldownSpeedUpgrade] : []),
        ...(solutionAssistSpeedUpgrade !== undefined ? [solutionAssistSpeedUpgrade] : [])
    ]
    const speedUpgradeSections = speedUpgradeCategoryOrder
        .map(category => ({
            category,
            upgrades: speedUpgrades.filter(upgrade => upgrade.category === category)
        }))
        .filter(section => section.upgrades.length > 0)
    const hasUnlockUpgrades = unlockUpgrades.length > 0
    const hasSpeedUpgrades = speedUpgrades.length > 0
    const hasPermanentUpgrades = permanentUpgrades.length > 0 || hasAnyPermanentSpeedUpgrade
    const hasAvailableUpgrades = hasUnlockUpgrades || hasSpeedUpgrades || hasPermanentUpgrades
    const availableUpgradeKinds: UpgradeKind[] = [
        ...(hasUnlockUpgrades ? ['unlock' as const] : []),
        ...(hasSpeedUpgrades ? ['speed' as const] : []),
        ...(hasPermanentUpgrades ? ['permanent' as const] : [])
    ]
    const activeUpgradeKind = availableUpgradeKinds.includes(selectedUpgradeKind)
        ? selectedUpgradeKind
        : availableUpgradeKinds[0] ?? selectedUpgradeKind

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
                            <TabTooltipAnchor>
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
                                <Tooltip data-align="left" role="tooltip">
                                    Show upgrades to unlock new solvers and mechanics
                                </Tooltip>
                            </TabTooltipAnchor>

                            <TabTooltipAnchor>
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
                                <Tooltip role="tooltip">
                                    Show upgrades to increase solver speed and grid transition speed
                                </Tooltip>
                            </TabTooltipAnchor>

                            <TabTooltipAnchor>
                                <TabButton
                                    $active={activeUpgradeKind === 'permanent'}
                                    aria-selected={activeUpgradeKind === 'permanent'}
                                    disabled={!hasPermanentUpgrades}
                                    onClick={() => { setSelectedUpgradeKind('permanent') }}
                                    role="tab"
                                    type="button"
                                >
                                    {upgradeKindLabels.permanent}
                                </TabButton>
                                <Tooltip data-align="right" role="tooltip">
                                    Show permanent PP upgrades
                                </Tooltip>
                            </TabTooltipAnchor>
                        </TabList>

                        <UpgradesContainer>
                            {activeUpgradeKind === 'unlock' && unlockUpgradeSections.map((section) => {
                                return (
                                    <UpgradeSection key={section.category}>
                                        <CategoryTitle>{unlockUpgradeCategoryLabels[section.category]}</CategoryTitle>

                                        <CategoryList>
                                            {section.upgrades.map((upgrade) => {
                                                const locked = upgrade.solver !== undefined && !areSolverPrerequisitesUnlocked(solvers, upgrade.solver)
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

                            {activeUpgradeKind === 'permanent' && (
                                <>
                                    {hasAnyPermanentSpeedUpgrade && (
                                        <UpgradeSection key="permanent-speeds">
                                            <CategoryTitle>Permanent speed upgrades</CategoryTitle>

                                            <CategoryList>
                                                {permanentSolverSpeedLevel < maxSolverSpeedLevel && (
                                                    <Upgrade
                                                        availableAmount={prestigePoints}
                                                        cost={2 * (permanentSolverSpeedLevel + 1)}
                                                        currencyLabel="PP"
                                                        description={`Permanent. All solvers start with +${permanentSolverSpeedLevel} levels of speed. Next level: +${permanentSolverSpeedLevel + 1}/${maxSolverSpeedLevel}.`}
                                                        key="perm-solver-speed"
                                                        locked={false}
                                                        name="Permanent Solver Speed"
                                                        onPurchase={purchasePermanentSolverSpeedLevel}
                                                    />
                                                )}
                                                {permanentGridTimingLevel < maxPuzzleTransitionLevel && (
                                                    <Upgrade
                                                        availableAmount={prestigePoints}
                                                        cost={permanentGridTimingLevel + 1}
                                                        currencyLabel="PP"
                                                        description={`Permanent. Grids transition +${permanentGridTimingLevel} levels faster. Next level: +${permanentGridTimingLevel + 1}/${maxPuzzleTransitionLevel}.`}
                                                        key="perm-grid-timing"
                                                        locked={false}
                                                        name="Permanent Grid Timing"
                                                        onPurchase={purchasePermanentGridTimingLevel}
                                                    />
                                                )}
                                                {permanentAutoQueueCooldownLevel < maxAutoQueueCooldownLevel && (
                                                    <Upgrade
                                                        availableAmount={prestigePoints}
                                                        cost={permanentAutoQueueCooldownLevel + 1}
                                                        currencyLabel="PP"
                                                        description={`Permanent. Auto-queue starts +${permanentAutoQueueCooldownLevel} levels faster. Next level: +${permanentAutoQueueCooldownLevel + 1}/${maxAutoQueueCooldownLevel}.`}
                                                        key="perm-auto-queue"
                                                        locked={false}
                                                        name="Permanent Auto Queue Cooldown"
                                                        onPurchase={purchasePermanentAutoQueueCooldownLevel}
                                                    />
                                                )}
                                                {permanentSolutionAssistChanceLevel < maxSolutionAssistChanceLevel && (
                                                    <Upgrade
                                                        availableAmount={prestigePoints}
                                                        cost={permanentSolutionAssistChanceLevel + 1}
                                                        currencyLabel="PP"
                                                        description={`Permanent. Lucky solutions start with +${permanentSolutionAssistChanceLevel} levels of chance. Next level: +${permanentSolutionAssistChanceLevel + 1}/${maxSolutionAssistChanceLevel}.`}
                                                        key="perm-solution-assist"
                                                        locked={false}
                                                        name="Permanent Lucky Solution Chance"
                                                        onPurchase={purchasePermanentSolutionAssistChanceLevel}
                                                    />
                                                )}
                                                {!autoPrestigeUnlocked && (
                                                    <Upgrade
                                                        availableAmount={prestigePoints}
                                                        cost={6}
                                                        currencyLabel="PP"
                                                        description="Permanent. Automatically prestige when the prestige goal is reached."
                                                        key="perm-auto-prestige"
                                                        locked={false}
                                                        name="Auto-prestige"
                                                        onPurchase={purchasePermanentAutoPrestige}
                                                    />
                                                )}
                                            </CategoryList>
                                        </UpgradeSection>
                                    )}

                                    {permanentUpgradeSections.map((section) => {
                                        return (
                                            <UpgradeSection key={section.category}>
                                                <CategoryTitle>{unlockUpgradeCategoryLabels[section.category]}</CategoryTitle>

                                                <CategoryList>
                                                    {section.upgrades.map((upgrade) => {
                                                        const locked = upgrade.solver !== undefined && !areSolverPrerequisitesUnlocked(permanentSolvers, upgrade.solver)
                                                        return (
                                                            <Upgrade
                                                                availableAmount={prestigePoints}
                                                                cost={upgrade.permanentCost}
                                                                currencyLabel="PP"
                                                                description={`Permanent. ${upgrade.description}`}
                                                                key={upgrade.id}
                                                                locked={locked}
                                                                name={upgrade.name}
                                                                onPurchase={() => { purchasePermanentUpgrade(upgrade) }}
                                                            />
                                                        )
                                                    })}
                                                </CategoryList>
                                            </UpgradeSection>
                                        )
                                    })}
                                </>
                            )}
                        </UpgradesContainer>
                    </>
                )
                : <EmptyState>No upgrades available</EmptyState>}
        </UpgradesStyle>
    )
}

export default Upgrades
