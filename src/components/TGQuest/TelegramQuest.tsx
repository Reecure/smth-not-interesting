import { useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import PhonePosts from './PhonePosts.tsx'
import PaperPlanes from './PaperPlanes.tsx'
import LetterDebris from '../ChatQuest/LetterDebris.tsx'
import { useLetterDebris } from '../ChatQuest/useLetterDebris.ts'
import { submitAnswer } from '../../api/questApi.ts'
import styles from './TelegramQuest.module.css'

const TARGET_PHRASE = 'впиши сюда реальную фразу'
const CHANNEL_URL = 'https://t.me/smthnotinterestingapp'
const QUEST_ID = 'telegram'

export default function TelegramQuest() {
    const [value, setValue] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [shake, setShake] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const { letters, spawn } = useLetterDebris()

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text')
        if (!text || !inputRef.current) return
        const rect = inputRef.current.getBoundingClientRect()
        spawn(text, rect.left + 10, rect.top)
    }

    const handleConfirm = () => {
        const correct = value.trim().toLowerCase() === TARGET_PHRASE.trim().toLowerCase()
        if (!correct) {
            setShake(true)
            window.setTimeout(() => setShake(false), 400)
            return
        }
        setSubmitted(true)
        submitAnswer(QUEST_ID, { phrase: value })
    }

    return (
        <QuestShell status={submitted ? 'done' : 'todo'}>
            <PaperPlanes />
            <LetterDebris letters={letters} />

            <div className={styles.layout}>
                <PhonePosts />

                <div className={styles.form}>
                    <p className={styles.formTitle}>Собери фразу из подсказок</p>
                    <input
                        ref={inputRef}
                        className={`${styles.input} ${shake ? styles.inputShake : ''}`}
                        placeholder="впиши слово..."
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onPaste={handlePaste}
                        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                        disabled={submitted}
                    />
                    <p className={styles.hint}>не копируй — вставленные буквы просто рассыпятся</p>

                    {!submitted && (
                        <button className="mobile__btn" onClick={handleConfirm}>подтвердить</button>
                    )}

                    {submitted && <p className={styles.done}>фраза принята</p>}

                    <a className={styles.channelLink} href={CHANNEL_URL} target="_blank" rel="noreferrer">
                        открыть канал →
                    </a>
                </div>
            </div>
        </QuestShell>
    )
}