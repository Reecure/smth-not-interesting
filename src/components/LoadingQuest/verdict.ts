import { getAllAnswers } from '../../api/questApi.ts'

export function buildVerdictLines(): string[] {
    const answers = getAllAnswers()
    const byId = Object.fromEntries(answers.map(a => [a.questId, a.payload])) as Record<string, any>

    const lines: string[] = []

    if (byId.letter?.values) {
        const words = Object.values(byId.letter.values as Record<string, string>).filter(Boolean)
        lines.push(words.length
            ? `Письмо дописано твоей рукой: ${words.join(', ')}.`
            : 'Письмо так и осталось недописанным.')
    } else {
        lines.push('Письмо так и осталось недописанным.')
    }

    if (byId.story?.story) {
        lines.push(`История с котом сложилась так: ${byId.story.story}`)
    } else {
        lines.push('История с котом так и не сложилась.')
    }

    if (byId.telegram?.phrase) {
        lines.push(`Из канала собрана фраза: «${byId.telegram.phrase}».`)
    } else {
        lines.push('Фраза из канала так и не собрана.')
    }

    if (typeof byId.shake?.ducksPlaced === 'number') {
        lines.push(`Уточек спасено: ${byId.shake.ducksPlaced} из 5.`)
    } else {
        lines.push('Ни одна уточка не спасена.')
    }

    lines.push('Сплетня так и не случилась — «ой потом расскажу)» до сих пор висит в чате.')

    return lines
}