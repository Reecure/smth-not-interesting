import RainBackground from './RainBackground'
import QuestNode from './QuestNode'
import WobbleFilter from './WobbleFilter'
import { quests, FINAL_QUEST } from '../quest/quests'
import { useQuestProgress } from '../api/useQuestProgress'

export default function Hub() {
    const { progress, state } = useQuestProgress()

    const done = new Set(progress.completed)
    const playable = quests.filter(q => q.id !== FINAL_QUEST)
    const doneCount = playable.filter(q => done.has(q.id)).length
    const allDone = doneCount === playable.length

    return (
        <div className="hub">
            <WobbleFilter />
            <RainBackground />

            <div className="hub__intro">
                <p className="hub__eyebrow">квест</p>
                <h1 className="hub__title">Выбери историю</h1>
                <p className="hub__subtitle">
                    Пять историй разбросаны по экрану. Пройди их, чтобы открыть финал.
                </p>
                <p className="hub__progress">
                    {state === 'loading' && 'сверяюсь с сервером...'}
                    {state === 'ready' && (
                        <>
                            пройдено: <b>{doneCount}</b> из {playable.length}
                        </>
                    )}
                </p>
            </div>

            {quests.map((q, i) => {
                const isFinal = q.id === FINAL_QUEST
                const status = done.has(q.id)
                    ? 'done'
                    : isFinal && !allDone
                        ? 'locked'
                        : 'todo'

                return <QuestNode key={q.id} quest={q} status={status} index={i} />
            })}
        </div>
    )
}