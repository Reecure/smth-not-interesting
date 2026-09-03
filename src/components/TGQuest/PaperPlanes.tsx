import styles from './TelegramQuest.module.css'

const PLANES = [
    { top: '10%', delay: '0s', duration: '15s', size: 18 },
    { top: '28%', delay: '4s', duration: '22s', size: 14 },
    { top: '46%', delay: '8s', duration: '18s', size: 20 },
    { top: '64%', delay: '2s', duration: '24s', size: 12 },
    { top: '82%', delay: '13s', duration: '17s', size: 16 }
]

export default function PaperPlanes() {
    return (
        <div className={styles.planes}>
            {PLANES.map((p, i) => (
                <span
                    key={i}
                    className={styles.plane}
                    style={{ top: p.top, animationDelay: p.delay, animationDuration: p.duration, fontSize: p.size }}
                >
                    ✈️
                </span>
            ))}
        </div>
    )
}