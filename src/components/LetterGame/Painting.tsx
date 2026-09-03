import type { CSSProperties } from 'react'
import styles from './LetterGame.module.css'

type Props = {
    front: string
    back: string
    alt: string
    tilt: number
    position: CSSProperties
}

export default function Painting({ front, back, alt, tilt, position }: Props) {
    return (
        <div className={styles.paintingWrap} style={position}>
            <div className={styles.paintingTilt} style={{ transform: `rotate(${tilt}deg)` }}>
                <div className={styles.paintingFlip}>
                    <div className={styles.paintingFace}>
                        <img src={front} alt={alt} className={styles.paintingImg} />
                    </div>
                    <div className={`${styles.paintingFace} ${styles.paintingBack}`}>
                        <img src={back} alt={`${alt} gg`} className={styles.paintingImg} />
                    </div>
                </div>
            </div>
        </div>
    )
}