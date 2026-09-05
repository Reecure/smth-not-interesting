import type { QuestId } from '../api/questApi.ts'

export type QuestStatus = 'done' | 'todo' | 'locked'

export type Quest = {
    id: QuestId
    label: string
    img: string
    path: string
    left: string
    top: string
}

export const quests: Quest[] = [
    { id: 'letter',   label: 'Письмо у свечи',     img: '/art/quests/candle.png',  path: '/quest/letter',   left: '14%', top: '35%' },
    { id: 'telegram', label: 'ТГ-канал',           img: '/art/quests/phone.png',   path: '/quest/telegram', left: '47%', top: '42%' },
    { id: 'story',    label: 'Котиное казино',     img: '/art/quests/duck.png',    path: '/quest/story',    left: '75%', top: '29%' },
    { id: 'shake',    label: 'Тряска и уточки',    img: '/art/quests/box.png',     path: '/quest/shake',    left: '21%', top: '71%' },
    { id: 'chat',     label: 'Сплетня',            img: '/art/quests/laptop.png',  path: '/quest/chat',     left: '60%', top: '77%' },
    { id: 'loading',  label: 'Финал',              img: '/art/quests/sticker.png', path: '/quest/loading',  left: '87%', top: '68%' },
]

export const FINAL_QUEST: QuestId = 'loading'