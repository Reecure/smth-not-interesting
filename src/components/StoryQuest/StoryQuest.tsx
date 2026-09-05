import { useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import Reel from './Reel.tsx'
import CatCanvas from './CatCanvas.tsx'
import ThimbleGame from './ThimbleGame.tsx'
import DiceGame from './DiceGame.tsx'
import MemoryGame from './MemoryGame.tsx'
import CoinFlip from './CoinFlip.tsx'
import { useCasino } from './useCasino.ts'
import {
    MAX_SCORE,
    SLOT_ORDER,
    SPIN_COST,
    THIMBLE_BET,
    THIMBLE_WIN,
    boardScore,
    buildStory,
    isPerfect,
} from './casino.ts'
import { useQuestProgress } from '../../api/useQuestProgress.ts'
import styles from './StoryQuest.module.css'

const DICE_BET = 2
const MEMORY_BET = 2
const MEMORY_WIN = 5
const COIN_BET = 1

export default function StoryQuest() {
    const { state, saving, saveError, submit, isDone, answer } = useQuestProgress('story')

    const {
        coins, board, spinning, toast, spins,
        spin, buy, sell, addCoins, takeCoins, reels,
    } = useCasino()

    const [wins, setWins] = useState(0)
    const [games, setGames] = useState(0)

    const finished = isDone
    const ready = board.cats.length > 0 && !!board.food && !!board.water && !!board.toy
    const score = boardScore(board)
    const perfect = isPerfect(board)

    const trackResult = (won: boolean) => {
        setGames(n => n + 1)
        if (won) setWins(n => n + 1)
    }

    const finish = () => {
        if (saving) return
        const text = buildStory(board, coins, wins)
        submit({
            story: text,
            score,
            perfect,
            cats: board.cats.map(c => c.id),
            coinsLeft: coins,
            spins,
            gamesPlayed: games,
            gamesWon: wins,
        })
    }

    if (finished) {
        return (
            <QuestShell status="done" state={state} saving={saving} saveError={saveError}>
                <CatCanvas cats={board.cats} />
                <div className={styles.final}>
                    <p className={styles.finalStory}>
                        {(answer?.story as string) ?? 'Результат записан...'}
                    </p>
                </div>
            </QuestShell>
        )
    }

    return (
        <QuestShell status="todo" state={state} saving={saving} saveError={saveError}>
            <CatCanvas cats={board.cats} />

            <div className={styles.casino}>
                <div className={styles.head}>
                    <p className={styles.headTitle}>
                        Извини, все в крипте, а обеспечить котиков надо, думай...
                    </p>
                    <div className={styles.wallet}>
                        <span className={styles.coins}>{coins}</span>
                        <span className={styles.coinsLabel}>монет</span>
                    </div>
                </div>

                <div className={styles.reels}>
                    {SLOT_ORDER.map(slot => (
                        <Reel
                            key={slot}
                            slot={slot}
                            title={reels[slot].title}
                            items={reels[slot].items}
                            spinnable={reels[slot].spinnable}
                            multi={reels[slot].multi}
                            picked={slot === 'cat' ? undefined : board[slot as 'food']}
                            owned={slot === 'cat' ? board.cats : undefined}
                            spinning={spinning === slot}
                            coins={coins}
                            spinCost={SPIN_COST}
                            onSpin={() => spin(slot)}
                            onBuy={item => buy(slot, item)}
                            onSell={id => sell(slot, id)}
                        />
                    ))}
                </div>

                <div className={styles.games}>
                    <ThimbleGame
                        bet={THIMBLE_BET}
                        prize={THIMBLE_WIN}
                        coins={coins}
                        onWin={() => addCoins(THIMBLE_WIN)}
                        onLose={() => takeCoins(THIMBLE_BET)}
                        onResult={trackResult}
                    />
                    <MemoryGame
                        bet={MEMORY_BET}
                        prize={MEMORY_WIN}
                        coins={coins}
                        onWin={() => addCoins(MEMORY_WIN)}
                        onLose={() => takeCoins(MEMORY_BET)}
                        onResult={trackResult}
                    />
                    <DiceGame
                        bet={DICE_BET}
                        coins={coins}
                        onWin={n => addCoins(n)}
                        onLose={() => takeCoins(DICE_BET)}
                        onResult={trackResult}
                    />
                    <CoinFlip
                        bet={COIN_BET}
                        coins={coins}
                        onWin={n => addCoins(n)}
                        onLose={() => takeCoins(COIN_BET)}
                        onResult={trackResult}
                    />
                </div>

                <div className={styles.finishBox}>
                    <p className={styles.scoreLine}>
                        счёт: <b>{score}</b> / {MAX_SCORE}
                        {board.cats.length > 1 && (
                            <span className={styles.gamesStat}>
                                {' '}· припасы делятся на {board.cats.length}
                            </span>
                        )}
                    </p>

                    {perfect && <p className={styles.perfectTag}>идеально</p>}

                    <button
                        className={styles.finishBtn}
                        onClick={finish}
                        disabled={!ready || saving}
                    >
                        {saving
                            ? 'сохраняю...'
                            : ready
                                ? 'на этом всё'
                                : 'нужен кот, еда, вода и игрушка'}
                    </button>

                    <p className={styles.finishHint}>
                        каждый кот стоит 5. чем больше котов, тем сильнее делятся припасы.
                    </p>
                </div>

                {toast && <div className={styles.toast}>{toast}</div>}
            </div>
        </QuestShell>
    )
}