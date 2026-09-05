import { useState } from 'react'
import LetterTypewriter from './LetterTypewriter.tsx'
import type { FinalCard } from './finalCards.ts'
import styles from './LoadingQuest.module.css'

type Props = {
    cards: FinalCard[]
    onAllSeen?: () => void
}

export default function FinalCards({ cards, onAllSeen }: Props) {
    const [openId, setOpenId] = useState<string | null>(null)
    const [seen, setSeen] = useState<Set<string>>(new Set())

    const open = (id: string) => {
        setOpenId(id)
        setSeen(prev => {
            const next = new Set(prev).add(id)
            if (next.size === cards.length) onAllSeen?.()
            return next
        })
    }

    const active = cards.find(c => c.id === openId)

    return (
        <div className={styles.finalWrap}>
            <p className={styles.finalTitle}>вот что мы запомнили</p>
            <p className={styles.finalSub}>
                открыто {seen.size} из {cards.length}
            </p>

            <div className={styles.finalGrid}>
                {cards.map(card => (
                    <button
                        key={card.id}
                        className={[
                            styles.finalCard,
                            seen.has(card.id) ? styles.finalCardSeen : '',
                            openId === card.id ? styles.finalCardActive : '',
                            card.empty ? styles.finalCardEmpty : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => open(card.id)}
                    >
                        <span className={styles.finalCardIndex}>0{card.index}</span>
                        <span className={styles.finalCardTitle}>{card.title}</span>
                        <span className={styles.finalCardDot} />
                    </button>
                ))}
            </div>

            {active && (
                <div className={styles.finalPanel} key={active.id}>
                    <p className={styles.panelTitle}>{active.title}</p>

                    {active.kind === 'stat' && (
                        <p className={styles.panelStat}>{active.value}</p>
                    )}

                    {active.kind === 'letter' && active.letter ? (
                        <LetterTypewriter
                            text={active.letter.text}
                            troll={active.letter.troll}
                        />
                    ) : (
                        active.lines?.map((line, i) => (
                            <p key={i} className={styles.panelLine}>
                                {line}
                            </p>
                        ))
                    )}
                </div>
            )}

            {!active && (
                <p className={styles.finalHint}>нажми на карточку, чтобы вспомнить</p>
            )}
        </div>
    )
}