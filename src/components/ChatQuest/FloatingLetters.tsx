import { useState } from 'react'
import styles from './ChatQuest.module.css'

const ALPHABET = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ'

const LETTERS = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    char: ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 14 + Math.random() * 10,
    size: 12 + Math.random() * 14
}))

export default function FloatingLetters() {
    const [popped, setPopped] = useState<Record<number, boolean>>({})

    const handleClick = (id: number) => {
        setPopped(p => ({ ...p, [id]: true }))
        window.setTimeout(() => {
            setPopped(p => ({ ...p, [id]: false }))
        }, 500)
    }

    return (
        <div className={styles.floatingLetters}>
            {LETTERS.map(l => (
                <span
                    key={l.id}
                    className={styles.floatingLetterTrack}
                    style={{
                        left: `${l.left}%`,
                        animationDelay: `${l.delay}s`,
                        animationDuration: `${l.duration}s`
                    }}
                >
                    <span
                        className={`${styles.floatingLetter} ${popped[l.id] ? styles.floatingLetterPop : ''}`}
                        style={{ fontSize: l.size }}
                        onClick={() => handleClick(l.id)}
                    >
                        {l.char}
                    </span>
                </span>
            ))}
        </div>
    )
}