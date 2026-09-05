import type { Payload, Progress } from '../../api/questApi.ts'

export type FinalCard = {
    id: string
    index: number
    title: string
    kind: 'stat' | 'text' | 'letter' | 'gossip'
    value?: string
    lines?: string[]
    letter?: { text: string; troll: [string, string][] }
    empty?: boolean
}

function num(p: Payload | undefined, key: string): number | null {
    const v = p?.[key]
    return typeof v === 'number' ? v : null
}

function str(p: Payload | undefined, key: string): string | null {
    const v = p?.[key]
    return typeof v === 'string' && v.trim() ? v : null
}

export function buildFinalCards(progress: Progress): FinalCard[] {
    const a = progress.answers
    const cards: FinalCard[] = []

    const planes = num(a.telegram, 'planesHit')
    cards.push({
        id: 'planes',
        index: 1,
        title: 'Самолётики',
        kind: 'stat',
        value: planes === null ? '—' : String(planes),
        lines: [
            planes === null
                ? 'ты туда даже не заходил'
                : planes === 0
                    ? 'ни одного. дисциплина.'
                    : planes < 5
                        ? 'сбито в башню. немного, но со вкусом.'
                        : 'сбито в башню. тебя же просили не трогать.',
        ],
        empty: planes === null,
    })

    const tail = str(a.telegram, 'tail')
    cards.push({
        id: 'phrase',
        index: 2,
        title: 'Что ты собрал',
        kind: 'text',
        lines: tail
            ? ['получены кадры вашей биг блек ' + tail]
            : ['фраза так и не собралась'],
        empty: !tail,
    })

    const ducks = num(a.shake, 'ducksPlaced')
    cards.push({
        id: 'ducks',
        index: 3,
        title: 'Уточки',
        kind: 'stat',
        value: ducks === null ? '—' : String(ducks),
        lines: [
            ducks === null
                ? 'ни одна утка не была потревожена'
                : `спасено из воздуха и доставлено в пруд`,
        ],
        empty: ducks === null,
    })

    const letterText = str(a.letter, 'fullText')
    const troll = (a.letter?.troll as [string, string][] | undefined) ?? []
    cards.push({
        id: 'letter',
        index: 4,
        title: 'Письмо',
        kind: 'letter',
        letter: letterText ? { text: letterText, troll } : undefined,
        lines: letterText ? undefined : ['письмо осталось ненаписанным'],
        empty: !letterText,
    })

    cards.push({
        id: 'gossip',
        index: 5,
        title: 'Сплетня',
        kind: 'gossip',
        lines: a.chat
            ? ['Сплетню я так и не вспомнил. Извини.']
            : ['до сплетни ты даже не дошёл'],
        empty: !a.chat,
    })

    const story = str(a.story, 'story')
    cards.push({
        id: 'cats',
        index: 6,
        title: 'Коты',
        kind: 'text',
        lines: story ? [story] : ['котов не завели'],
        empty: !story,
    })

    return cards
}