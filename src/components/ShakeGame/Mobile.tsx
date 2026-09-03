import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createHub } from '../../lib/hub.ts'
import type { HubConnection } from '@microsoft/signalr'

type Phase = 'idle' | 'ready' | 'denied' | 'unsupported'

const JERK_MIN = 1.5
const SEND_INTERVAL_MS = 50

export default function Mobile() {
    const { code = '' } = useParams()
    const [phase, setPhase] = useState<Phase>('idle')
    const [force, setForce] = useState(0)
    const [sent, setSent] = useState(0)
    const [debug, setDebug] = useState('')

    const hubRef = useRef<HubConnection | null>(null)
    const lastMagRef = useRef<number | null>(null)
    const lastSendRef = useRef(0)
    const eventCountRef = useRef(0)
    const lastEventAtRef = useRef(0)

    const phaseRef = useRef<Phase>('idle')
    phaseRef.current = phase

    useEffect(() => {
        const hub = createHub()
        hubRef.current = hub
        hub.start()
            .then(() => hub.invoke('JoinRoom', code))
            .catch(err => setDebug(String(err)))

        return () => { hub.stop() }
    }, [code])

    const handleMotion = (e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity
        if (!a || a.x == null) return

        eventCountRef.current += 1
        lastEventAtRef.current = Date.now()

        const mag = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0)
        const prev = lastMagRef.current
        lastMagRef.current = mag

        if (phaseRef.current !== 'ready' || prev == null) return

        const jerk = Math.abs(mag - prev)
        setForce(jerk)
        setDebug(`events=${eventCountRef.current} mag=${mag.toFixed(1)} jerk=${jerk.toFixed(1)}`)

        const now = Date.now()
        if (jerk > JERK_MIN && now - lastSendRef.current > SEND_INTERVAL_MS) {
            lastSendRef.current = now
            hubRef.current?.invoke('Shake', code, jerk).catch(err => setDebug(d => d + ` | invoke error ${err}`))
            setSent(s => s + 1)
        }
    }

    useEffect(() => {
        window.addEventListener('devicemotion', handleMotion)
        return () => window.removeEventListener('devicemotion', handleMotion)
    }, [])

    useEffect(() => {
        if (phase !== 'ready') return

        const nav = navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
        let lock: { release: () => Promise<void> } | null = null
        nav.wakeLock?.request('screen').then(l => { lock = l }).catch(() => {})

        const stall = setInterval(() => {
            if (Date.now() - lastEventAtRef.current > 1500) {
                setDebug(d => `нет событий сенсора > 1.5с (events=${eventCountRef.current}) ${d}`)
            }
        }, 1500)

        return () => {
            clearInterval(stall)
            lock?.release().catch(() => {})
        }
    }, [phase])

    const start = async () => {
        const DME = DeviceMotionEvent as unknown as {
            requestPermission?: () => Promise<'granted' | 'denied'>
        }

        if (typeof DME.requestPermission === 'function') {
            try {
                const res = await DME.requestPermission()
                if (res !== 'granted') { setPhase('denied'); return }
            } catch (err) {
                setDebug(String(err))
                setPhase('denied')
                return
            }
        } else if (!('DeviceMotionEvent' in window)) {
            setPhase('unsupported')
            return
        }

        lastMagRef.current = null
        eventCountRef.current = 0
        lastEventAtRef.current = Date.now()
        setPhase('ready')
    }

    return (
        <div className="mobile">
            {phase === 'idle' && (
                <>
                    <p className="mobile__code">{code}</p>
                    <button className="mobile__btn" onClick={start}>ПОИХАЛИ</button>
                </>
            )}

            {phase === 'ready' && (
                <>
                    <p className="mobile__text">DISCIPLINE (тряси телефон, устанешь не тряси)</p>
                    <div
                        className="mobile__orb"
                        style={{ transform: `scale(${1 + Math.min(force, 30) / 30})` }}
                    />
                    <p className="mobile__num">{force.toFixed(1)}</p>
                </>
            )}

            {phase === 'denied' && (
                <p className="mobile__text">
                    доступ к датчикам запрещен(<br />
                </p>
            )}

            {phase === 'unsupported' && (
                <p className="mobile__text">Устройство не поддерживает(</p>
            )}

            {debug && <p className="mobile__debug">{debug}</p>}
        </div>
    )
}