import { useEffect, useRef } from 'react'
import type { Item } from './casino.ts'
import styles from './StoryQuest.module.css'

type Props = {
    cats: Item[]
}

type Mode = 'walk' | 'sit' | 'groom' | 'stretch'

type Cat = {
    id: string
    color: string
    stripe: string
    x: number
    y: number
    dir: 1 | -1
    mode: Mode
    modeLeft: number
    step: number
    tail: number
    blink: number
    scale: number
    spawn: number
}

const SPEED = 0.55
const FLOOR_OFFSET = 70

function nextMode(): Mode {
    const r = Math.random()
    if (r < 0.5) return 'walk'
    if (r < 0.72) return 'sit'
    if (r < 0.9) return 'groom'
    return 'stretch'
}

function modeDuration(mode: Mode): number {
    if (mode === 'walk') return 180 + Math.random() * 400
    if (mode === 'sit') return 120 + Math.random() * 300
    if (mode === 'groom') return 150 + Math.random() * 200
    return 70 + Math.random() * 60
}

export default function CatCanvas({ cats }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const catsRef = useRef<Cat[]>([])
    const rafRef = useRef(0)

    useEffect(() => {
        const existing = new Map(catsRef.current.map(c => [c.id, c]))
        const floor = window.innerHeight - FLOOR_OFFSET

        catsRef.current = cats.map((item, i) => {
            const found = existing.get(item.id)
            if (found) return found
            return {
                id: item.id,
                color: item.color ?? '#9C8FB8',
                stripe: item.stripe ?? '#5C5175',
                x: 140 + i * 240 + Math.random() * 90,
                y: floor,
                dir: Math.random() < 0.5 ? 1 : -1,
                mode: 'walk',
                modeLeft: modeDuration('walk'),
                step: Math.random() * 100,
                tail: Math.random() * 100,
                blink: 0,
                scale: 1 + i * 0.05,
                spawn: 0,
            }
        })
    }, [cats])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            const dpr = Math.min(2, window.devicePixelRatio || 1)
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerHeight}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        resize()
        window.addEventListener('resize', resize)

        const drawCat = (c: Cat) => {
            const s = c.scale * Math.min(1, c.spawn / 20)
            if (s <= 0.01) return

            const bob = c.mode === 'walk' ? Math.sin(c.step * 0.22) * 1.6 : 0
            const sitting = c.mode === 'sit' || c.mode === 'groom'

            ctx.save()
            ctx.translate(c.x, c.y + bob)
            ctx.scale(c.dir * s, s)

            ctx.globalAlpha = 0.25
            ctx.fillStyle = '#000'
            ctx.beginPath()
            ctx.ellipse(0, 20, 26, 6, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1

            const tailWag = Math.sin(c.tail * 0.08) * (sitting ? 0.35 : 0.6)
            ctx.strokeStyle = c.color
            ctx.lineWidth = 6
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(-20, 4)
            ctx.quadraticCurveTo(-36, -6 + tailWag * 14, -30, -24 + tailWag * 10)
            ctx.stroke()

            if (!sitting) {
                const legPhase = c.step * 0.22
                ctx.strokeStyle = c.stripe
                ctx.lineWidth = 4
                for (let i = 0; i < 4; i++) {
                    const lx = -12 + i * 9
                    const swing = Math.sin(legPhase + i * 1.6) * 4
                    ctx.beginPath()
                    ctx.moveTo(lx, 8)
                    ctx.lineTo(lx + swing, 19)
                    ctx.stroke()
                }
            }

            ctx.fillStyle = c.color
            ctx.beginPath()
            if (sitting) ctx.ellipse(-2, 4, 17, 15, 0, 0, Math.PI * 2)
            else ctx.ellipse(-2, 2, 22, 12, 0, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = c.stripe
            ctx.lineWidth = 2.5
            for (let i = 0; i < 3; i++) {
                const sx = -10 + i * 9
                ctx.beginPath()
                ctx.moveTo(sx, sitting ? -6 : -7)
                ctx.lineTo(sx + 2, sitting ? 4 : 2)
                ctx.stroke()
            }

            const headX = sitting ? 14 : 18
            const headY = sitting ? -12 : -6
            const groomTilt = c.mode === 'groom' ? Math.sin(c.step * 0.3) * 0.25 : 0

            ctx.save()
            ctx.translate(headX, headY)
            ctx.rotate(groomTilt)

            ctx.fillStyle = c.color
            ctx.beginPath()
            ctx.arc(0, 0, 11, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.moveTo(-8, -7)
            ctx.lineTo(-10, -17)
            ctx.lineTo(-1, -10)
            ctx.closePath()
            ctx.moveTo(8, -7)
            ctx.lineTo(10, -17)
            ctx.lineTo(1, -10)
            ctx.closePath()
            ctx.fill()

            ctx.fillStyle = '#241a12'
            const eyeH = c.blink > 0 ? 0.6 : 2.4
            ctx.beginPath()
            ctx.ellipse(-4, -1, 1.8, eyeH, 0, 0, Math.PI * 2)
            ctx.ellipse(4, -1, 1.8, eyeH, 0, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = '#e8a33d'
            ctx.beginPath()
            ctx.moveTo(0, 3)
            ctx.lineTo(-2.5, 5.5)
            ctx.lineTo(2.5, 5.5)
            ctx.closePath()
            ctx.fill()

            ctx.restore()
            ctx.restore()
        }

        const tick = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
            const floor = window.innerHeight - FLOOR_OFFSET

            catsRef.current.forEach(c => {
                if (c.spawn < 20) c.spawn += 1
                c.tail += 1
                c.blink = c.blink > 0 ? c.blink - 1 : Math.random() < 0.006 ? 8 : 0
                c.modeLeft -= 1

                if (c.modeLeft <= 0) {
                    c.mode = nextMode()
                    c.modeLeft = modeDuration(c.mode)
                    if (c.mode === 'walk' && Math.random() < 0.45) {
                        c.dir = c.dir === 1 ? -1 : 1
                    }
                }

                if (c.mode === 'walk') {
                    c.step += 1
                    c.x += SPEED * c.dir
                    if (c.x < 60) { c.x = 60; c.dir = 1 }
                    if (c.x > window.innerWidth - 60) {
                        c.x = window.innerWidth - 60
                        c.dir = -1
                    }
                } else if (c.mode === 'groom') {
                    c.step += 1
                }

                c.y += (floor - c.y) * 0.08
                drawCat(c)
            })

            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(rafRef.current)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return <canvas ref={canvasRef} className={styles.catCanvas} />
}