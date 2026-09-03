import styles from './ChatQuest.module.css'

type Props = {
    remainingMs: number
    note: string | null
    onSpeedUp: () => void
}

export default function TrollTyping({ remainingMs, note, onSpeedUp }: Props) {
    const seconds = Math.ceil(remainingMs / 1000)

    return (
        <div className={styles.troll}>
            <div className={styles.trollHeader}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.trollTimer}>ещё {seconds}с</span>
            </div>
            <button className={styles.trollBtn} onClick={onSpeedUp}>ускорить</button>
            {note && <span className={styles.trollNote}>{note}</span>}
        </div>
    )
}