import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './TelegramQuest.module.css'
import planeSrc from '../../assets/tg/tg.svg'
import towerSrc from '../../assets/tg/tower.svg'
import catSrc from '../../assets/tg/cat.gif'

type PlaneState = 'flying' | 'launched'

type Launch = {
    x: number
    y: number
    dx: number
    dy: number
    angle: number
    fly: number
}

type Plane = {
    id: number
    key: number
    top: number
    delay: number
    duration: number
    size: number
    state: PlaneState
    launch?: Launch
}

const COUNT = 14
const CAT_STAY_MS = 2600

const CAT_LINES = [
    'НЕ ПОНЯЛ',
    'мяу',
    'за что?',
    'башня не виновата',
    'ещё раз?',
    'хватит уже',
]

function seed(id: number, key: number): Plane {
    return {
        id,
        key,
        top: 4 + ((id * 13.7) % 88),
        delay: -((id * 3.1) % 18),
        duration: 14 + ((id * 2.3) % 12),
        size: 26 + ((id * 7) % 22),
        state: 'flying',
    }
}

type Props = {
    onHit?: (total: number) => void
}

export default function PaperPlanes({ onHit }: Props) {
    const [planes, setPlanes] = useState<Plane[]>(() =>
        Array.from({ length: COUNT }, (_, i) => seed(i, i))
    )
    const [ripples, setRipples] = useState<number[]>([])
    const [towerShake, setTowerShake] = useState(false)
    const [catVisible, setCatVisible] = useState(false)
    const [catLine, setCatLine] = useState('')

    const towerRef = useRef<HTMLDivElement>(null)
    const keyRef = useRef(COUNT)
    const hitsRef = useRef(0)
    const catTimerRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        return () => {
            if (catTimerRef.current) window.clearTimeout(catTimerRef.current)
        }
    }, [])

    const showCat = useCallback((hitCount: number) => {
        setCatLine(CAT_LINES[Math.min(hitCount - 1, CAT_LINES.length - 1)])
        setCatVisible(true)

        if (catTimerRef.current) window.clearTimeout(catTimerRef.current)
        catTimerRef.current = window.setTimeout(() => {
            setCatVisible(false)
        }, CAT_STAY_MS)
    }, [])

    const launch = useCallback((id: number, el: HTMLElement) => {
        const towerEl = towerRef.current
        if (!towerEl) return

        const from = el.getBoundingClientRect()
        const to = towerEl.getBoundingClientRect()

        const fx = from.left + from.width / 2
        const fy = from.top + from.height / 2
        const tx = to.left + to.width / 2
        const ty = to.top + to.height / 2

        const dx = tx - fx
        const dy = ty - fy
        const dist = Math.hypot(dx, dy)
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI
        const fly = Math.min(1400, Math.max(420, dist * 1.15))

        setPlanes(prev =>
            prev.map(p =>
                p.id === id
                    ? {
                        ...p,
                        state: 'launched',
                        launch: { x: from.left, y: from.top, dx, dy, angle, fly },
                    }
                    : p
            )
        )
    }, [])

    const handleImpact = useCallback(
        (id: number) => {
            hitsRef.current += 1
            onHit?.(hitsRef.current)
            showCat(hitsRef.current)

            const rippleId = Date.now() + id
            setRipples(r => [...r, rippleId])
            setTowerShake(true)
            window.setTimeout(() => setTowerShake(false), 420)
            window.setTimeout(
                () => setRipples(r => r.filter(x => x !== rippleId)),
                900
            )

            window.setTimeout(() => {
                keyRef.current += 1
                setPlanes(prev =>
                    prev.map(p =>
                        p.id === id
                            ? { ...seed(id, keyRef.current), delay: 0, top: 4 + Math.random() * 86 }
                            : p
                    )
                )
            }, 700)
        },
        [onHit, showCat]
    )

    return (
        <div className={styles.planes}>
            {planes.map(p =>
                p.state === 'flying' ? (
                    <span
                        key={p.key}
                        className={styles.plane}
                        style={{
                            top: `${p.top}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                        onClick={e => launch(p.id, e.currentTarget)}
                        role="button"
                        aria-label="самолётик"
                    >
                        <img
                            className={styles.planeImg}
                            src={planeSrc}
                            alt=""
                            style={{ width: p.size, height: p.size }}
                            draggable={false}
                        />
                    </span>
                ) : (
                    <span
                        key={p.key}
                        className={`${styles.plane} ${styles.planeStrike}`}
                        style={{
                            left: p.launch!.x,
                            top: p.launch!.y,
                            ['--dx' as string]: `${p.launch!.dx}px`,
                            ['--dy' as string]: `${p.launch!.dy}px`,
                            ['--ang' as string]: `${p.launch!.angle}deg`,
                            ['--fly' as string]: `${p.launch!.fly}ms`,
                        }}
                        onAnimationEnd={() => handleImpact(p.id)}
                    >
                        <img
                            className={styles.planeImg}
                            src={planeSrc}
                            alt=""
                            style={{ width: p.size, height: p.size }}
                            draggable={false}
                        />
                    </span>
                )
            )}

            <div
                ref={towerRef}
                className={`${styles.tower} ${towerShake ? styles.towerHit : ''}`}
            >
                <img className={styles.towerImg} src={towerSrc} alt="" draggable={false} />
                {ripples.map(id => (
                    <span key={id} className={styles.towerRipple} />
                ))}
                {ripples.map(id => (
                    <span key={`s-${id}`} className={styles.towerSpark} />
                ))}
            </div>

            <div className={styles.tower2}>
                <img className={styles.towerImg} src={towerSrc} alt="" draggable={false} />
            </div>

            <div className={`${styles.cat} ${catVisible ? styles.catIn : ''}`}>
                {catLine && <span className={styles.catBubble}>{catLine}</span>}
                <img className={styles.catImg} src={catSrc} alt="" draggable={false} />
            </div>
        </div>
    )
}