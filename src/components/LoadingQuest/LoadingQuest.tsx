import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import LoadingBar, { SLOT_COUNT } from './LoadingBar.tsx'
import FinalCards from './FinalCards.tsx'
import { useLoadingBlocks } from './useLoadingBlocks.ts'
import { buildFinalCards } from './finalCards.ts'
import { useQuestProgress } from '../../api/useQuestProgress.ts'
import styles from './LoadingQuest.module.css'

type Stage = 'loading' | 'collect' | 'result'

export default function LoadingQuest() {
    const { progress, state, saving, saveError, submit, isDone } = useQuestProgress('loading')

    const [stage, setStage] = useState<Stage>('loading')
    const [slots, setSlots] = useState<boolean[]>(() => Array(SLOT_COUNT).fill(false))
    const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)

    const { blocks, explode, grab, moveTo, release, remove } = useLoadingBlocks()

    const slotRefs = useRef<(HTMLSpanElement | null)[]>([])
    const slotsRef = useRef<boolean[]>(Array(SLOT_COUNT).fill(false))
    const dragRef = useRef<{
        id: number
        lastX: number
        lastY: number
        vx: number
        vy: number
    } | null>(null)

    const cards = useMemo(() => buildFinalCards(progress), [progress])

    useEffect(() => {
        if (isDone && stage !== 'result') setStage('result')
    }, [isDone, stage])

    const setSlotRef = useCallback((i: number, el: HTMLSpanElement | null) => {
        slotRefs.current[i] = el
    }, [])

    const handleExplode = useCallback(
        (x: number, y: number) => {
            explode(SLOT_COUNT, x, y)
            setStage('collect')
        },
        [explode]
    )

    const findSlotAt = (x: number, y: number): number | null => {
        for (let i = 0; i < SLOT_COUNT; i++) {
            if (slotsRef.current[i]) continue
            const el = slotRefs.current[i]
            if (!el) continue
            const r = el.getBoundingClientRect()
            const pad = 14
            if (
                x >= r.left - pad &&
                x <= r.right + pad &&
                y >= r.top - pad &&
                y <= r.bottom + pad
            ) {
                return i
            }
        }
        return null
    }

    const onPointerDown = (e: React.PointerEvent, id: number) => {
        e.preventDefault()
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        grab(id)
        dragRef.current = { id, lastX: e.clientX, lastY: e.clientY, vx: 0, vy: 0 }
    }

    const onPointerMove = (e: React.PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        moveTo(d.id, e.clientX, e.clientY)
        d.vx = (e.clientX - d.lastX) * 0.5
        d.vy = (e.clientY - d.lastY) * 0.5
        d.lastX = e.clientX
        d.lastY = e.clientY
        setHoveredSlot(findSlotAt(e.clientX, e.clientY))
    }

    const onPointerUp = (e: React.PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        dragRef.current = null
        setHoveredSlot(null)

        const slot = findSlotAt(e.clientX, e.clientY)
        if (slot === null) {
            release(d.id, d.vx, d.vy)
            return
        }

        remove(d.id)
        slotsRef.current[slot] = true
        const next = [...slotsRef.current]
        setSlots(next)

        if (next.every(Boolean)) {
            window.setTimeout(() => setStage('result'), 900)
        }
    }

    const handleAllSeen = useCallback(() => {
        if (isDone) return
        submit({ seenAt: new Date().toISOString(), cards: cards.length })
    }, [cards.length, isDone, submit])

    return (
        <QuestShell
            status={stage === 'result' ? 'done' : 'todo'}
            state={state}
            saving={saving}
            saveError={saveError}
        >
            {stage !== 'result' && (
                <LoadingBar
                    phase={stage === 'loading' ? 'loading' : 'collect'}
                    slots={slots}
                    hoveredSlot={hoveredSlot}
                    onSlotRef={setSlotRef}
                    onExplode={handleExplode}
                />
            )}

            {stage === 'collect' && (
                <div className={styles.blocksLayer}>
                    {blocks.map(b => (
                        <div
                            key={b.id}
                            className={`${styles.block} ${b.held ? styles.blockHeld : ''}`}
                            style={{
                                left: b.x,
                                top: b.y,
                                transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
                            }}
                            onPointerDown={e => onPointerDown(e, b.id)}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                        />
                    ))}
                </div>
            )}

            {stage === 'result' && <FinalCards cards={cards} onAllSeen={handleAllSeen} />}
        </QuestShell>
    )
}