import catGif from '../../assets/cat-smile-kitty-smile.gif'
export type ChatStep =
    | { kind: 'bot'; text: string; troll?: boolean }
    | { kind: 'reply' }
    | { kind: 'scatter' }
    | { kind: 'final'; text: string }

export const chatScript: ChatStep[] = [
    { kind: 'bot', text: 'Привет' },
    { kind: 'reply' },
    { kind: 'bot', text: '' },
    { kind: 'reply' },
    { kind: 'bot', text: 'Ладно' },
    { kind: 'bot', text: 'Кароче' },
    { kind: 'bot', text: 'У меня такая история есть' },
    { kind: 'bot', text: 'с работы' },
    { kind: 'bot', text: 'там у Жени чето с девошкую не поладилось' },
    { kind: 'bot', text: 'там вообще ебанутая ситуация произошла', troll: true },
    { kind: 'bot', text: 'вот вроде ничего не предвещало что это случится' },
    { kind: 'bot', text: 'а потом хуяк и уже все...', troll: true },
    { kind: 'bot', text: 'так вот что произошло' },
    { kind: 'scatter' },
    { kind: 'final', text: 'ой потом расскажу)' }
]

export const FINAL_GIF_SRC = catGif