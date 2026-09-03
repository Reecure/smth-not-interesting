import { useEffect, useRef, useState } from 'react'
import { createHub } from '../../lib/hub.ts'
import type { HubConnection } from '@microsoft/signalr'

export function usePeerStatus(code: string) {
    const [connected, setConnected] = useState(false)
    const [peer, setPeer] = useState(false)
    const hubRef = useRef<HubConnection | null>(null)

    useEffect(() => {
        if (!code) return
        const hub = createHub()
        hubRef.current = hub

        hub.on('peerJoined', (joinedConnectionId: string) => {
            if (joinedConnectionId !== hub.connectionId) setPeer(true)
        })

        hub.start()
            .then(() => { setConnected(true); return hub.invoke('JoinRoom', code) })
            .catch(console.error)

        return () => { hub.stop() }
    }, [code])

    return { connected, peer }
}