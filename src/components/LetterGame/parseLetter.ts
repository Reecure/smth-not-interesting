export type LetterToken =
    | { type: 'text'; value: string }
    | { type: 'burnable'; value: string; id: string }

export function parseLetter(message: string): LetterToken[] {
    const tokens: LetterToken[] = []
    const regex = /\[([^\]]+)\]/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    let i = 0

    while ((match = regex.exec(message))) {
        if (match.index > lastIndex) {
            tokens.push({ type: 'text', value: message.slice(lastIndex, match.index) })
        }
        tokens.push({ type: 'burnable', value: match[1], id: `w${i++}` })
        lastIndex = regex.lastIndex
    }

    if (lastIndex < message.length) {
        tokens.push({ type: 'text', value: message.slice(lastIndex) })
    }

    return tokens
}
