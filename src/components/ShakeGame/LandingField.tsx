import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import Matter from 'matter-js'
import { CRATE_NEW_TYPE, CRATE_LANDED_TYPE } from './dnd.ts'

export type LandingFieldHandle = {
    removeCrate: (crateId: string) => void
    clearAll: () => void
}

type Props = {
    onCrateArrived: (crateId: string) => void
}

const LandingField = forwardRef<LandingFieldHandle, Props>(({ onCrateArrived }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef(Matter.Engine.create())
    const bodiesRef = useRef<Record<string, Matter.Body>>({})
    const elsRef = useRef<Record<string, HTMLDivElement>>({})

    useEffect(() => {
        const engine = engineRef.current
        engine.gravity.y = 1
        const width = window.innerWidth
        const height = window.innerHeight
        const ground = Matter.Bodies.rectangle(width / 2, height + 20, width * 2, 40, { isStatic: true })
        const wallL = Matter.Bodies.rectangle(-20, height / 2, 40, height * 2, { isStatic: true })
        const wallR = Matter.Bodies.rectangle(width + 20, height / 2, 40, height * 2, { isStatic: true })
        Matter.World.add(engine.world, [ground, wallL, wallR])

        let raf = 0
        const loop = () => {
            Matter.Engine.update(engine, 1000 / 60)
            for (const id in bodiesRef.current) {
                const body = bodiesRef.current[id]
                const node = elsRef.current[id]
                if (!node) continue
                node.style.transform = `translate(${body.position.x - 24}px, ${body.position.y - 24}px) rotate(${body.angle}rad)`
            }
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [])

    const spawnAt = (crateId: string, clientX: number, clientY: number) => {
        const margin = 60
        const floorMargin = 150
        const safeX = Math.min(Math.max(clientX, margin), window.innerWidth - margin)
        const safeY = Math.min(clientY, window.innerHeight - floorMargin)

        const body = Matter.Bodies.rectangle(safeX, safeY, 48, 48, { restitution: 0.35, friction: 0.4 })
        Matter.World.add(engineRef.current.world, body)
        bodiesRef.current[crateId] = body

        const node = document.createElement('div')
        node.className = 'crate crate--duck'
        node.textContent = '🦆'
        node.draggable = true
        node.addEventListener('dragstart', e => {
            e.dataTransfer?.setData(CRATE_LANDED_TYPE, crateId)
            if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
            Matter.World.remove(engineRef.current.world, body)
        })
        containerRef.current?.appendChild(node)
        elsRef.current[crateId] = node
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const crateId = e.dataTransfer.getData(CRATE_NEW_TYPE)
        if (!crateId) return
        onCrateArrived(crateId)
        spawnAt(crateId, e.clientX, e.clientY)
    }

    useImperativeHandle(ref, () => ({
        removeCrate: (crateId: string) => {
            const body = bodiesRef.current[crateId]
            if (body) Matter.World.remove(engineRef.current.world, body)
            delete bodiesRef.current[crateId]
            elsRef.current[crateId]?.remove()
            delete elsRef.current[crateId]
        },
        clearAll: () => {
            Object.values(bodiesRef.current).forEach(body => Matter.World.remove(engineRef.current.world, body))
            Object.values(elsRef.current).forEach(el => el.remove())
            bodiesRef.current = {}
            elsRef.current = {}
        }
    }))

    return (
        <div
            ref={containerRef}
            className="landing-field"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
        />
    )
})

export default LandingField