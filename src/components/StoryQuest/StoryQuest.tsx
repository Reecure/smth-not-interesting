import { useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import SlotColumn from './SlotColumn.tsx'
import { storySlots } from './storySlots.ts'
import { submitAnswer } from '../../api/questApi.ts'
import styles from './StoryQuest.module.css'

const QUEST_ID = 'story'
const SPIN_TICKS = 12
const SPIN_TICK_MS = 90

export default function StoryQuest() {
    const [selections, setSelections] = useState<Record<string, string | null>>(
        Object.fromEntries(storySlots.map(s => [s.id, null]))
    )
    const [submitted, setSubmitted] = useState(false)
    const [spinning, setSpinning] = useState(false)
    const [spinDisplay, setSpinDisplay] = useState<Record<string, string>>({})

    const spinTimerRef = useRef<number | null>(null)

    const complete = storySlots.every(s => selections[s.id] !== null)

    const handleSelect = (slotId: string, optionId: string) => {
        if (submitted || spinning) return
        setSelections(prev => ({ ...prev, [slotId]: optionId }))
    }

    const story = storySlots
        .map(s => s.options.find(o => o.id === selections[s.id])?.fragment)
        .filter(Boolean)
        .join(' ')

    const handleConfirm = () => {
        setSpinning(true)
        let ticks = 0

        spinTimerRef.current = window.setInterval(() => {
            ticks += 1
            const next: Record<string, string> = {}
            storySlots.forEach(s => {
                next[s.id] = s.options[Math.floor(Math.random() * s.options.length)].id
            })
            setSpinDisplay(next)

            if (ticks >= SPIN_TICKS) {
                if (spinTimerRef.current) clearInterval(spinTimerRef.current)
                setSpinning(false)
                setSubmitted(true)
                submitAnswer(QUEST_ID, { selections, story })
            }
        }, SPIN_TICK_MS)
    }

    return (
        <QuestShell status={submitted ? 'done' : 'todo'}>
            <div className={styles.slots}>
                {storySlots.map(slot => (
                    <SlotColumn
                        key={slot.id}
                        slot={slot}
                        selectedId={spinning ? spinDisplay[slot.id] ?? null : selections[slot.id]}
                        locked={spinning || submitted}
                        onSelect={optionId => handleSelect(slot.id, optionId)}
                    />
                ))}
            </div>

            {complete && (
                <div className={styles.storyWrap}>
                    <p className={styles.storyText}>
                        {story.charAt(0).toUpperCase() + story.slice(1)}.
                    </p>

                    {!submitted && (
                        <button className="mobile__btn" onClick={handleConfirm} disabled={spinning}>
                            {spinning ? '...' : 'подтвердить'}
                        </button>
                    )}

                    {submitted && <p className={styles.done}>история принята</p>}
                </div>
            )}
        </QuestShell>
    )
}