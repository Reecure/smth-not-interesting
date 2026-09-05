import { useEffect, useMemo, useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import { letterMessage } from './letterMessage.ts'
import { parseLetter } from './parseLetter.ts'
import { candleJokes } from './candleJokes.ts'
import { measureWordWidth } from './measureText.ts'
import Painting from './Painting.tsx'
import { useQuestProgress } from '../../api/useQuestProgress.ts'
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
const FADE_MS = 420

type Phase = 'idle' | 'fading' | 'gone'

export default function LetterQuest() {
    const { state, saving, saveError, submit, isDone, answer } = useQuestProgress('letter')

    const tokens = useMemo(() => parseLetter(letterMessage), [])
    const burnableTokens = useMemo(
        () =>
            tokens.filter(
                (t): t is { type: 'burnable'; value: string; id: string } =>
                    t.type === 'burnable'
            ),
        [tokens]
    )
    const wordWidths = useMemo(
        () => Object.fromEntries(burnableTokens.map(t => [t.id, measureWordWidth(t.value)])),
        [burnableTokens]
    )

    const [phases, setPhases] = useState<Record<string, Phase>>({})
    const [values, setValues] = useState<Record<string, string>>({})
    const [heat, setHeat] = useState(0)
    const [joke, setJoke] = useState<string | null>(null)

    const overCandleRef = useRef(false)
    const heatRef = useRef(0)
    const phasesRef = useRef<Record<string, Phase>>({})
    const timersRef = useRef<number[]>([])
    const restoredRef = useRef(false)

    phasesRef.current = phases

    const submitted = isDone

    useEffect(() => {
        if (restoredRef.current || !isDone || !answer) return
        restoredRef.current = true

        const saved = (answer.values as Record<string, string>) ?? {}
        setValues(saved)
        setPhases(
            Object.fromEntries(Object.keys(saved).map(id => [id, 'gone' as Phase]))
        )
    }, [isDone, answer])

    const goneIds = burnableTokens.filter(t => phases[t.id] === 'gone').map(t => t.id)
    const burnedCount = goneIds.length
    const emptyCount = goneIds.filter(id => !(values[id] ?? '').trim()).length
    const canSubmit = burnedCount > 0 && emptyCount === 0 && !saving

    useEffect(() => {
        let raf = 0
        let last = performance.now()
        const loop = (now: number) => {
            const dt = (now - last) / 1000
            last = now
            const delta = overCandleRef.current
                ? HEAT_RISE_PER_SEC * dt
                : -HEAT_FALL_PER_SEC * dt
            heatRef.current = Math.min(100, Math.max(0, heatRef.current + delta))
            setHeat(heatRef.current)
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [])

    useEffect(() => {
        return () => timersRef.current.forEach(t => window.clearTimeout(t))
    }, [])

    const touchWord = (id: string) => {
        if (submitted) return
        if (heatRef.current < HOT_THRESHOLD) return
        if (phasesRef.current[id]) return

        setPhases(p => ({ ...p, [id]: 'fading' }))
        timersRef.current.push(
            window.setTimeout(() => {
                setPhases(p => ({ ...p, [id]: 'gone' }))
            }, FADE_MS)
        )
    }

    const showJoke = () => {
        setJoke(candleJokes[Math.floor(Math.random() * candleJokes.length)])
        window.setTimeout(() => setJoke(null), 1400)
    }

    const handleConfirm = () => {
        if (!canSubmit) return

        const fullText = tokens
            .map(t => {
                if (t.type === 'text') return t.value
                return phases[t.id] === 'gone' ? (values[t.id] ?? '').trim() : t.value
            })
            .join('')

        const troll: [string, string][] = burnableTokens
            .filter(t => phases[t.id] === 'gone')
            .map(t => [(values[t.id] ?? '').trim(), t.value])

        const kept = burnableTokens.filter(t => phases[t.id] !== 'gone').map(t => t.value)

        submit({
            values,
            fullText,
            troll,
            kept,
            replaced: burnedCount,
            total: burnableTokens.length,
        })
    }

    const heatFrac = heat / 100
    const hot = heat >= HOT_THRESHOLD

    return (
        <QuestShell
            status={submitted ? 'done' : 'todo'}
            state={state}
            saving={saving}
            saveError={saveError}
        >
            <div className={styles.brief}>
                <h1 className={styles.briefTitle}>Письмо писал не я, клянусь)</h1>
                <p className={styles.briefText}>
                    Стирать все не обязательно, если считаешь что можно оставить.
                </p>
            </div>

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
                    onMouseEnter={() => {
                        overCandleRef.current = true
                    }}
                    onMouseLeave={() => {
                        overCandleRef.current = false
                    }}
                    onClick={submitted ? showJoke : undefined}
                >
                    <div
                        className={styles.flame}
                        style={{
                            transform: `scale(${1 + heatFrac * 0.5})`,
                            boxShadow: `0 0 ${8 + heatFrac * 18}px ${
                                2 + heatFrac * 6
                            }px rgba(252,211,77,${0.35 + heatFrac * 0.4})`,
                        }}
                    >
                        <div className={styles.flameHot} style={{ opacity: heatFrac }} />
                    </div>
                    <div className={styles.stick} />
                    {joke && <span className={styles.bubble}>{joke}</span>}

                    <div className={styles.heatBar}>
                        <div
                            className={`${styles.heatFill} ${hot ? styles.heatFillHot : ''}`}
                            style={{ height: `${heat}%` }}
                        />
                    </div>

                    <p className={styles.hint}>
                        {hot ? 'веди по словам' : 'наведи, чтобы разогреть'}
                    </p>
                </div>

                <div className={`${styles.card} ${hot ? styles.cardHot : ''}`}>
                    <p className={styles.letterText}>
                        {tokens.map((token, i) => {
                            if (token.type === 'text') return <span key={i}>{token.value}</span>

                            const id = token.id
                            const width = wordWidths[id]
                            const phase = phases[id]

                            if (phase === 'gone') {
                                const empty = !(values[id] ?? '').trim()
                                return (
                                    <span key={i} className={styles.gap} style={{ width }}>
                                        <input
                                            className={`${styles.gapInput} ${
                                                empty ? styles.gapInputEmpty : ''
                                            }`}
                                            placeholder="…"
                                            value={values[id] ?? ''}
                                            onChange={e =>
                                                setValues(v => ({ ...v, [id]: e.target.value }))
                                            }
                                            disabled={submitted}
                                            style={{ width }}
                                        />
                                    </span>
                                )
                            }

                            return (
                                <span
                                    key={i}
                                    className={[
                                        styles.burnable,
                                        phase === 'fading' ? styles.burnableFading : '',
                                        hot && !submitted ? styles.burnableHot : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    style={{ width }}
                                    onMouseEnter={() => touchWord(id)}
                                >
                                    {token.value}
                                </span>
                            )
                        })}
                    </p>

                    <div className={styles.cardFooter}>
                        {submitted ? (
                            <p className={styles.doneTitle}>
                                НадейсЯ оно дойдет в целосности и сохранности xd
                            </p>
                        ) : (
                            <>
                                <span className={styles.footerNote}>
                                    {saveError && 'не сохранилось, попробуй ещё'}
                                    {!saveError && burnedCount === 0 && 'сотри хотя бы одно слово'}
                                    {!saveError && burnedCount > 0 && emptyCount > 0 && 'заполни пропуски'}
                                    {!saveError && canSubmit && 'можно отправлять'}
                                </span>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={handleConfirm}
                                    disabled={!canSubmit}
                                >
                                    {saving ? 'сохраняю...' : 'готово'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </QuestShell>
    )
}