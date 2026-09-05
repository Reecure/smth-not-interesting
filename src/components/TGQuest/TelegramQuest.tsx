import { useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import PhonePosts from './PhonePosts.tsx'
import PaperPlanes from './PaperPlanes.tsx'
import LetterDebris from '../ChatQuest/LetterDebris.tsx'
import { useLetterDebris } from '../ChatQuest/useLetterDebris.ts'
import { useQuestProgress } from '../../api/useQuestProgress.ts'
import styles from './TelegramQuest.module.css'

const REQUIRED_PREFIX = 'получены кадры вашей биг блек'

export default function TelegramQuest() {
    const { state, saving, saveError, submit, isDone, answer } = useQuestProgress('telegram')

    const [value, setValue] = useState('')
    const [shake, setShake] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hits, setHits] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const { letters, spawn } = useLetterDebris()

    const submitted = isDone
    const savedPhrase = typeof answer?.phrase === 'string' ? answer.phrase : ''
    const savedTail = typeof answer?.tail === 'string' ? answer.tail : ''

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text')
        if (!text || !inputRef.current) return
        const rect = inputRef.current.getBoundingClientRect()
        spawn(text, rect.left + 10, rect.top)
    }

    const handleConfirm = () => {
        if (saving) return

        const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
        if (!normalized.startsWith(REQUIRED_PREFIX)) {
            setShake(true)
            setError('начало не сходится')
            window.setTimeout(() => setShake(false), 400)
            return
        }

        const tail = value.trim().slice(REQUIRED_PREFIX.length).trim()
        setError(null)
        submit({ phrase: value.trim(), tail, planesHit: hits })
    }

    return (
        <QuestShell
            status={submitted ? 'done' : 'todo'}
            state={state}
            saving={saving}
            saveError={saveError}
        >
            <PaperPlanes onHit={setHits} />
            <LetterDebris letters={letters} />

            <div className={styles.layout}>
                <PhonePosts />

                <div className={styles.form}>
                    <p className={styles.formTitle}>Собери фразу из сообщений</p>

                    <input
                        ref={inputRef}
                        className={`${styles.input} ${shake ? styles.inputShake : ''}`}
                        placeholder="впиши фразу..."
                        value={submitted ? savedPhrase : value}
                        onChange={e => setValue(e.target.value)}
                        onPaste={handlePaste}
                        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                        disabled={submitted || saving}
                    />

                    {error && <p className={styles.error}>{error}</p>}
                    {saveError && <p className={styles.error}>не сохранилось, попробуй ещё</p>}

                    <div>
                        <p className={styles.hint}>1. Не копируй и не вставляй!</p>
                        <p className={styles.hint}>2. Не трогай самолетики!</p>
                        <p className={styles.hint}>
                            3. Начало важно, а чем закончишь — выбирать тебе
                        </p>
                        {hits > 0 && <p className={styles.hint}>сбито самолётиков: {hits}</p>}
                    </div>

                    {!submitted && (
                        <button
                            className={styles.submitBtn}
                            onClick={handleConfirm}
                            disabled={saving || !value.trim()}
                        >
                            {saving ? 'сохраняю...' : 'подтвердить'}
                        </button>
                    )}

                    {submitted && (
                        <p className={styles.done}>
                            принято{savedTail && `: ...${savedTail}`}
                        </p>
                    )}
                </div>
            </div>
        </QuestShell>
    )
}