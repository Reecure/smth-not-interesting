import { useEffect, useRef, useState } from 'react'
import styles from './LoadingQuest.module.css'

type Props = {
    onExplode: () => void
}

const SEGMENT_SCRIPT: { at: number; delay: number; text: string }[] = [
    { at: 1, delay: 300, text: 'загружаемся...' },
    { at: 2, delay: 300, text: 'собираем что вы забыли' },
    { at: 3, delay: 1600, text: 'почти...' },
    { at: 2, delay: 500, text: 'хотя нет' },
    { at: 4, delay: 400, text: 'пересчитываем уточек' },
    { at: 5, delay: 400, text: 'проверяем письмо' },
    { at: 6, delay: 700, text: 'сверяем фразу из канала' },
    { at: 7, delay: 500, text: 'вот и всё' }
]

export default function LoadingBar({ onExplode }: Props) {
    const [filled, setFilled] = useState(0)
    const [label, setLabel] = useState('')
    const stepRef = useRef(0)

    useEffect(() => {
        const runStep = () => {
            const step = SEGMENT_SCRIPT[stepRef.current]
            if (!step) {
                window.setTimeout(onExplode, 500)
                return
            }
            window.setTimeout(() => {
                setFilled(step.at)
                setLabel(step.text)
                stepRef.current += 1
                runStep()
            }, step.delay)
        }
        runStep()
    }, [])

    return (
        <div className={styles.loadingWrap}>
            <div className={styles.segments}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className={`${styles.segment} ${i < filled ? styles.segmentFilled : ''}`} />
                ))}
            </div>
            <p className={styles.loadingLabel}>{label}</p>
        </div>
    )
}