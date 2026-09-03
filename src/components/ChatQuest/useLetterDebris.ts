import { useEffect, useRef, useState } from 'react'

export type DebrisLetter = {
    id: number
    char: string
    x: number
    y: number
    vx: number
    vy: number
    rot: number
    vrot: number
    settled: boolean
}

type SpawnOptions = {
    spreadX?: number
    speedY?: number
}

let seq = 0

export function useLetterDebris() {
    const [letters, setLetters] = useState<DebrisLetter[]>([])
    const lettersRef = useRef<DebrisLetter[]>([])

    useEffect(() => {
        let raf = 0
        const loop = () => {
            const floor = window.innerHeight - 20
            let changed = false
            lettersRef.current.forEach(l => {
                if (l.settled) return
                l.vy += 0.6
                l.x += l.vx
                l.y += l.vy
                l.rot += l.vrot
                if (l.y >= floor) {
                    l.y = floor
                    l.vy *= -0.35
                    l.vx *= 0.7
                    if (Math.abs(l.vy) < 0.6) {
                        l.vy = 0
                        l.settled = true
                    }
                }
                changed = true
            })
            if (changed) setLetters([...lettersRef.current])
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [])

    const spawn = (text: string, originX: number, originY: number, opts?: SpawnOptions) => {
        const spreadX = opts?.spreadX ?? 4
        const speedY = opts?.speedY ?? 2.5
        const next: DebrisLetter[] = text.split('').map((char, i) => ({
            id: seq++,
            char,
            x: originX + i * 8,
            y: originY,
            vx: (Math.random() - 0.5) * spreadX,
            vy: -speedY - Math.random() * speedY,
            rot: 0,
            vrot: (Math.random() - 0.5) * 16,
            settled: false
        }))
        lettersRef.current = [...lettersRef.current, ...next]
        setLetters([...lettersRef.current])
    }

    return { letters, spawn }
}