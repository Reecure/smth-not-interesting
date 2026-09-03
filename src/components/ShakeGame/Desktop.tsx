import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {usePeerStatus} from "./usePeerStatus.ts";
import LandingField, {type LandingFieldHandle} from "./LandingField.tsx";
import {openRevealWindow, removeCrate, startGameInWindow} from "./revealWindow.ts";
import Background from "../../animations/Background.tsx";
import StartScreen from "../StartScreen.tsx";
import RainBackground from "../RainBackground.tsx";
import Pond from "./Pond.tsx";
import { makeDuckSeed, type DuckSeed } from "./duckSeed.ts";

import { isQuestComplete, submitAnswer } from '../../api/questApi.ts'

const CRATE_COUNT = 5
const POPUP_POLL_MS = 1000
const QUEST_ID = 'shake'

type Stage = 'idle' | 'shaking' | 'done'

export default function Desktop() {
    const [stage, setStage] = useState<Stage>(() => {
        return isQuestComplete(QUEST_ID) ? 'done' : 'idle'
    })
    const [code, setCode] = useState('')
    const [popupOpen, setPopupOpen] = useState(false)
    const [ducks, setDucks] = useState<DuckSeed[]>(() => {
        if (!isQuestComplete(QUEST_ID)) return []
        return Array.from({ length: CRATE_COUNT }, (_, i) => makeDuckSeed(i))
    })

    const revealWindowRef = useRef<Window | null>(null)
    const landingFieldRef = useRef<LandingFieldHandle>(null)
    const gameStartedRef = useRef(false)

    const { connected, peer } = usePeerStatus(stage === 'shaking' ? code : '')

    useEffect(() => {
        if (stage !== 'shaking') return
        fetch('/api/room')
            .then(r => r.json())
            .then(d => setCode(d.code))
    }, [stage])

    useEffect(() => {
        if (!peer || !code) return
        if (gameStartedRef.current) return
        const w = revealWindowRef.current
        if (!w || w.closed) return
        startGameInWindow(w, CRATE_COUNT, code)
        gameStartedRef.current = true
    }, [peer, code])

    useEffect(() => {
        if (stage !== 'shaking') return
        const interval = setInterval(() => {
            const w = revealWindowRef.current
            if (w && w.closed) {
                restartRoom()
            }
        }, POPUP_POLL_MS)
        return () => clearInterval(interval)
    }, [stage])

    const openPopup = () => {
        const w = openRevealWindow()
        if (!w) {
            setPopupOpen(false)
            return null
        }
        revealWindowRef.current = w
        setPopupOpen(true)
        return w
    }

    const restartRoom = () => {
        setDucks([])
        landingFieldRef.current?.clearAll()
        gameStartedRef.current = false
        revealWindowRef.current?.close()
        revealWindowRef.current = null
        setCode('')
        fetch('/api/room')
            .then(r => r.json())
            .then(d => setCode(d.code))
        openPopup()
    }

    const start = () => {
        setStage('shaking')
        openPopup()
    }

    const handleCrateArrived = (crateId: string) => {
        removeCrate(revealWindowRef.current, crateId)
    }

    const handleDropCrate = (crateId: string) => {
        landingFieldRef.current?.removeCrate(crateId)
        setDucks(prev => {
            const next = [...prev, makeDuckSeed(prev.length)]
            if (next.length >= CRATE_COUNT) {
                submitAnswer(QUEST_ID, { ducksPlaced: CRATE_COUNT })
                revealWindowRef.current?.close()
                revealWindowRef.current = null
                setStage('done')
            }
            return next
        })
    }

    const mobileUrl = code ? `${window.location.origin}/m/${code}` : ''

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
            <a className="quest-shell__back" href="/">← Квесты</a>

            <div className="stage">
                {stage === 'shaking' && !popupOpen && (
                    <button className="reopen-btn" onClick={openPopup}>окно недоступно — открыть заново</button>
                )}

                {stage === 'shaking' && <LandingField ref={landingFieldRef} onCrateArrived={handleCrateArrived} />}

                <h1 className="title">{stage === 'done' ? 'утиный пруд' : 'собери уточек в лужице'}</h1>
                {stage === 'done' && (
                    <p className="subtitle">нажмите на уточку, чтобы спрятать её — нажмите ещё раз, чтобы вернуть</p>
                )}

                <Pond ducks={ducks} total={CRATE_COUNT} complete={stage === 'done'} onDropCrate={handleDropCrate} />

                {stage === 'shaking' && !peer && code && (
                    <div className="qr">
                        <QRCodeSVG value={mobileUrl} size={180} bgColor="#150E33" fgColor="#A78BFA" />
                        <p className="hint">{code}</p>
                        <p className="url">{mobileUrl}</p>
                        <p className="status">{connected ? 'жду телефон' : 'подключаюсь...'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}