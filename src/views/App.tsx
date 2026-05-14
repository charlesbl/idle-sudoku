import styled from 'styled-components'
import SudokuGrid from './SudokuGrid'
import Upgrades from './Upgrades'
import { useSudoku } from './hooks/sudoku.context'
import { cloneSudoku } from '../model/sudoku.model'

// TODO add in right panel a button for each strategy to activate it and pass only once, queue strategies if the first one is not finished.
// TODO add selector for difficulty. more difficult = more money.
// TODO prevent buying strategy that has been removed by an upgrade.

const AppStyle = styled.div`
    --panel-bg: rgb(14 18 24 / 84%);
    --panel-border: rgb(255 255 255 / 12%);
    --text-muted: #9aa5b6;
    --text-strong: #f8fafc;
    --accent: #51d6c2;
    --accent-strong: #7cf7dc;
    --gold: #f4c95d;

    display: flex;
    align-items: stretch;
    flex-direction: row;
    justify-content: center;
    gap: clamp(1rem, 2vw, 2rem);
    box-sizing: border-box;
    width: 100%;
    min-height: 100vh;
    padding: clamp(1rem, 2vw, 2rem);
    color: var(--text-strong);
    font-family: Inter, "Segoe UI", Roboto, sans-serif;
    background:
        linear-gradient(135deg, rgb(12 17 24 / 92%), rgb(7 10 14 / 98%)),
        repeating-linear-gradient(
            90deg,
            rgb(255 255 255 / 3.5%) 0,
            rgb(255 255 255 / 3.5%) 1px,
            transparent 1px,
            transparent 48px
        ),
        repeating-linear-gradient(
            0deg,
            rgb(255 255 255 / 2.8%) 0,
            rgb(255 255 255 / 2.8%) 1px,
            transparent 1px,
            transparent 48px
        );

    @media (width <= 1100px) {
        flex-wrap: wrap;
        align-content: flex-start;
        overflow: hidden auto;
    }
`

const SudokuLayout = styled.main`
    display: flex;
    flex: 0 1 min(72vmin, 680px);
    align-items: center;
    flex-direction: column;
    justify-content: center;
    width: min(100%, 620px);
    min-width: min(100%, 440px);
    text-align: center;

    @media (width <= 1100px) {
        order: 1;
        flex: 1 1 100%;
        min-width: 0;
    }
`

const Infos = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    width: min(100%, 620px);
    margin-bottom: 1rem;

    @media (width <= 620px) {
        grid-template-columns: 1fr;
        width: 100%;
        max-width: 310px;
    }
`

const InfoCard = styled.div`
    min-width: 0;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: rgb(255 255 255 / 5.5%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
`

const InfoLabel = styled.div`
    margin-bottom: 0.25rem;
    color: var(--text-muted);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
`

const InfoValue = styled.div<{ $accent?: boolean }>`
    overflow: hidden;
    color: ${props => props.$accent === true ? 'var(--accent-strong)' : 'var(--text-strong)'};
    font-size: 1.35rem;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (width <= 620px) {
        font-size: 1.1rem;
    }
`

const DraftStatus = styled.span<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: ${props => props.$active ? 'var(--accent-strong)' : 'var(--text-muted)'};

    &::before {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 999px;
        background: ${props => props.$active ? 'var(--accent)' : 'rgb(255 255 255 / 0.28)'};
        box-shadow: ${props => props.$active ? '0 0 16px rgb(81 214 194 / 0.7)' : 'none'};
        content: "";
    }
`

const BoardShell = styled.div`
    box-sizing: border-box;
    width: min(100%, 620px);
    padding: clamp(0.55rem, 1vw, 0.85rem);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 8%), rgb(255 255 255 / 2.5%)),
        var(--panel-bg);
    box-shadow:
        0 24px 70px rgb(0 0 0 / 38%),
        inset 0 1px 0 rgb(255 255 255 / 8%);

    @media (width <= 620px) {
        width: 100%;
        max-width: 310px;
        padding: 0.45rem;
    }
`

const LoadingState = styled.div`
    display: grid;
    aspect-ratio: 1;
    place-items: center;
    color: var(--text-muted);
    font-size: 2.5rem;
    font-weight: 800;

    @media (width <= 620px) {
        font-size: 1.4rem;
    }
`

const ActionBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
    width: min(100%, 620px);
    margin-top: 1rem;

    @media (width <= 620px) {
        width: 100%;
        max-width: 310px;
    }
`

const ActionButton = styled.button`
    min-height: 2.5rem;
    padding: 0 1rem;
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 8px;
    color: var(--text-strong);
    font: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    background: linear-gradient(180deg, rgb(255 255 255 / 14%), rgb(255 255 255 / 5.5%));
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background 160ms ease,
        transform 160ms ease;

    &:hover:not(:disabled) {
        border-color: rgb(81 214 194 / 80%);
        background: linear-gradient(180deg, rgb(81 214 194 / 25%), rgb(81 214 194 / 12%));
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`

const StrategyPanel = styled.aside`
    display: flex;
    flex: 0 1 260px;
    align-self: center;
    flex-direction: column;
    min-width: 220px;
    max-height: 70vh;
    padding: 1rem;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: var(--panel-bg);
    box-shadow: 0 18px 50px rgb(0 0 0 / 28%);

    @media (width <= 1100px) {
        order: 3;
        flex: 1 1 100%;
        align-self: auto;
        width: 100%;
        min-width: 0;
        max-height: none;
    }

    @media (width <= 620px) {
        max-width: 310px;
    }
`

const StrategyTitle = styled.div`
    margin-bottom: 0.9rem;
    color: var(--text-muted);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
`

const StrategyList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
`

const StrategyRow = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
        width: 0.35rem;
        height: 1.8rem;
        border-radius: 999px;
        background: ${props => props.$active ? 'var(--gold)' : 'rgb(255 255 255 / 0.12)'};
        content: "";
    }
`

const StrategyButton = styled.button`
    flex: 1;
    min-height: 2.3rem;
    padding: 0 0.75rem;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 8px;
    color: var(--text-strong);
    font: inherit;
    font-size: 0.9rem;
    font-weight: 750;
    text-align: left;
    background: rgb(255 255 255 / 5.5%);
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background 160ms ease;

    &:disabled {
        color: var(--text-muted);
        cursor: not-allowed;
        opacity: 0.72;
    }

    &:hover:not(:disabled) {
        border-color: rgb(244 201 93 / 65%);
        background: rgb(244 201 93 / 12%);
    }
`

const EmptyState = styled.div`
    color: var(--text-muted);
    font-size: 0.92rem;
`

const App = (): JSX.Element => {
    const {
        sudoku,
        setSudoku,
        draftMode,
        setDraftMode,
        selectedTile,
        setSelectedTile,
        strategies,
        currentStrategy,
        cheatSolve,
        reset,
        money,
        draftHelpers,
        setCurrentStrategy
    } = useSudoku()

    const handleChangeDraftMode = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== ' ' && e.key !== '0') return
        setDraftMode(!draftMode)
    }

    const handleSelectedTileDisplacement = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (selectedTile === undefined) return
        if (!e.key.includes('Arrow')) return
        let newX = selectedTile % 9 + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0)
        let newY = Math.floor(selectedTile / 9) + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0)
        if (newX < 0) newX = 8
        if (newX > 8) newX = 0
        if (newY < 0) newY = 8
        if (newY > 8) newY = 0
        setSelectedTile(newX + newY * 9)
    }

    const handleChangeTileValue = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        const parsedKey = parseInt(e.key)
        if (isNaN(parsedKey) || parsedKey <= 0 || parsedKey > 9) return
        if (draftMode) {
            changeTileDraftMode(parsedKey)
        } else {
            changeTileNormalMode(parsedKey)
        }
    }

    const changeTileDraftMode = (value: number): void => {
        if (sudoku === undefined || selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = cloneSudoku(sudoku)
        newSudoku[selectedTile].draftNumbers[value - 1] = !newSudoku[selectedTile].draftNumbers[value - 1]
        newSudoku[selectedTile].value = undefined
        setSudoku(newSudoku)
    }

    const changeTileNormalMode = (value: number): void => {
        if (sudoku === undefined || selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = cloneSudoku(sudoku)
        if (newSudoku[selectedTile].value === value) {
            newSudoku[selectedTile].value = undefined
            setSudoku(newSudoku)
            return
        }

        newSudoku[selectedTile].value = value
        newSudoku[selectedTile].error = false

        draftHelpers.forEach((helper) => {
            helper.help(newSudoku, selectedTile)
        })

        setSudoku(newSudoku)
    }

    const handleBatchDraftChange = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (selectedTile === undefined || sudoku === undefined) return
        if (e.key === 'r') {
            const newSudoku = cloneSudoku(sudoku)
            const wipe = newSudoku[selectedTile].draftNumbers.every((draft) => draft)
            newSudoku[selectedTile].draftNumbers = Array(9).fill(!wipe)
            setSudoku(newSudoku)
        }
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        handleChangeDraftMode(e)
        handleSelectedTileDisplacement(e)
        handleChangeTileValue(e)
        handleBatchDraftChange(e)
    }

    return (
        <AppStyle
            onClick={() => { setSelectedTile(undefined) }}
            onKeyDown={handleOnKeyDown}
            tabIndex={0}
        >
            <Upgrades />

            <SudokuLayout>
                <Infos>
                    <InfoCard>
                        <InfoLabel>Credits</InfoLabel>

                        <InfoValue $accent>
                            {money}

                            &euro;
                        </InfoValue>
                    </InfoCard>

                    <InfoCard>
                        <InfoLabel>Strategy</InfoLabel>

                        <InfoValue>
                            {currentStrategy?.name ?? 'No Strategy'}
                        </InfoValue>
                    </InfoCard>

                    <InfoCard>
                        <InfoLabel>Draft mode</InfoLabel>

                        <InfoValue>
                            <DraftStatus $active={draftMode}>
                                {draftMode ? 'on' : 'off'}
                            </DraftStatus>
                        </InfoValue>
                    </InfoCard>
                </Infos>

                <BoardShell>
                    {sudoku === undefined
                        ? <LoadingState>Generating...</LoadingState>
                        : (
                            <SudokuGrid />
                        )}
                </BoardShell>

                <ActionBar>
                    <ActionButton onClick={cheatSolve}>Solve</ActionButton>

                    <ActionButton onClick={() => {
                        reset()
                    }}
                    >
                        New
                    </ActionButton>

                    <ActionButton onClick={() => { localStorage.clear() }}>Clear save</ActionButton>
                </ActionBar>
            </SudokuLayout>

            <StrategyPanel>
                <StrategyTitle>
                    Unlocked Strategies
                </StrategyTitle>

                <StrategyList>
                    {strategies.length > 0
                        ? strategies.map((strategy) => (
                            <StrategyRow
                                $active={strategy.id === currentStrategy?.id}
                                key={strategy.id}
                            >
                                <StrategyButton
                                    disabled={currentStrategy !== undefined}
                                    onClick={() => { setCurrentStrategy(strategy) }}
                                >
                                    {strategy.name}
                                </StrategyButton>
                            </StrategyRow>
                        ))
                        : <EmptyState>No strategies unlocked</EmptyState>}
                </StrategyList>
            </StrategyPanel>
        </AppStyle>
    )
}

export default App
