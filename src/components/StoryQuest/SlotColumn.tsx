import { useMemo, useState } from 'react'
import type { StorySlot } from './storySlots.ts'
import styles from './StoryQuest.module.css'

type Props = {
    slot: StorySlot
    selectedId: string | null
    locked?: boolean
    onSelect: (optionId: string) => void
}

export default function SlotColumn({ slot, selectedId, locked, onSelect }: Props) {
    const shyId = useMemo(
        () => slot.options[Math.floor(Math.random() * slot.options.length)].id,
        [slot]
    )
    const [dodgedOnce, setDodgedOnce] = useState(false)
    const [dodging, setDodging] = useState(false)

    const handleClick = (optionId: string) => {
        if (locked) return
        if (optionId === shyId && !dodgedOnce) {
            setDodging(true)
            setDodgedOnce(true)
            window.setTimeout(() => setDodging(false), 380)
            return
        }
        onSelect(optionId)
    }

    return (
        <div className={styles.slot}>
            <p className={styles.slotTitle}>{slot.title}</p>
            <div className={styles.slotOptions}>
                {slot.options.map(option => (
                    <button
                        key={option.id}
                        className={[
                            styles.option,
                            selectedId === option.id ? styles.optionSelected : '',
                            dodging && option.id === shyId ? styles.optionDodge : ''
                        ].join(' ')}
                        onClick={() => handleClick(option.id)}
                    >
                        <span className={styles.optionImgWrap}>
                            <img
                                src={option.image}
                                alt={option.label}
                                className={styles.optionImg}
                                onError={e => { e.currentTarget.style.display = 'none' }}
                            />
                        </span>
                        <span className={styles.optionLabel}>{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}