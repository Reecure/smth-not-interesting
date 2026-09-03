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
}

export function useLoadingBlocks() {
    const [blocks, setBlocks] = useState<LoadingBlock[]>([])
    const blocksRef = useRef<LoadingBlock[]>([])

    useEffect(() => {
        let raf = 0
        const loop = () => {
            const floor = window.innerHeight - 100
            let changed = false
            blocksRef.current.forEach(b => {
                if (b.settled) return
                b.vy += 0.7
                b.x += b.vx
                b.y += b.vy
                b.rot += b.vrot
                if (b.y >= floor) {
                    b.y = floor
                    b.vy *= -0.4
                    b.vx *= 0.7
                    if (Math.abs(b.vy) < 0.7) {
                        b.vy = 0
                        b.settled = true
                    }
                }
                changed = true
            })
            if (changed) setBlocks([...blocksRef.current])
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [])

    const explode = (count: number, originX: number, originY: number) => {
        const next: LoadingBlock[] = Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            x: originX + (Math.random() - 0.5) * 80,
            y: originY,
            vx: (Math.random() - 0.5) * 13,
            vy: -6 - Math.random() * 5,
            rot: 0,
            vrot: (Math.random() - 0.5) * 14,
            settled: false
        }))
        blocksRef.current = next
        setBlocks(next)
    }

    const remove = (id: number) => {
        blocksRef.current = blocksRef.current.filter(b => b.id !== id)
        setBlocks([...blocksRef.current])
    }

    return { blocks, explode, remove }
}