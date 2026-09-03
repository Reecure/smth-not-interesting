import styles from './ChatQuest.module.css'

export default function TypingIndicator() {
    return (
        <div className={styles.typing}>
            <span className={styles.typingDot} />
        </div>
    )
}
