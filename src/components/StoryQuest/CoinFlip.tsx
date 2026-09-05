import { useCallback, useRef, useState } from 'react'
import styles from './StoryQuest.module.css'

type Phase = 'idle' | 'flipping' | 'won' | 'lost'

type Props = {
    bet: number
    coins: number
    onWin: (n: number) => void
    onLose: () => void
    onResult: (won: boolean) => void
}

const MAX_STREAK = 4

export default function CoinFlip({ bet, coins, onWin, onLose, onResult }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [pot, setPot] = useState(0)
    const [streak, setStreak] = useState(0)
    const [face, setFace] = useState<'heads' | 'tails'>('heads')
    const [best, setBest] = useState(0)
    const timers = useRef<number[]>([])

    const flip = useCallback(
        (guess: 'heads' | 'tails') => {
            if (phase === 'flipping') return

            const staking = phase === 'idle'
            if (staking) {
                if (coins < bet) return
                onLose()
            }

            setPhase('flipping')

            timers.current.push(
                window.setTimeout(() => {
                    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails'
                    setFace(result)

                    if (result === guess) {
                        const nextPot = staking ? bet * 2 : pot * 2
                        const nextStreak = streak + 1
                        setPot(nextPot)
                        setStreak(nextStreak)
                        setBest(b => Math.max(b, nextStreak))
                        onResult(true)

                        if (nextStreak >= MAX_STREAK) {
                            onWin(nextPot)
                            setPhase('idle')
                            setPot(0)
                            setStreak(0)
                            return
                        }
                        setPhase('won')
                    } else {
                        setPot(0)
                        setStreak(0)
                        setPhase('lost')
                        onResult(false)
                        timers.current.push(
                            window.setTimeout(() => setPhase('idle'), 1500)
                        )
                    }
                }, 900)
            )
        },
        [bet, coins, phase, pot, streak, onLose, onWin, onResult]
    )

    const cashOut = () => {
        if (phase !== 'won' || pot === 0) return
        onWin(pot)
        setPot(0)
        setStreak(0)
        setPhase('idle')
    }

    return (
        <div className={styles.mini}>
            <p className={styles.miniTitle}>орёл или решка</p>
            <p className={styles.miniSub}>
                ставка {bet} · удвоение до ×{2 ** MAX_STREAK}
                {best > 0 && ` · рекорд ${best}`}
            </p>

            <div className={styles.coinBox}>
                <div
                    className={[
                        styles.coin,
                        phase === 'flipping' ? styles.coinSpin : '',
                        face === 'tails' ? styles.coinTails : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <span className={styles.coinFace}>{face === 'heads' ? 'О' : 'Р'}</span>
                </div>
                {pot > 0 && <span className={styles.pot}>банк {pot}</span>}
            </div>

            <p className={styles.miniStatus}>
                {phase === 'idle' && 'угадай сторону'}
                {phase === 'flipping' && '···'}
                {phase === 'won' && `${streak} подряд — рискнёшь?`}
                {phase === 'lost' && 'банк сгорел'}
            </p>

            <div className={styles.coinBtns}>
                <button
                    className={styles.miniBtn}
                    onClick={() => flip('heads')}
                    disabled={phase === 'flipping' || (phase === 'idle' && coins < bet)}
                >
                    орёл
                </button>
                <button
                    className={styles.miniBtn}
                    onClick={() => flip('tails')}
                    disabled={phase === 'flipping' || (phase === 'idle' && coins < bet)}
                >
                    решка
                </button>
            </div>

            {phase === 'won' && (
                <button className={styles.cashBtn} onClick={cashOut}>
                    забрать {pot}
                </button>
            )}
        </div>
    )
}