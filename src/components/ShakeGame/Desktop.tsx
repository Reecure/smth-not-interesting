import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import LandingField, { type LandingFieldHandle } from './LandingField.tsx'
import { useShakeProgress } from './useShakeProgress.ts'
import Background from '../../animations/Background.tsx'
import StartScreen from '../StartScreen.tsx'
import RainBackground from '../RainBackground.tsx'
import Pond from './Pond.tsx'
import { makeDuckSeed, type DuckSeed } from './duckSeed.ts'
import { useQuestProgress } from '../../api/useQuestProgress.ts'
import { resetProgress } from '../../api/questApi.ts'
import BackButton from '../ui/BackButton/BackButton.tsx'

const API_URL = 'https://smth-not-interesting-back.onrender.com'
const DUCK_COUNT = 5

type Stage = 'idle' | 'shaking' | 'done'

export default function Desktop() {
    const { state, saving, saveError, submit, isDone } = useQuestProgress('shake')

    const [stage, setStage] = useState<Stage>('idle')
    const [code, setCode] = useState('')
    const [ducks, setDucks] = useState<DuckSeed[]>([])
    const [dragActive, setDragActive] = useState(false)

    const fieldRef = useRef<LandingFieldHandle>(null)
    const pondRef = useRef<HTMLDivElement>(null)
    const restoredRef = useRef(false)

    const { connected, peer, progress, amp, peak, spawned } = useShakeProgress({
        code,
        total: DUCK_COUNT,
        active: stage === 'shaking',
        onSpawn: index => fieldRef.current?.spawnDuck(index),
    })

    useEffect(() => {
        if (restoredRef.current || !isDone) return
        restoredRef.current = true
        setDucks(Array.from({ length: DUCK_COUNT }, (_, i) => makeDuckSeed(i)))
        setStage('done')
    }, [isDone])

    useEffect(() => {
        if (stage !== 'shaking' || code) return
        fetch(`${API_URL}/api/room`)
            .then(r => r.json())
            .then(d => setCode(d.code))
            .catch(console.error)
    }, [stage, code])

    const start = () => setStage('shaking')

    const handleReset = async () => {
        await resetProgress('shake')
        restoredRef.current = false
        setDucks([])
        setCode('')
        fieldRef.current?.clearAll()
        setStage('idle')
    }

    const handleDuckToPond = () => {
        setDucks(prev => {
            const next = [...prev, makeDuckSeed(prev.length)]
            if (next.length >= DUCK_COUNT) {
                submit({ ducksPlaced: DUCK_COUNT, peak })
                fieldRef.current?.clearAll()
                setStage('done')
            }
            return next
        })
    }

    const mobileUrl = code
        ? `${window.location.origin}${window.location.pathname}#/m/${code}`
        : ''

    const allSpawned = spawned >= DUCK_COUNT
    const showQr = stage === 'shaking' && spawned === 0

    if (stage === 'idle') {
        return (
            <div className="wrapper">
                <Background className="bg-lottie" />
                <StartScreen onStart={start} />
            </div>
        )
    }

    return (
        <div className="wrapper">
            <Background className="bg-lottie" />
            <RainBackground />

            <a className="quest-shell__back" href="/smth-not-interesting/">
                <BackButton onClick={() => {}} />
            </a>

            <div className="quest-shell__state">
                {state === 'loading' && <span className="badge badge--muted">загрузка...</span>}
                {state === 'offline' && <span className="badge badge--warn">офлайн</span>}
                {saving && <span className="badge badge--muted">сохраняю...</span>}
                {saveError && <span className="badge badge--warn">не сохранилось</span>}
                {stage === 'done' && !saving && <span className="badge badge--ok">пройдено</span>}
            </div>

            {stage === 'done' && (
                <button className="reset-btn" onClick={handleReset}>
                    пройти заново
                </button>
            )}

            {stage === 'shaking' && (
                <LandingField
                    ref={fieldRef}
                    pondRef={pondRef}
                    onDuckToPond={handleDuckToPond}
                    onDragChange={setDragActive}
                />
            )}

            <div className="stage">
                <div
                    className="shake-head"
                    style={{
                        ['--a' as string]: amp.toFixed(2),
                        animation: amp > 0.5 ? 'quake 70ms infinite' : 'none',
                        filter: amp > 4 ? `blur(${(amp - 4) * 0.1}px)` : 'none',
                    }}
                >
                    <h1 className="title">
                        {stage === 'done'
                            ? 'утиный пруд'
                            : allSpawned
                                ? 'тащи уточек в лужицу'
                                : 'тряси телефон'}
                    </h1>

                    {stage === 'shaking' && (
                        <>
                            <div className="bar">
                                <div className="bar__fill" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="stats">
                                <span>{Math.round(progress)}%</span>
                                <span>
                                    выпало: {spawned}/{DUCK_COUNT}
                                </span>
                                <span>пик: {peak}</span>
                            </div>
                        </>
                    )}

                    {stage === 'done' && (
                        <p className="subtitle">
                            нажмите на уточку, чтобы спрятать её — нажмите ещё раз, чтобы вернуть
                        </p>
                    )}
                </div>

                <Pond
                    ref={pondRef}
                    ducks={ducks}
                    total={DUCK_COUNT}
                    complete={stage === 'done'}
                    dragActive={dragActive}
                />

                {showQr && (
                    <div className="qr">
                        {code ? (
                            <>
                                <QRCodeSVG
                                    value={mobileUrl}
                                    size={180}
                                    level="L"
                                    bgColor="#150E33"
                                    fgColor="#A78BFA"
                                />
                                <p className="hint">{code}</p>
                                <p className="url">{mobileUrl}</p>
                                <p className="status">
                                    {peer
                                        ? 'телефон на связи'
                                        : connected
                                            ? 'жду телефон'
                                            : 'подключаюсь...'}
                                </p>
                            </>
                        ) : (
                            <p className="status">получаю комнату...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}