import type { DebrisLetter } from './useLetterDebris.ts'
import styles from './TelegramQuest.module.css'

type Props = {
    letters: DebrisLetter[]
}

export default function LetterDebris({ letters }: Props) {
    return (
        <div className={styles.debris}>
            {letters.map(l => (
                <span
                    key={l.id}
                    className={styles.debrisLetter}
                    style={{ left: l.x, top: l.y, transform: `rotate(${l.rot}deg)` }}
                >
                    {l.char}
                </span>
            ))}
        </div>
    )
}
