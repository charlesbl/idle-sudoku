import Upgrade from './Upgrade'
import styled from 'styled-components'
import { useSudoku } from './hooks/sudoku.context'
import { getUnlockedUpgradeCategory, upgradeCategoryLabels, upgradeCategoryOrder } from '../model/upgrades/upgrade'
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
    margin-bottom: 0.9rem;
    color: #f8fafc;
    font-size: 1.45rem;
    font-weight: bold;
    text-align: center;
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
        upgrades,
        solvers,
        getSolverSpeedLevel,
        hasUpgradeFeature,
        purchaseSolverSpeedUpgrade,
        puzzleTransitionLevel,
        purchasePuzzleTransitionUpgrade,
        autoQueueCooldownLevel,
        purchaseAutoQueueCooldownUpgrade
    } = useSudoku()
    const unlockedUpgradeCategory = getUnlockedUpgradeCategory(upgrades)
    const upgradeSections = upgradeCategoryOrder
        .map(category => ({
            category,
            upgrades: upgrades.filter(upgrade => upgrade.category === category)
        }))
        .filter(section => section.upgrades.length > 0)
    const speedUpgrades = solvers
        .map((solver) => {
            const currentLevel = getSolverSpeedLevel(solver)
            const nextLevel = currentLevel + 1
            const currentSpeed = getSolverSpeedLevelDetails(currentLevel)
            const nextSpeed = getSolverSpeedLevelDetails(nextLevel)

            return {
                solver,
                currentLevel,
                currentSpeed,
                nextSpeed,
                cost: getSolverSpeedUpgradeCost(currentLevel)
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
    const hasAvailableUpgrades = upgrades.length > 0 ||
        speedUpgrades.length > 0 ||
        hasPuzzleTransitionUpgrade ||
        hasAutoQueueCooldownUpgrade

    return (
        <UpgradesStyle>
            <Title>Upgrades</Title>

            {hasAvailableUpgrades
                ? (
                    <UpgradesContainer>
                        {speedUpgrades.length > 0 && (
                            <UpgradeSection>
                                <CategoryTitle>Solver speed</CategoryTitle>

                                <CategoryList>
                                    {speedUpgrades.map((speedUpgrade) => (
                                        <Upgrade
                                            cost={speedUpgrade.cost}
                                            description={`Level ${speedUpgrade.currentLevel + 1}/${maxSolverSpeedLevel + 1}. ${speedUpgrade.currentSpeed.label} (${getSolverSpeedDescription(speedUpgrade.currentSpeed)}) -> ${speedUpgrade.nextSpeed.label} (${getSolverSpeedDescription(speedUpgrade.nextSpeed)}).`}
                                            key={`${speedUpgrade.solver.id}-speed-${speedUpgrade.currentLevel + 1}`}
                                            locked={false}
                                            name={`${speedUpgrade.solver.name} speed`}
                                            onPurchase={() => { purchaseSolverSpeedUpgrade(speedUpgrade.solver) }}
                                        />
                                    ))}
                                </CategoryList>
                            </UpgradeSection>
                        )}

                        {hasPuzzleTransitionUpgrade && (
                            <UpgradeSection>
                                <CategoryTitle>Grid timing</CategoryTitle>

                                <CategoryList>
                                    <Upgrade
                                        cost={getPuzzleTransitionUpgradeCost(puzzleTransitionLevel)}
                                        description={`Level ${puzzleTransitionLevel + 1}/${maxPuzzleTransitionLevel + 1}. ${currentPuzzleTransition.label} (${formatPuzzleTransitionDelay(currentPuzzleTransition.delayMs)}) -> ${nextPuzzleTransition.label} (${formatPuzzleTransitionDelay(nextPuzzleTransition.delayMs)}).`}
                                        locked={false}
                                        name="New grid timing"
                                        onPurchase={purchasePuzzleTransitionUpgrade}
                                    />
                                </CategoryList>
                            </UpgradeSection>
                        )}

                        {hasAutoQueueCooldownUpgrade && (
                            <UpgradeSection>
                                <CategoryTitle>Auto queue cooldown</CategoryTitle>

                                <CategoryList>
                                    <Upgrade
                                        cost={getAutoQueueCooldownUpgradeCost(autoQueueCooldownLevel)}
                                        description={`Level ${autoQueueCooldownLevel + 1}/${maxAutoQueueCooldownLevel + 1}. ${currentAutoQueueCooldown.label} (${formatPuzzleTransitionDelay(currentAutoQueueCooldown.delayMs)}) -> ${nextAutoQueueCooldown.label} (${formatPuzzleTransitionDelay(nextAutoQueueCooldown.delayMs)}).`}
                                        locked={false}
                                        name="Auto queue restart"
                                        onPurchase={purchaseAutoQueueCooldownUpgrade}
                                    />
                                </CategoryList>
                            </UpgradeSection>
                        )}

                        {upgradeSections.map((section) => {
                            const locked = section.category !== unlockedUpgradeCategory

                            return (
                                <UpgradeSection key={section.category}>
                                    <CategoryTitle>{upgradeCategoryLabels[section.category]}</CategoryTitle>

                                    <CategoryList>
                                        {section.upgrades.map((upgrade) => {
                                            return (
                                                <Upgrade
                                                    key={upgrade.id}
                                                    locked={locked}
                                                    upgrade={upgrade}
                                                />
                                            )
                                        })}
                                    </CategoryList>
                                </UpgradeSection>
                            )
                        })}
                    </UpgradesContainer>
                )
                : <EmptyState>No upgrades available</EmptyState>}
        </UpgradesStyle>
    )
}

export default Upgrades
