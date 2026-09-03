export type SlotOption = {
    id: string
    label: string
    image: string
    fragment: string
}

export type StorySlot = {
    id: string
    title: string
    options: SlotOption[]
}

export const storySlots: StorySlot[] = [
    {
        id: 'cat',
        title: 'кот',
        options: [
            { id: 'cat-ginger', label: 'рыжий кот', image: '/assets/story-game/cat-ginger.jpg', fragment: 'рыжий кот' },
            { id: 'cat-black', label: 'чёрный кот', image: '/assets/story-game/cat-black.jpg', fragment: 'чёрный кот' },
            { id: 'cat-tabby', label: 'полосатый кот', image: '/assets/story-game/cat-tabby.jpg', fragment: 'полосатый кот' }
        ]
    },
    {
        id: 'bowl',
        title: 'миска',
        options: [
            { id: 'bowl-full', label: 'миска полная', image: '/assets/story-game/bowl-full.jpg', fragment: 'сидит перед полной миской' },
            { id: 'bowl-half', label: 'миска наполовину', image: '/assets/story-game/bowl-half.jpg', fragment: 'сидит перед наполовину пустой миской' },
            { id: 'bowl-empty', label: 'миска пустая', image: '/assets/story-game/bowl-empty.jpg', fragment: 'сидит перед пустой миской' }
        ]
    },
    {
        id: 'mood',
        title: 'настроение',
        options: [
            { id: 'mood-happy', label: 'весёлый кот', image: '/assets/story-game/mood-happy.jpg', fragment: 'выглядит довольным' },
            { id: 'mood-sad', label: 'грустный кот', image: '/assets/story-game/mood-sad.jpg', fragment: 'выглядит расстроенным' },
            { id: 'mood-mid', label: 'кот со средним настроением', image: '/assets/story-game/mood-mid.jpg', fragment: 'выглядит равнодушным' }
        ]
    }
]
