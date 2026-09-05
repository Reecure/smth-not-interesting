export type Slot = 'cat' | 'food' | 'water' | 'toy'

export type Item = {
    id: string
    label: string
    price: number
    weight: number
    score: number
    color?: string
    stripe?: string
}

export type Reel = {
    title: string
    spinnable: boolean
    multi?: boolean
    items: Item[]
}

export const REELS: Record<Slot, Reel> = {
    cat: {
        title: 'коты',
        spinnable: false,
        multi: true,
        items: [
            { id: 'ginger', label: 'рыжий кот', price: 5, weight: 0, score: 1, color: '#E8913C', stripe: '#C56F22' },
            { id: 'black', label: 'чёрный кот', price: 5, weight: 0, score: 1, color: '#3B3350', stripe: '#2A2340' },
            { id: 'striped', label: 'полосатый кот', price: 5, weight: 0, score: 1, color: '#9C8FB8', stripe: '#5C5175' },
        ],
    },
    food: {
        title: 'миска',
        spinnable: true,
        items: [
            { id: 'full', label: 'миска полная', price: 5, weight: 10, score: 3 },
            { id: 'half', label: 'миска наполовину', price: 3, weight: 25, score: 2 },
            { id: 'crumbs', label: 'пара крошек', price: 1, weight: 40, score: 1 },
            { id: 'empty', label: 'пустая миска', price: 0, weight: 25, score: 0 },
        ],
    },
    water: {
        title: 'вода',
        spinnable: true,
        items: [
            { id: 'fountain', label: 'поилка-фонтан', price: 4, weight: 10, score: 3 },
            { id: 'bowl', label: 'полная миска воды', price: 3, weight: 24, score: 2 },
            { id: 'drops', label: 'пара капель', price: 1, weight: 38, score: 1 },
            { id: 'dry', label: 'сухая поилка', price: 0, weight: 28, score: 0 },
        ],
    },
    toy: {
        title: 'игрушка',
        spinnable: true,
        items: [
            { id: 'tower', label: 'когтеточка с мышью', price: 4, weight: 10, score: 3 },
            { id: 'mouse', label: 'мышь на верёвочке', price: 3, weight: 24, score: 2 },
            { id: 'cap', label: 'крышечка от бутылки', price: 1, weight: 38, score: 1 },
            { id: 'none', label: 'пустой пакет', price: 0, weight: 28, score: 0 },
        ],
    },
}

export const SLOT_ORDER: Slot[] = ['cat', 'food', 'water', 'toy']
export const SUPPLY_SLOTS: Slot[] = ['food', 'water', 'toy']

export const START_COINS = 10
export const SPIN_COST = 2
export const THIMBLE_BET = 1
export const THIMBLE_WIN = 3
export const MAX_SCORE = 12

export function sellPrice(item: Item): number {
    return Math.floor(item.price / 2)
}

export function rollItem(slot: Slot): Item {
    const items = REELS[slot].items
    const total = items.reduce((s, i) => s + i.weight, 0)
    let r = Math.random() * total
    for (const item of items) {
        r -= item.weight
        if (r <= 0) return item
    }
    return items[items.length - 1]
}

export type Board = {
    cats: Item[]
    food?: Item
    water?: Item
    toy?: Item
}

export const emptyBoard: Board = { cats: [] }

export function supplyScore(board: Board): number {
    return SUPPLY_SLOTS.reduce((s, k) => s + ((board[k as 'food'] as Item | undefined)?.score ?? 0), 0)
}

export function boardScore(board: Board): number {
    const cats = board.cats.length
    if (cats === 0) return 0

    const supply = supplyScore(board)
    const shared = Math.floor((supply / cats) * 10) / 10
    return Math.round((cats + shared) * 10) / 10
}

export function isPerfect(board: Board): boolean {
    return (
        board.cats.length === 3 &&
        board.food?.id === 'full' &&
        board.water?.id === 'fountain' &&
        board.toy?.id === 'tower'
    )
}

export function buildStory(board: Board, coins: number, wins: number): string {
    const cats = board.cats
    if (cats.length === 0) return 'Кота так и не завели.'

    const names = cats.map(c => c.label).join(', ')
    const parts: string[] = []

    if (cats.length === 1) parts.push(`${names} остался на ночь`)
    else if (cats.length === 2) parts.push(`${names} - двое на одну квартиру`)
    else parts.push(`${names} - полный набор, теперь это их квартира`)

    const foodLine: Record<string, string> = {
        full: 'еды хватило всем',
        half: 'еду пришлось делить',
        crumbs: 'достались крошки',
        empty: 'миска осталась пустой',
    }
    const waterLine: Record<string, string> = {
        fountain: 'фонтанчик работал всю ночь',
        bowl: 'воды было вдоволь',
        drops: 'воды почти не было',
        dry: 'пили из-под крана',
    }
    const toyLine: Record<string, string> = {
        tower: 'а когтеточку делили по очереди',
        mouse: 'а мышь на верёвочке рвали друг у друга',
        cap: 'а из развлечений — одна крышечка',
        none: 'и развлекались как умели',
    }

    parts.push(foodLine[board.food?.id ?? 'empty'] ?? 'миска осталась пустой')
    parts.push(waterLine[board.water?.id ?? 'dry'] ?? 'пили из-под крана')
    parts.push(toyLine[board.toy?.id ?? 'none'] ?? 'развлекались как умели')

    if (cats.length > 1 && supplyScore(board) < cats.length * 2) {
        parts.push('в целом они не в восторге')
    }

    let tail = `. Осталось монет: ${coins}.`
    if (wins >= 6) tail += ` Казино обыграно ${wins} раз — коты одобряют.`

    return parts.join(', ') + tail
}