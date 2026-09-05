import { useCallback, useRef, useState } from 'react'
import styles from './StoryQuest.module.css'

type Phase = 'idle' | 'rolling' | 'result'

type Props = {
    bet: number
    coins: number
    onWin: (n: number) => void
    onLose: () => void
    onResult: (won: boolean) => void
}

const PIPS: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
}

export default function DiceGame({ bet, coins, onWin, onLose, onResult }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [dice, setDice] = useState<[number, number]>([1, 1])
    const [payout, setPayout] = useState(0)
    const [note, setNote] = useState('')
    const timers = useRef<number[]>([])

    const roll = useCallback(() => {
        if (phase !== 'idle' || coins < bet) return
        onLose()
        setPhase('rolling')
        setNote('')

        let ticks = 0
        const tick = () => {
            setDice([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)])
            ticks += 1
            if (ticks < 12) {
                timers.current.push(window.setTimeout(tick, 60 + ticks * 12))
                return
            }

            const a = 1 + Math.floor(Math.random() * 6)
            const b = 1 + Math.floor(Math.random() * 6)
            setDice([a, b])

            const sum = a + b
            let win = 0
            let text = ''

            if (a === b && a === 6) {
                win = bet * 8
                text = 'две шестёрки'
            } else if (a === b) {
                win = bet * 4
                text = 'дубль'
            } else if (sum >= 10) {
                win = bet * 2
                text = `сумма ${sum}`
            } else if (sum === 7) {
                win = bet
                text = 'семь, ставка назад'
            } else {
                text = `сумма ${sum}, мимо`
            }

            setPayout(win)
            setNote(text)
            setPhase('result')
            onResult(win > bet)
            if (win > 0) onWin(win)

            timers.current.push(window.setTimeout(() => setPhase('idle'), 1900))
        }
        tick()
    }, [bet, coins, phase, onLose, onWin, onResult])

    return (
        <div className={styles.mini}>
            <p className={styles.miniTitle}>кости</p>
            <p className={styles.miniSub}>ставка {bet} · дубль ×4 · 66 ×8</p>

            <div className={styles.diceRow}>
                {dice.map((face, i) => (
                    <div
                        key={i}
                        className={`${styles.die} ${phase === 'rolling' ? styles.dieRolling : ''}`}
                    >
                        {Array.from({ length: 9 }).map((_, cell) => (
                            <span
                                key={cell}
                                className={`${styles.pip} ${
                                    PIPS[face].includes(cell) ? styles.pipOn : ''
                                }`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <p className={styles.miniStatus}>
                {phase === 'idle' && 'сумма 10+ удваивает'}
                {phase === 'rolling' && '···'}
                {phase === 'result' && (payout > 0 ? `${note} · +${payout}` : note)}
            </p>

            <button
                className={styles.miniBtn}
                onClick={roll}
                disabled={phase !== 'idle' || coins < bet}
            >
                {coins < bet ? 'нет монет' : `бросить · ${bet}`}
            </button>
        </div>
    )
}