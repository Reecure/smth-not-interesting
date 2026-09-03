import { useEffect, useRef } from 'react'
import styles from './LetterGame.module.css'
import { WORD_FONT, WORD_PADDING } from './measureText'

type Props = {
    text: string
    width: number
    onDone: () => void
}

const HEIGHT = 26
const DURATION = 750

export default function BurnWord({ text, width, onDone }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const startedRef = useRef(false)
    const doneFiredRef = useRef(false)

    const finish = () => {
        if (doneFiredRef.current) return
        doneFiredRef.current = true
        onDone()
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = HEIGHT * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${HEIGHT}px`
        const ctx = canvas.getContext('2d')!
        ctx.scale(dpr, dpr)
        ctx.font = WORD_FONT
        ctx.fillStyle = '#A78BFA'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, WORD_PADDING, HEIGHT / 2)
    }, [width, text])

    useEffect(() => {
        if (startedRef.current || !width) return
        startedRef.current = true

        const failsafe = window.setTimeout(finish, DURATION + 650)

        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        const dpr = window.devicePixelRatio || 1

        const seeds = Array.from({ length: 5 }, () => ({
            x: Math.random() * width,
            y: HEIGHT / 2 + (Math.random() - 0.5) * 10,
            speed: 16 + Math.random() * 12
        }))

        const embers: { x: number; y: number; vy: number; life: number }[] = []
        const start = performance.now()

        const loop = (now: number) => {
            const t = now - start
            const progress = Math.min(1, t / DURATION)

            ctx.save()
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, width, HEIGHT)
            ctx.font = WORD_FONT
            ctx.fillStyle = '#A78BFA'
            ctx.textBaseline = 'middle'
            ctx.fillText(text, WORD_PADDING, HEIGHT / 2)

            seeds.forEach(s => {
                const r = progress * s.speed
                if (Math.random() < 0.25) {
                    embers.push({ x: s.x, y: s.y - r * 0.3, vy: -0.4 - Math.random() * 0.6, life: 1 })
                }

                const rim = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r + 7)
                rim.addColorStop(0, 'rgba(20,10,5,0)')
                rim.addColorStop(0.72, 'rgba(45,22,8,0.6)')
                rim.addColorStop(1, 'rgba(0,0,0,0)')
                ctx.globalCompositeOperation = 'source-over'
                ctx.fillStyle = rim
                ctx.beginPath()
                ctx.arc(s.x, s.y, r + 7, 0, Math.PI * 2)
                ctx.fill()

                ctx.globalCompositeOperation = 'destination-out'
                ctx.beginPath()
                ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
                ctx.fill()
            })

            ctx.globalCompositeOperation = 'source-over'
            for (let i = embers.length - 1; i >= 0; i--) {
                const e = embers[i]
                e.y += e.vy
                e.life -= 0.035
                if (e.life <= 0) { embers.splice(i, 1); continue }
                ctx.fillStyle = `rgba(252,180,60,${e.life})`
                ctx.beginPath()
                ctx.arc(e.x, e.y, 1.3, 0, Math.PI * 2)
                ctx.fill()
            }

            ctx.restore()

            if (progress < 1) {
                requestAnimationFrame(loop)
            } else {
                clearTimeout(failsafe)
                finish()
            }
        }

        requestAnimationFrame(loop)
    }, [width, text, onDone])

    return <canvas ref={canvasRef} className={styles.burnCanvas} style={{ width, height: HEIGHT }} />
}