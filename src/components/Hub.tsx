import RainBackground from './RainBackground'
import QuestNode from './QuestNode'
import { quests } from '../quest/quests'

export default function Hub() {
    return (
        <div className="hub">
            <RainBackground />

            <div className="hub__intro">
                <p className="hub__eyebrow">квест</p>
                <h1 className="hub__title">Выбери историю</h1>
                <p className="hub__subtitle">Шесть загадок разбросаны по экрану. Пройди их все, чтобы дойти до финала.</p>
            </div>

            {quests.map(q => (
                <QuestNode key={q.id} quest={q} />
            ))}
        </div>
    )
}
