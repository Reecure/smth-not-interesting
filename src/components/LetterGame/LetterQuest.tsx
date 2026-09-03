import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import { letterMessage } from './letterMessage.ts'
import { parseLetter } from './parseLetter.ts'
import { candleJokes } from './candleJokes.ts'
import { measureWordWidth } from './measureText.ts'
import BurnWord from './BurnWord.tsx'
import Painting from './Painting.tsx'
import { submitAnswer } from '../../api/questApi.ts'
import styles from './LetterGame.module.css'

import jabich from '../../assets/ts-game/jabich.jpg'
import jabichGg from '../../assets/ts-game/jabich-gg.jpg'
import teamPhoto from '../../assets/ts-game/team-photo.jpg'
import teamPhotoGg from '../../assets/ts-game/team-photo-gg.jpg'
import winner from '../../assets/ts-game/winner.jpg'
import winnerGg from '../../assets/ts-game/winner-gg.jpg'

const HOT_THRESHOLD = 60
const HEAT_RISE_PER_SEC = 90
const HEAT_FALL_PER_SEC = 14
const DWELL_TICK_MS = 100
const DWELL_TARGET_MS = 300
const QUEST_ID = 'letter'

export default function LetterQuest() {
    const tokens = useMemo(() => parseLetter(letterMessage), [])
    const burnableTokens = useMemo(
        () => tokens.filter((t): t is { type: 'burnable'; value: string; id: string } => t.type === 'burnable'),
        [tokens]
    )
    const wordWidths = useMemo(
        () => Object.fromEntries(burnableTokens.map(t => [t.id, measureWordWidth(t.value)])),
        [burnableTokens]
    )

    const [burned, setBurned] = useState<Set<string>>(new Set())
    const [burning, setBurning] = useState<Set<string>>(new Set())
    const [values, setValues] = useState<Record<string, string>>({})
    const [heat, setHeat] = useState(0)
    const [joke, setJoke] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const overCandleRef = useRef(false)
    const heatRef = useRef(0)
    const dwellRef = useRef<Record<string, number>>({})
    const dwellIntervalsRef = useRef<Record<string, number>>({})

    const complete = burnableTokens.every(
        t => burned.has(t.id) && (values[t.id] ?? '').trim().length > 0
    )

    useEffect(() => {
        let raf = 0
        let last = performance.now()
        const loop = (now: number) => {
            const dt = (now - last) / 1000
            last = now
            const delta = overCandleRef.current ? HEAT_RISE_PER_SEC * dt : -HEAT_FALL_PER_SEC * dt
            heatRef.current = Math.min(100, Math.max(0, heatRef.current + delta))
            setHeat(heatRef.current)
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [])

    const handleWordEnter = (id: string) => {
        if (burned.has(id) || burning.has(id) || dwellIntervalsRef.current[id]) return
        dwellRef.current[id] = 0
        dwellIntervalsRef.current[id] = window.setInterval(() => {
            if (heatRef.current < HOT_THRESHOLD) {
                dwellRef.current[id] = 0
                return
            }
            dwellRef.current[id] += DWELL_TICK_MS
            if (dwellRef.current[id] >= DWELL_TARGET_MS) {
                clearInterval(dwellIntervalsRef.current[id])
                delete dwellIntervalsRef.current[id]
                setBurning(prev => new Set(prev).add(id))
            }
        }, DWELL_TICK_MS)
    }

    const handleWordLeave = (id: string) => {
        clearInterval(dwellIntervalsRef.current[id])
        delete dwellIntervalsRef.current[id]
        dwellRef.current[id] = 0
    }

    const handleBurnDone = useCallback((id: string) => {
        setBurned(prev => new Set(prev).add(id))
        setBurning(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    }, [])

    const showJoke = () => {
        setJoke(candleJokes[Math.floor(Math.random() * candleJokes.length)])
        window.setTimeout(() => setJoke(null), 1400)
    }

    const handleConfirm = () => {
        setSubmitted(true)
        submitAnswer(QUEST_ID, { values })
    }

    const heatFrac = heat / 100

    return (
        <QuestShell status={submitted ? 'done' : 'todo'}>
            <Painting
                front={jabich}
                back={jabichGg}
                alt="jabich"
                tilt={-3}
                position={{ top: 110, right: 60 }}
            />
            <Painting
                front={teamPhoto}
                back={teamPhotoGg}
                alt="team photo"
                tilt={2}
                position={{ bottom: 60, left: 60 }}
            />
            <Painting
                front={winner}
                back={winnerGg}
                alt="winner"
                tilt={-2}
                position={{ bottom: 60, right: 60 }}
            />

            <div className={styles.stage}>
                <div
                    className={styles.candleWrap}
                    onMouseEnter={() => { overCandleRef.current = true }}
                    onMouseLeave={() => { overCandleRef.current = false }}
                    onClick={complete ? showJoke : undefined}
                >
                    <div
                        className={styles.flame}
                        style={{
                            transform: `scale(${1 + heatFrac * 0.5})`,
                            boxShadow: `0 0 ${8 + heatFrac * 18}px ${2 + heatFrac * 6}px rgba(252,211,77,${0.35 + heatFrac * 0.4})`
                        }}
                    >
                        <div className={styles.flameHot} style={{ opacity: heatFrac }} />
                    </div>
                    <div className={styles.stick} />
                    {joke && <span className={styles.bubble}>{joke}</span>}
                    <p className={styles.hint}>проведи свечкой по экрану — сотрутся слова</p>
                </div>

                <div className={styles.card}>
                    <p>
                        {tokens.map((token, i) => {
                            if (token.type === 'text') return <span key={i}>{token.value}</span>

                            const id = token.id
                            const width = wordWidths[id]

                            if (burned.has(id)) {
                                return (
                                    <span key={i} className={styles.gap} style={{ width }}>
                                        <span className={styles.gapAsh} />
                                        <input
                                            className={styles.gapInput}
                                            placeholder="…"
                                            value={values[id] ?? ''}
                                            onChange={e => setValues(v => ({ ...v, [id]: e.target.value }))}
                                            style={{ width }}
                                        />
                                    </span>
                                )
                            }

                            if (burning.has(id)) {
                                return <BurnWord key={i} text={token.value} width={width} onDone={() => handleBurnDone(id)} />
                            }

                            return (
                                <span
                                    key={i}
                                    className={styles.burnable}
                                    style={{ width }}
                                    onMouseEnter={() => handleWordEnter(id)}
                                    onMouseLeave={() => handleWordLeave(id)}
                                >
                                    {token.value}
                                </span>
                            )
                        })}
                    </p>
                    {complete && !submitted && (
                        <button className="mobile__btn" onClick={handleConfirm}>подтвердить</button>
                    )}

                    {submitted && (
                        <div className={styles.doneWrap}>
                            <p className={styles.doneTitle}>письмо дописано твоей рукой</p>
                        </div>
                    )}
                </div>
            </div>
        </QuestShell>
    )
}