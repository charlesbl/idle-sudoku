import Upgrade from './Upgrade'
import styled from 'styled-components'
import { useSudoku } from './hooks/sudoku.context'
import { type UpgradeCategory } from '../model/upgrades/upgrade'

const upgradeCategoryOrder: UpgradeCategory[] = [
    'helpers',
    'Last drafts',
    'Remove drafts strategy',
    'set drafts strategy',
    'Last draft strategy'
]

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
    const { upgrades } = useSudoku()
    const upgradeSections = upgradeCategoryOrder
        .map(category => ({
            category,
            upgrades: upgrades.filter(upgrade => upgrade.category === category)
        }))
        .filter(section => section.upgrades.length > 0)

    return (
        <UpgradesStyle>
            <Title>Upgrades</Title>

            {upgrades.length > 0
                ? (
                    <UpgradesContainer>
                        {upgradeSections.map((section) => {
                            return (
                                <UpgradeSection key={section.category}>
                                    <CategoryTitle>{section.category}</CategoryTitle>

                                    <CategoryList>
                                        {section.upgrades.map((upgrade) => {
                                            return (
                                                <Upgrade
                                                    key={upgrade.id}
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
