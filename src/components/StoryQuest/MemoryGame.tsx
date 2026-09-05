import { useCallback, useRef, useState } from 'react'
import styles from './StoryQuest.module.css'

type Phase = 'idle' | 'show' | 'input' | 'result'

type Props = {
    bet: number
    prize: number
    coins: number
    onWin: () => void
    onLose: () => void
    onResult: (won: boolean) => void
}

const CARDS = ['🐟', '🧶', '🥛', '🐭']
const LEN = 6
const SHOW_MS = 420

export default function MemoryGame({ bet, prize, coins, onWin, onLose, onResult }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [seq, setSeq] = useState<number[]>([])
    const [active, setActive] = useState<number | null>(null)
    const [step, setStep] = useState(0)
    const [wrong, setWrong] = useState<number | null>(null)
    const [won, setWon] = useState(false)
    const seqRef = useRef<number[]>([])
    const timers = useRef<number[]>([])

    const later = (fn: () => void, ms: number) => {
        timers.current.push(window.setTimeout(fn, ms))
    }

    const start = useCallback(() => {
        if (phase !== 'idle' || coins < bet) return
        onLose()

        const next = Array.from({ length: LEN }, () =>
            Math.floor(Math.random() * CARDS.length)
        )
        seqRef.current = next
        setSeq(next)
        setStep(0)
        setWrong(null)
        setPhase('show')

        next.forEach((idx, i) => {
            later(() => setActive(idx), 500 + i * SHOW_MS)
            later(() => setActive(null), 500 + i * SHOW_MS + SHOW_MS * 0.6)
        })
        later(() => setPhase('input'), 500 + next.length * SHOW_MS + 200)
    }, [bet, coins, phase, onLose])

    const press = (idx: number) => {
        if (phase !== 'input') return

        if (seqRef.current[step] !== idx) {
            setWrong(idx)
            setWon(false)
            setPhase('result')
            onResult(false)
            later(() => {
                setPhase('idle')
                setWrong(null)
            }, 1500)
            return
        }

        setActive(idx)
        later(() => setActive(null), 180)

        const nextStep = step + 1
        setStep(nextStep)

        if (nextStep >= seqRef.current.length) {
            setWon(true)
            setPhase('result')
            onWin()
            onResult(true)
            later(() => setPhase('idle'), 1600)
        }
    }

    return (
        <div className={styles.mini}>
            <p className={styles.miniTitle}>что любит кот</p>
            <p className={styles.miniSub}>ставка {bet} · выигрыш {prize}</p>

            <div className={styles.cards}>
                {CARDS.map((glyph, i) => (
                    <button
                        key={i}
                        className={[
                            styles.card,
                            active === i ? styles.cardActive : '',
                            wrong === i ? styles.cardWrong : '',
                            phase === 'input' ? styles.cardPickable : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => press(i)}
                        disabled={phase !== 'input'}
                    >
                        {glyph}
                    </button>
                ))}
            </div>

            <p className={styles.miniStatus}>
                {phase === 'idle' && 'повтори порядок'}
                {phase === 'show' && 'смотри'}
                {phase === 'input' && `${step} / ${seq.length}`}
                {phase === 'result' && (won ? `+${prize}` : 'не тот')}
            </p>

            <button
                className={styles.miniBtn}
                onClick={start}
                disabled={phase !== 'idle' || coins < bet}
            >
                {coins < bet ? 'нет монет' : `играть · ${bet}`}
            </button>
        </div>
    )
}