import { useEffect, useRef, useState } from 'react'
import { createHub } from '../../lib/hub.ts'
import type { HubConnection } from '@microsoft/signalr'

const TARGET = 100
const GAIN = 0.045
const DECAY_PER_SEC = 4
const AMP_GAIN = 0.4
const AMP_MAX = 26
const AMP_DECAY = 0.06

type Options = {
    code: string
    total: number
    onSpawn: (index: number) => void
    active: boolean
}

export function useShakeProgress({ code, total, onSpawn, active }: Options) {
    const [connected, setConnected] = useState(false)
    const [peer, setPeer] = useState(false)
    const [progress, setProgress] = useState(0)
    const [amp, setAmp] = useState(0)
    const [peak, setPeak] = useState(0)
    const [spawned, setSpawned] = useState(0)

    const hubRef = useRef<HubConnection | null>(null)
    const progressRef = useRef(0)
    const ampRef = useRef(0)
    const spawnedRef = useRef(0)
    const onSpawnRef = useRef(onSpawn)
    onSpawnRef.current = onSpawn

    useEffect(() => {
        if (!code || !active) return

        const hub = createHub()
        hubRef.current = hub
        const step = TARGET / total

        hub.on('peerJoined', (joinedId: string) => {
            if (joinedId !== hub.connectionId) setPeer(true)
        })

        hub.on('shake', (force: number) => {
            const f = Math.min(force, 80)
            ampRef.current = Math.min(AMP_MAX, ampRef.current + f * AMP_GAIN)
            progressRef.current = Math.min(TARGET, progressRef.current + f * GAIN)
            setPeak(p => Math.max(p, Math.round(force)))

            const should = Math.min(total, Math.floor(progressRef.current / step))
            while (spawnedRef.current < should) {
                onSpawnRef.current(spawnedRef.current)
                spawnedRef.current += 1
                setSpawned(spawnedRef.current)
            }
        })

        hub.start()
            .then(() => { setConnected(true); return hub.invoke('JoinRoom', code) })
            .catch(console.error)

        return () => { hub.stop() }
    }, [code, total, active])

    useEffect(() => {
        if (!active) return
        let raf = 0
        let last = performance.now()

        const loop = (now: number) => {
            const dt = (now - last) / 1000
            last = now

            ampRef.current = Math.max(0, ampRef.current - ampRef.current * AMP_DECAY * 60 * dt)
            if (spawnedRef.current < total) {
                progressRef.current = Math.max(0, progressRef.current - DECAY_PER_SEC * dt)
            }

            setAmp(ampRef.current)
            setProgress(progressRef.current)
            raf = requestAnimationFrame(loop)
        }

        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [active, total])

    const reset = () => {
        progressRef.current = 0
        ampRef.current = 0
        spawnedRef.current = 0
        setProgress(0)
        setAmp(0)
        setSpawned(0)
        setPeak(0)
    }

    return { connected, peer, progress, amp, peak, spawned, reset }
}