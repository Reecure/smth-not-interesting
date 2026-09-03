export type QuestStatus = 'done' | 'todo'

export type Quest = {
    id: string
    label: string
    icon: string
    path: string
    left: string
    top: string
    status: QuestStatus
}

export const quests: Quest[] = [
    { id: 'letter', label: 'Письмо у свечи', icon: '🕯️', path: '/quest/letter', left: '14%', top: '25%', status: 'todo' },
    { id: 'telegram', label: 'ТГ-канал', icon: '▶', path: '/quest/telegram', left: '47%', top: '32%', status: 'todo' },
    { id: 'ducks-window', label: 'Стори квест', icon: '🦆', path: '/quest/story', left: '75%', top: '19%', status: 'todo' },
    { id: 'components', label: 'Тряска и уточки', icon: '📦', path: '/quest/shake', left: '21%', top: '61%', status: 'done' },
    { id: 'chat', label: 'Печатная машинка', icon: '⌨️', path: '/quest/chat', left: '60%', top: '67%', status: 'todo' },
    { id: 'loading', label: 'Загрузка и стикеры', icon: '◆', path: '/quest/loading', left: '87%', top: '58%', status: 'todo' }
]