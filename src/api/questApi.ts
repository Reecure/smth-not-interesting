export type QuestAnswer = {
    questId: string
    payload: Record<string, unknown>
    submittedAt: string
}

const STORAGE_PREFIX = 'quest-answer-'
const SESSION_KEY = 'quest-session-id'
const BASE_URL = 'https://smth-not-interesting-back.onrender.com'
const API_ENDPOINT = `${BASE_URL}/api/quest-answers`

function getSessionId(): string {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(SESSION_KEY, id)
    }
    return id
}

export async function submitAnswer(questId: string, payload: Record<string, unknown>): Promise<QuestAnswer> {
    const answer: QuestAnswer = {
        questId,
        payload,
        submittedAt: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_PREFIX + questId, JSON.stringify(answer))

    try {
        await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...answer, sessionId: getSessionId() })
        })
    } catch {
        return answer
    }

    return answer
}

export function getAnswer(questId: string): QuestAnswer | null {
    const raw = localStorage.getItem(STORAGE_PREFIX + questId)
    if (!raw) return null
    return JSON.parse(raw) as QuestAnswer
}

export function isQuestComplete(questId: string): boolean {
    return getAnswer(questId) !== null
}

export function getAllAnswers(): QuestAnswer[] {
    const answers: QuestAnswer[] = []
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key || !key.startsWith(STORAGE_PREFIX)) continue
        const raw = localStorage.getItem(key)
        if (raw) answers.push(JSON.parse(raw) as QuestAnswer)
    }
    return answers
}