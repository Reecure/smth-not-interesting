import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import RainBackground from './RainBackground.tsx'
import BackButton from "./ui/BackButton/BackButton.tsx";

type Props = {
    status: 'done' | 'todo'
    children: ReactNode
}

export default function QuestShell({ status, children }: Props) {
    const navigate = useNavigate()

    return (
        <div className="quest-shell">
            <RainBackground />

            <button className="quest-shell__back" onClick={() => navigate('/')}>
                <BackButton onClick={() => {}} />
            </button>
            <span className="quest-shell__status">{status === 'done' ? 'пройден' : 'не пройден'}</span>
            <div className="quest-shell__body">{children}</div>
        </div>
    )
}
