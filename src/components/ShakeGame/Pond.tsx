import { useState } from 'react'
import { CRATE_LANDED_TYPE } from './dnd'
import type { DuckSeed } from './duckSeed'

type Props = {
    ducks: DuckSeed[]
    total: number
    complete: boolean
    onDropCrate: (crateId: string) => void
}

const FROG_SPOTS = [
    { left: '4%', bottom: '2%' },
    { left: '92%', bottom: '4%' }
]

export default function Pond({ ducks, total, complete, onDropCrate }: Props) {
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
    const [croaking, setCroaking] = useState<Record<number, boolean>>({})

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const crateId = e.dataTransfer.getData(CRATE_LANDED_TYPE)
        if (crateId) onDropCrate(crateId)
    }

    const toggleDuck = (id: string) => {
        if (!complete) return
        setHiddenIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const croak = (i: number) => {
        setCroaking(c => ({ ...c, [i]: true }))
        setTimeout(() => setCroaking(c => ({ ...c, [i]: false })), 1200)
    }

    const visibleCount = ducks.length - (complete ? hiddenIds.size : 0)

    return (
        <>
            <div
                className="pond"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
            >
                <div className="pond__ring pond__ring--outer" />
                <div className="pond__ring pond__ring--inner" />

                {ducks.map(duck => {
                    const hidden = complete && hiddenIds.has(duck.id)
                    return (
                        <div
                            key={duck.id}
                            className={`duck ${complete ? 'duck--clickable' : ''}`}
                            style={{
                                left: `${duck.x}%`,
                                top: `${duck.y}%`,
                                animationDuration: `${duck.dur}s`,
                                animationDelay: `${duck.delay}s`,
                                ['--amp' as string]: `${duck.amp}px`
                            }}
                            onClick={() => toggleDuck(duck.id)}
                        >
                            {!hidden && <span className="duck__ripple" style={{ animationDelay: `${duck.delay}s` }} />}
                            <div
                                className="duck__body"
                                style={{
                                    transform: `scaleX(${duck.flip ? -1 : 1}) scale(${hidden ? 0.15 : 1})`,
                                    opacity: hidden ? 0 : 1
                                }}
                            >
                                <span className="duck__belly" />
                                <span className="duck__tail" />
                                <span className="duck__head" />
                                <span className="duck__beak" />
                                <span className="duck__eye" />
                            </div>
                            {hidden && <span className="duck__ghost" />}
                        </div>
                    )
                })}

                {FROG_SPOTS.map((spot, i) => (
                    <button
                        key={i}
                        className="frog"
                        style={spot}
                        onClick={() => croak(i)}
                        aria-label="лягушка"
                    >
                        🐸
                        {croaking[i] && <span className="frog__bubble">ква</span>}
                    </button>
                ))}

                <span className="firefly firefly--a" />
                <span className="firefly firefly--b" />
                <span className="firefly firefly--c" />
            </div>

            <div className="pond-tray">
                <div className="pond-tray__badges">
                    {Array.from({ length: total }).map((_, i) => (
                        <span key={i} className={`pond-tray__badge ${i < visibleCount ? 'pond-tray__badge--filled' : ''}`} />
                    ))}
                </div>
                <p className="pond-tray__count">{visibleCount}/{total}</p>
            </div>

            {complete && visibleCount === total && <p className="pond__done">все уточки на месте</p>}
        </>
    )
}