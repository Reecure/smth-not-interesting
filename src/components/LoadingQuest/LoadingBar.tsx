import { useEffect, useRef, useState } from 'react'
import styles from './LoadingQuest.module.css'

export const SLOT_COUNT = 10

type Props = {
    phase: 'loading' | 'collect' | 'done'
    slots: boolean[]
    hoveredSlot: number | null
    onSlotRef: (i: number, el: HTMLSpanElement | null) => void
    onExplode: (originX: number, originY: number) => void
}

const SEGMENT_SCRIPT: { at: number; delay: number; text: string }[] = [
    { at: 1, delay: 300, text: 'загружаемся...' },
    { at: 2, delay: 300, text: 'собираем что вы забыли' },
    { at: 3, delay: 1600, text: 'почти...' },
    { at: 2, delay: 500, text: 'хотя нет' },
    { at: 4, delay: 400, text: 'пересчитываем уточек' },
    { at: 5, delay: 400, text: 'проверяем письмо' },
    { at: 6, delay: 700, text: 'сверяем фразу из канала' },
    { at: 9, delay: 500, text: 'вот и всё' },
    { at: 10, delay: 900, text: 'ой' },
]

export default function LoadingBar({
                                       phase,
                                       slots,
                                       hoveredSlot,
                                       onSlotRef,
                                       onExplode,
                                   }: Props) {
    const [filled, setFilled] = useState(0)
    const [label, setLabel] = useState('')
    const [blast, setBlast] = useState(false)
    const stepRef = useRef(0)
    const barRef = useRef<HTMLDivElement>(null)
    const firedRef = useRef(false)

    useEffect(() => {
        if (phase !== 'loading') return

        let timer = 0
        const runStep = () => {
            const step = SEGMENT_SCRIPT[stepRef.current]
            if (!step) {
                timer = window.setTimeout(() => {
                    if (firedRef.current) return
                    firedRef.current = true
                    setBlast(true)
                    setFilled(0)
                    setLabel('всё рассыпалось')
                    const rect = barRef.current?.getBoundingClientRect()
                    onExplode(
                        rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
                        rect ? rect.top + rect.height / 2 : 200
                    )
                    window.setTimeout(() => setBlast(false), 600)
                }, 500)
                return
            }
            timer = window.setTimeout(() => {
                setFilled(step.at)
                setLabel(step.text)
                stepRef.current += 1
                runStep()
            }, step.delay)
        }
        runStep()

        return () => window.clearTimeout(timer)
    }, [phase, onExplode])

    const placed = slots.filter(Boolean).length

    return (
        <div className={styles.loadingWrap}>
            <div
                ref={barRef}
                className={`${styles.segments} ${blast ? styles.segmentsBlast : ''} ${
                    phase !== 'loading' ? styles.segmentsOpen : ''
                }`}
            >
                {Array.from({ length: SLOT_COUNT }).map((_, i) => {
                    const isLoadingFill = phase === 'loading' && i < filled
                    const isSlotFilled = phase !== 'loading' && slots[i]
                    const isHovered = hoveredSlot === i

                    return (
                        <span
                            key={i}
                            ref={el => onSlotRef(i, el)}
                            className={[
                                styles.segment,
                                isLoadingFill ? styles.segmentFilled : '',
                                phase !== 'loading' && !slots[i] ? styles.segmentEmpty : '',
                                isSlotFilled ? styles.segmentPlaced : '',
                                isHovered ? styles.segmentHovered : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        />
                    )
                })}
            </div>

            <p className={styles.loadingLabel}>
                {phase === 'loading' && label}
                {phase === 'collect' && `верни блоки на место — ${placed}/${SLOT_COUNT}`}
                {phase === 'done' && 'собрано'}
            </p>
        </div>
    )
}