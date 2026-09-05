export type QuestId = 'letter' | 'telegram' | 'story' | 'shake' | 'chat' | 'loading'

export const QUEST_IDS: QuestId[] = ['letter', 'telegram', 'story', 'shake', 'chat', 'loading']

export type Payload = Record<string, unknown>

export type Progress = {
    sessionId: string
    answers: Partial<Record<QuestId, Payload>>
    completed: QuestId[]
    total: number
}

const BASE_URL = 'https://smth-not-interesting-back.onrender.com'
const SESSION_KEY = 'quest-session-id'
const CACHE_KEY = 'quest-progress-cache'
const TIMEOUT_MS = 12000

export function getSessionId(): string {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(SESSION_KEY, id)
    }
    return id
}

function readCache(): Progress {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) return JSON.parse(raw) as Progress
    } catch {
    }
    return { sessionId: getSessionId(), answers: {}, completed: [], total: QUEST_IDS.length }
}

function writeCache(p: Progress) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(p))
    } catch {
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
        const res = await fetch(`${BASE_URL}${path}`, { ...init, signal: ctrl.signal })
        if (!res.ok) {
            const text = await res.text().catch(() => '')
            throw new Error(`${res.status} ${text || res.statusText}`)
        }
        return (await res.json()) as T
    } finally {
        window.clearTimeout(timer)
    }
}

function normalize(raw: unknown): Progress {
    const p = raw as Partial<Progress>
    return {
        sessionId: p.sessionId ?? getSessionId(),
        answers: (p.answers ?? {}) as Progress['answers'],
        completed: (p.completed ?? []) as QuestId[],
        total: p.total ?? QUEST_IDS.length,
    }
}

export async function fetchProgress(): Promise<Progress> {
    const progress = normalize(await request(`/api/progress/${getSessionId()}`))
    writeCache(progress)
    return progress
}

export function getCachedProgress(): Progress {
    return readCache()
}

export async function submitAnswer(questId: QuestId, payload: Payload): Promise<Progress> {
    const cached = readCache()
    const optimistic: Progress = {
        ...cached,
        answers: { ...cached.answers, [questId]: payload },
        completed: [...new Set([...cached.completed, questId])],
    }
    writeCache(optimistic)

    try {
        const progress = normalize(
            await request('/api/quest-answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: getSessionId(), questId, payload }),
            })
        )
        writeCache(progress)
        return progress
    } catch (e) {
        console.warn('submitAnswer failed, using local cache', e)
        return optimistic
    }
}

export async function resetProgress(questId?: QuestId): Promise<Progress> {
    const query = questId ? `?questId=${questId}` : ''
    try {
        const progress = normalize(
            await request(`/api/progress/${getSessionId()}${query}`, { method: 'DELETE' })
        )
        writeCache(progress)
        return progress
    } catch {
        const cached = readCache()
        const answers = { ...cached.answers }
        if (questId) delete answers[questId]
        const next: Progress = questId
            ? { ...cached, answers, completed: cached.completed.filter(q => q !== questId) }
            : { ...cached, answers: {}, completed: [] }
        writeCache(next)
        return next
    }
}