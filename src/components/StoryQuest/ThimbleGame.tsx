import { useCallback, useRef, useState } from 'react'
import styles from './StoryQuest.module.css'

type Phase = 'idle' | 'peek' | 'shuffle' | 'guess' | 'reveal'

type Props = {
    bet: number
    prize: number
    coins: number
    onWin: () => void
    onLose: () => void
    onResult: (won: boolean) => void
}

const GAP = 92
const SWAPS = 9
const START_MS = 480
const MIN_MS = 130

export default function ThimbleGame({ bet, prize, coins, onWin, onLose, onResult }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [pos, setPos] = useState<number[]>([0, 1, 2])
    const [ballCup, setBallCup] = useState(0)
    const [choice, setChoice] = useState<number | null>(null)
    const [moveMs, setMoveMs] = useState(START_MS)
    const [won, setWon] = useState(false)
    const [streak, setStreak] = useState(0)

    const posRef = useRef<number[]>([0, 1, 2])
    const timers = useRef<number[]>([])

    const clearTimers = () => {
        timers.current.forEach(t => window.clearTimeout(t))
        timers.current = []
    }

    const later = (fn: () => void, ms: number) => {
        timers.current.push(window.setTimeout(fn, ms))
    }

    const start = useCallback(() => {
        if (coins < bet || phase !== 'idle') return
        clearTimers()
        onLose()

        const startCup = Math.floor(Math.random() * 3)
        posRef.current = [0, 1, 2]
        setPos([0, 1, 2])
        setBallCup(startCup)
        setChoice(null)
        setMoveMs(START_MS)
        setPhase('peek')

        later(() => {
            setPhase('shuffle')
            let done = 0
            let delay = START_MS

            const step = () => {
                const a = Math.floor(Math.random() * 3)
                let b = Math.floor(Math.random() * 3)
                while (b === a) b = Math.floor(Math.random() * 3)

                const next = [...posRef.current]
                const cupA = next.findIndex(p => p === a)
                const cupB = next.findIndex(p => p === b)
                next[cupA] = b
                next[cupB] = a
                posRef.current = next
                setPos(next)

                done += 1
                delay = Math.max(MIN_MS, Math.round(delay * 0.82))
                setMoveMs(delay)

                if (done < SWAPS) later(step, delay)
                else later(() => setPhase('guess'), delay + 220)
            }

            later(step, 260)
        }, 1300)
    }, [bet, coins, phase, onLose])

    const pick = (position: number) => {
        if (phase !== 'guess') return
        const cupHere = posRef.current.findIndex(p => p === position)
        setChoice(cupHere)
        const success = cupHere === ballCup
        setWon(success)
        setPhase('reveal')
        onResult(success)

        if (success) {
            onWin()
            setStreak(s => s + 1)
        } else {
            setStreak(0)
        }
        later(() => setPhase('idle'), 2100)
    }

    const cupLifted = (cupId: number) => {
        if (phase === 'peek') return cupId === ballCup
        if (phase === 'reveal') return cupId === choice || cupId === ballCup
        return false
    }

    return (
        <div className={styles.thimbles}>
            <p className={styles.thimbleTitle}>наперстки</p>
            <p className={styles.thimbleSub}>
                ставка {bet} · выигрыш {prize}
                {streak > 1 && ` · подряд ${streak}`}
            </p>

            <div className={styles.cups}>
                {[0, 1, 2].map(cupId => (
                    <div
                        key={cupId}
                        className={styles.cupSlot}
                        style={{
                            transform: `translateX(${(pos[cupId] - 1) * GAP}px)`,
                            transitionDuration: `${moveMs}ms`,
                            zIndex: phase === 'shuffle' ? (pos[cupId] === 1 ? 3 : 1) : 2,
                        }}
                    >
                        {cupId === ballCup && <span className={styles.ball} />}

                        <button
                            className={[
                                styles.cup,
                                cupLifted(cupId) ? styles.cupLifted : '',
                                phase === 'guess' ? styles.cupPickable : '',
                                phase === 'reveal' && cupId === choice
                                    ? won
                                        ? styles.cupWin
                                        : styles.cupLose
                                    : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            onClick={() => pick(pos[cupId])}
                            disabled={phase !== 'guess'}
                            aria-label="стакан"
                        />
                    </div>
                ))}
            </div>

            <p className={styles.thimbleStatus}>
                {phase === 'idle' && 'следи за шариком'}
                {phase === 'peek' && 'запоминай'}
                {phase === 'shuffle' && '···'}
                {phase === 'guess' && 'где шарик?'}
                {phase === 'reveal' && (won ? `+${prize}` : 'мимо')}
            </p>

            <button
                className={styles.thimbleBtn}
                onClick={start}
                disabled={phase !== 'idle' || coins < bet}
            >
                {coins < bet ? 'нет монет' : `играть · ${bet}`}
            </button>
        </div>
    )
}