import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import type { Quest, QuestStatus } from '../quest/quests'

type Props = {
    quest: Quest
    status: QuestStatus
    index?: number
}

export default function QuestNode({ quest, status, index = 0 }: Props) {
    const locked = status === 'locked'

    const style = {
        left: quest.left,
        top: quest.top,
        ['--float-delay' as string]: `${(index * 1.7) % 6}s`,
        ['--tilt' as string]: `${((index % 3) - 1) * 2}deg`,
    } as CSSProperties

    const content = (
        <>
            <span className="quest-node__tile">
                <span className="quest-node__edge" />
                <span className="quest-node__glow" />
                <span className="quest-node__inner">
                    <img className="quest-node__img" src={quest.img} alt="" draggable={false} />
                </span>
                <span className="quest-node__scan" />
            </span>
            <span className="quest-node__label">{quest.label}</span>
            <span className="quest-node__dot" />
        </>
    )

    if (locked) {
        return (
            <div
                className="quest-node quest-node--locked"
                style={style}
                aria-label={`${quest.label} — сначала пройди остальные`}
                aria-disabled="true"
            >
                {content}
            </div>
        )
    }

    return (
        <Link
            to={quest.path}
            className={`quest-node quest-node--${status}`}
            style={style}
            aria-label={quest.label}
        >
            {content}
        </Link>
    )
}