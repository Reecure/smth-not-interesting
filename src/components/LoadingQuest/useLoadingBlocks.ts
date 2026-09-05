import { useEffect, useRef, useState } from 'react'

export type LoadingBlock = {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    rot: number
    vrot: number
    settled: boolean
    held: boolean
}

const GRAVITY = 0.7
const BOUNCE = 0.42
const FRICTION = 0.72
const FLOOR_OFFSET = 90
const HALF_W = 23

export function useLoadingBlocks() {
    const [blocks, setBlocks] = useState<LoadingBlock[]>([])
    const blocksRef = useRef<LoadingBlock[]>([])

    useEffect(() => {
        let raf = 0
        const loop = () => {
            const floor = window.innerHeight - FLOOR_OFFSET
            const left = HALF_W
            const right = window.innerWidth - HALF_W
            let moving = false

            blocksRef.current.forEach(b => {
                if (b.held || b.settled) return

                b.vy += GRAVITY
                b.x += b.vx
                b.y += b.vy
                b.rot += b.vrot

                if (b.x < left) { b.x = left; b.vx *= -0.5 }
                if (b.x > right) { b.x = right; b.vx *= -0.5 }

                if (b.y >= floor) {
                    b.y = floor
                    b.vy *= -BOUNCE
                    b.vx *= FRICTION
                    b.vrot *= FRICTION
                    if (Math.abs(b.vy) < 0.8) {
                        b.vy = 0
                        b.vrot = 0
                        b.settled = true
                    }
                }
                moving = true
            })

            if (moving) setBlocks([...blocksRef.current])
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [])

    const sync = () => setBlocks([...blocksRef.current])

    const explode = (count: number, originX: number, originY: number) => {
        blocksRef.current = Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            x: originX + (Math.random() - 0.5) * 120,
            y: originY,
            vx: (Math.random() - 0.5) * 16,
            vy: -7 - Math.random() * 6,
            rot: 0,
            vrot: (Math.random() - 0.5) * 16,
            settled: false,
            held: false,
        }))
        sync()
    }

    const grab = (id: number) => {
        const b = blocksRef.current.find(x => x.id === id)
        if (!b) return
        b.held = true
        b.settled = false
        b.vx = 0
        b.vy = 0
        b.vrot = 0
        sync()
    }

    const moveTo = (id: number, x: number, y: number) => {
        const b = blocksRef.current.find(x2 => x2.id === id)
        if (!b) return
        const prevX = b.x
        b.x = x
        b.y = y
        b.rot += (x - prevX) * 0.12
        sync()
    }

    const release = (id: number, vx: number, vy: number) => {
        const b = blocksRef.current.find(x => x.id === id)
        if (!b) return
        b.held = false
        b.settled = false
        b.vx = Math.max(-22, Math.min(22, vx))
        b.vy = Math.max(-22, Math.min(22, vy))
        b.vrot = vx * 0.5
        sync()
    }

    const remove = (id: number) => {
        blocksRef.current = blocksRef.current.filter(b => b.id !== id)
        sync()
    }

    return { blocks, explode, grab, moveTo, release, remove }
}