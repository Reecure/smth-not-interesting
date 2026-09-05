import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import Matter from 'matter-js'

export type LandingFieldHandle = {
    spawnDuck: (index: number) => void
    removeDuck: (id: string) => void
    clearAll: () => void
}

type Props = {
    pondRef: React.RefObject<HTMLDivElement | null>
    onDuckToPond: (id: string) => void
    onDragChange: (dragging: boolean) => void
}

const SIZE = 56
const HALF = SIZE / 2
const FLOOR_OFFSET = 90

const LandingField = forwardRef<LandingFieldHandle, Props>(
    ({ pondRef, onDuckToPond, onDragChange }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const engineRef = useRef(Matter.Engine.create())
        const bodiesRef = useRef<Record<string, Matter.Body>>({})
        const elsRef = useRef<Record<string, HTMLDivElement>>({})
        const dragRef = useRef<{
            id: string
            offsetX: number
            offsetY: number
            lastX: number
            lastY: number
            vx: number
            vy: number
        } | null>(null)

        useEffect(() => {
            const engine = engineRef.current
            engine.gravity.y = 1.1

            const w = window.innerWidth
            const h = window.innerHeight
            const ground = Matter.Bodies.rectangle(
                w / 2, h - FLOOR_OFFSET + 20, w * 2, 40,
                { isStatic: true, restitution: 0.4, friction: 0.6, label: 'ground' }
            )
            const wallL = Matter.Bodies.rectangle(-20, h / 2, 40, h * 3, { isStatic: true, restitution: 0.5 })
            const wallR = Matter.Bodies.rectangle(w + 20, h / 2, 40, h * 3, { isStatic: true, restitution: 0.5 })
            Matter.World.add(engine.world, [ground, wallL, wallR])

            Matter.Events.on(engine, 'collisionStart', evt => {
                for (const pair of evt.pairs) {
                    const body = pair.bodyA.isStatic ? pair.bodyB : pair.bodyA
                    const other = pair.bodyA.isStatic ? pair.bodyA : pair.bodyB
                    if (!other.isStatic) continue
                    const speed = Math.hypot(body.velocity.x, body.velocity.y)
                    if (speed < 3) continue
                    const id = Object.keys(bodiesRef.current).find(k => bodiesRef.current[k] === body)
                    if (!id) continue
                    const el = elsRef.current[id]
                    if (!el) continue
                    el.classList.remove('crate--squash')
                    void el.offsetWidth
                    el.classList.add('crate--squash')
                }
            })

            let raf = 0
            const loop = () => {
                Matter.Engine.update(engine, 1000 / 60)
                for (const id in bodiesRef.current) {
                    const body = bodiesRef.current[id]
                    const node = elsRef.current[id]
                    if (!node) continue
                    node.style.transform =
                        `translate(${body.position.x - HALF}px, ${body.position.y - HALF}px) rotate(${body.angle}rad)`
                }
                raf = requestAnimationFrame(loop)
            }
            raf = requestAnimationFrame(loop)

            const onResize = () => {
                Matter.Body.setPosition(ground, {
                    x: window.innerWidth / 2,
                    y: window.innerHeight - FLOOR_OFFSET + 20,
                })
                Matter.Body.setPosition(wallR, { x: window.innerWidth + 20, y: window.innerHeight / 2 })
            }
            window.addEventListener('resize', onResize)

            return () => {
                cancelAnimationFrame(raf)
                window.removeEventListener('resize', onResize)
                Matter.Events.off(engine, 'collisionStart')
            }
        }, [])

        const dropBody = (id: string) => {
            const body = bodiesRef.current[id]
            if (body) Matter.World.remove(engineRef.current.world, body)
            delete bodiesRef.current[id]
            elsRef.current[id]?.remove()
            delete elsRef.current[id]
        }

        const beginDrag = (e: PointerEvent, id: string) => {
            const body = bodiesRef.current[id]
            const el = elsRef.current[id]
            if (!body || !el) return

            el.setPointerCapture(e.pointerId)
            el.classList.add('crate--dragging')
            Matter.Body.setStatic(body, true)
            Matter.Body.setAngle(body, 0)
            Matter.Body.setAngularVelocity(body, 0)

            dragRef.current = {
                id,
                offsetX: e.clientX - body.position.x,
                offsetY: e.clientY - body.position.y,
                lastX: e.clientX,
                lastY: e.clientY,
                vx: 0,
                vy: 0,
            }
            onDragChange(true)
        }

        const moveDrag = (e: PointerEvent) => {
            const d = dragRef.current
            if (!d) return
            const body = bodiesRef.current[d.id]
            if (!body) return

            const x = e.clientX - d.offsetX
            const y = e.clientY - d.offsetY
            Matter.Body.setPosition(body, { x, y })

            d.vx = (e.clientX - d.lastX) * 0.4
            d.vy = (e.clientY - d.lastY) * 0.4
            d.lastX = e.clientX
            d.lastY = e.clientY
        }

        const endDrag = (e: PointerEvent) => {
            const d = dragRef.current
            if (!d) return
            dragRef.current = null
            onDragChange(false)

            const body = bodiesRef.current[d.id]
            const el = elsRef.current[d.id]
            el?.classList.remove('crate--dragging')
            if (!body) return

            const rect = pondRef.current?.getBoundingClientRect()
            const inPond =
                rect &&
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom

            if (inPond) {
                el?.classList.add('crate--absorb')
                window.setTimeout(() => {
                    dropBody(d.id)
                    onDuckToPond(d.id)
                }, 220)
                return
            }

            Matter.Body.setStatic(body, false)
            Matter.Body.setVelocity(body, {
                x: Math.max(-25, Math.min(25, d.vx)),
                y: Math.max(-25, Math.min(25, d.vy)),
            })
            Matter.Body.setAngularVelocity(body, d.vx * 0.02)
        }

        useImperativeHandle(ref, () => ({
            spawnDuck: (index: number) => {
                const id = `duck-${index}-${Math.random().toString(36).slice(2, 7)}`
                const w = window.innerWidth

                const lanes = [0.18, 0.36, 0.52, 0.68, 0.84]
                const laneX = w * lanes[index % lanes.length] + (Math.random() - 0.5) * 60
                const startY = -80 - Math.random() * 140

                const body = Matter.Bodies.circle(laneX, startY, HALF, {
                    restitution: 0.62,
                    friction: 0.25,
                    frictionAir: 0.008,
                    density: 0.0016,
                })
                Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: 0 })
                Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25)
                Matter.World.add(engineRef.current.world, body)
                bodiesRef.current[id] = body

                const node = document.createElement('div')
                node.className = 'crate crate--duck'
                node.innerHTML = '<span class="crate__glyph">🦆</span>'
                node.style.transform = `translate(${laneX - HALF}px, ${startY - HALF}px)`
                node.addEventListener('pointerdown', ev => {
                    ev.preventDefault()
                    beginDrag(ev, id)
                })
                node.addEventListener('pointermove', moveDrag)
                node.addEventListener('pointerup', endDrag)
                node.addEventListener('pointercancel', endDrag)

                containerRef.current?.appendChild(node)
                elsRef.current[id] = node
            },
            removeDuck: dropBody,
            clearAll: () => {
                Object.keys(bodiesRef.current).forEach(dropBody)
            },
        }))

        return <div ref={containerRef} className="landing-field" />
    }
)

export default LandingField