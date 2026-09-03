import { useNavigate } from 'react-router-dom'
import type { Quest } from '../quest/quests.ts'

type Props = {
    quest: Quest
}

export default function QuestNode({ quest }: Props) {
    const navigate = useNavigate()

    return (
        <button
            className="quest-node"
            style={{ left: quest.left, top: quest.top }}
            onClick={() => navigate(quest.path)}
        >
            <span className="quest-node__icon">{quest.icon}</span>
            <span className="quest-node__label">{quest.label}</span>
            <span className={`quest-node__dot ${quest.status === 'done' ? 'quest-node__dot--done' : ''}`} />
        </button>
    )
}
