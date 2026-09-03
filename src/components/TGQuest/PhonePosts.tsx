import { POST_IDS, TELEGRAM_CHANNEL } from './telegramPosts.ts'
import TelegramWidget from './TelegramWidget.tsx'
import styles from './TelegramQuest.module.css'

export default function PhonePosts() {
    return (
        <div className={styles.phone}>
            <span className={styles.phoneButtons} />
            <div className={styles.phoneHeader}>{TELEGRAM_CHANNEL}</div>
            <div className={styles.phoneBody}>
                {POST_IDS.map(id => (
                    <TelegramWidget key={id} channel={TELEGRAM_CHANNEL} postId={id} />
                ))}
            </div>
        </div>
    )
}