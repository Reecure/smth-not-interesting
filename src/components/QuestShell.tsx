import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import RainBackground from './RainBackground.tsx'
import BackButton from './ui/BackButton/BackButton.tsx'
import type { LoadState } from '../api/useQuestProgress.ts'

type Props = {
    status: 'done' | 'todo'
    state?: LoadState
    saving?: boolean
    saveError?: string | null
    children: ReactNode
}

export default function QuestShell({ status, state, saving, saveError, children }: Props) {
    const navigate = useNavigate()

    return (
        <div className="quest-shell">
            <RainBackground />

            <button className="quest-shell__back" onClick={() => navigate('/')}>
                <BackButton onClick={() => {}} />
            </button>

            <div className="quest-shell__state">
                {state === 'loading' && <span className="badge badge--muted">загрузка...</span>}
                {state === 'offline' && <span className="badge badge--warn">офлайн</span>}
                {saving && <span className="badge badge--muted">сохраняю...</span>}
                {saveError && <span className="badge badge--warn">не сохранилось</span>}
                {status === 'done' && !saving && <span className="badge badge--ok">пройдено</span>}
            </div>

            <div className="quest-shell__body">{children}</div>
        </div>
    )
}