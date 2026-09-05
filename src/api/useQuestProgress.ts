import { useCallback, useEffect, useState } from 'react'
import {
    type Payload,
    type Progress,
    type QuestId,
    fetchProgress,
    getCachedProgress,
    submitAnswer as apiSubmit,
} from './questApi.ts'

export type LoadState = 'loading' | 'ready' | 'offline'

export function useQuestProgress(questId?: QuestId) {
    const [progress, setProgress] = useState<Progress>(() => getCachedProgress())
    const [state, setState] = useState<LoadState>('loading')
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
        fetchProgress()
            .then(p => {
                if (!alive) return
                setProgress(p)
                setState('ready')
            })
            .catch(() => {
                if (!alive) return
                setState('offline')
            })
        return () => {
            alive = false
        }
    }, [])

    const submit = useCallback(
        async (payload: Payload, id?: QuestId) => {
            const target = id ?? questId
            if (!target) return
            setSaving(true)
            setSaveError(null)
            try {
                const next = await apiSubmit(target, payload)
                setProgress(next)
            } catch (e) {
                setSaveError(e instanceof Error ? e.message : 'ошибка сохранения')
            } finally {
                setSaving(false)
            }
        },
        [questId]
    )

    const answer = questId ? progress.answers[questId] : undefined
    const isDone = questId ? progress.completed.includes(questId) : false

    return { progress, state, saving, saveError, submit, answer, isDone, setProgress }
}