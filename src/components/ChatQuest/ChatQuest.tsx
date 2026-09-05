import { useEffect, useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import LetterDebris from './LetterDebris.tsx'
import { useLetterDebris } from './useLetterDebris.ts'
import FloatingLetters from './FloatingLetters.tsx'
import TypingIndicator from './TypingIndicator.tsx'
import TrollTyping from './TrollTyping.tsx'
import { chatScript, FINAL_GIF_SRC } from './chatScript.ts'
import { useQuestProgress } from '../../api/useQuestProgress.ts'
import styles from './ChatQuest.module.css'

type ChatMessage = {
    id: number
    sender: 'bot' | 'user'
    text: string
}

const TYPING_MIN_MS = 900
const TYPING_PER_CHAR_MS = 85
const PAUSE_AFTER_MS = 650
const TROLL_BASE_MS = 16000
const TROLL_SPEEDUP_MS = 5000

export default function ChatQuest() {
    const { state, saving, saveError, submit, isDone } = useQuestProgress('chat')

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [typing, setTyping] = useState(false)
    const [awaitingReply, setAwaitingReply] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [done, setDone] = useState(false)
    const [trollActive, setTrollActive] = useState(false)
    const [trollRemaining, setTrollRemaining] = useState(0)
    const [trollNote, setTrollNote] = useState<string | null>(null)

    const messagesRef = useRef<ChatMessage[]>([])
    const repliesRef = useRef<string[]>([])
    const stepRef = useRef(0)
    const idRef = useRef(0)
    const areaRef = useRef<HTMLDivElement>(null)
    const startedRef = useRef(false)
    const trollRemainingRef = useRef(0)
    const trollIntervalRef = useRef<number | null>(null)
    const submitRef = useRef(submit)
    const { letters, spawn } = useLetterDebris()

    submitRef.current = submit

    const commit = (next: ChatMessage[]) => {
        messagesRef.current = next
        setMessages(next)
    }

    const pushBot = (text: string) => {
        idRef.current += 1
        commit([...messagesRef.current, { id: idRef.current, sender: 'bot', text }])
    }

    const pushUser = (text: string) => {
        idRef.current += 1
        repliesRef.current = [...repliesRef.current, text]
        commit([...messagesRef.current, { id: idRef.current, sender: 'user', text }])
    }

    const finishTrollTyping = (text: string) => {
        if (trollIntervalRef.current) clearInterval(trollIntervalRef.current)
        setTrollActive(false)
        setTyping(false)
        pushBot(text)
        stepRef.current += 1
        window.setTimeout(runNext, PAUSE_AFTER_MS)
    }

    const startTrollTyping = (text: string) => {
        setTyping(true)
        setTrollActive(true)
        setTrollNote(null)
        trollRemainingRef.current = TROLL_BASE_MS
        setTrollRemaining(TROLL_BASE_MS)

        if (trollIntervalRef.current) clearInterval(trollIntervalRef.current)
        trollIntervalRef.current = window.setInterval(() => {
            trollRemainingRef.current = Math.max(0, trollRemainingRef.current - 100)
            setTrollRemaining(trollRemainingRef.current)
            if (trollRemainingRef.current <= 0) finishTrollTyping(text)
        }, 100)
    }

    const handleSpeedUp = () => {
        trollRemainingRef.current += TROLL_SPEEDUP_MS
        setTrollRemaining(trollRemainingRef.current)
        setTrollNote('ускоряю...')
        window.setTimeout(() => setTrollNote(null), 900)
    }

    const runNext = () => {
        const step = chatScript[stepRef.current]
        if (!step) return

        if (step.kind === 'bot') {
            if (step.troll) {
                startTrollTyping(step.text)
                return
            }
            setTyping(true)
            const delay = Math.max(TYPING_MIN_MS, step.text.length * TYPING_PER_CHAR_MS)
            window.setTimeout(() => {
                setTyping(false)
                pushBot(step.text)
                stepRef.current += 1
                window.setTimeout(runNext, PAUSE_AFTER_MS)
            }, delay)
            return
        }

        if (step.kind === 'reply') {
            setAwaitingReply(true)
            return
        }

        if (step.kind === 'scatter') {
            const rect = areaRef.current?.getBoundingClientRect()
            if (rect) {
                messagesRef.current.forEach((m, i) => {
                    spawn(
                        m.text,
                        rect.left + 20 + (i % 3) * 50,
                        rect.bottom - 30 - i * 22,
                        { spreadX: 10, speedY: 7 }
                    )
                })
            }
            commit([])
            window.setTimeout(() => {
                stepRef.current += 1
                runNext()
            }, 1500)
            return
        }

        if (step.kind === 'final') {
            pushBot(step.text)
            setDone(true)
            submitRef.current({ replies: repliesRef.current, watched: true })
        }
    }

    useEffect(() => {
        if (startedRef.current) return
        startedRef.current = true
        runNext()
        return () => {
            if (trollIntervalRef.current) clearInterval(trollIntervalRef.current)
        }
    }, [])

    const handleReplySubmit = () => {
        if (!inputValue.trim()) return
        pushUser(inputValue.trim())
        setInputValue('')
        setAwaitingReply(false)
        stepRef.current += 1
        window.setTimeout(runNext, PAUSE_AFTER_MS)
    }

    return (
        <QuestShell
            status={done || isDone ? 'done' : 'todo'}
            state={state}
            saving={saving}
            saveError={saveError}
        >
            <FloatingLetters />
            <LetterDebris letters={letters} />

            <div className={styles.chatArea} ref={areaRef}>
                {messages.map(m => (
                    <div
                        key={m.id}
                        className={`${styles.bubble} ${
                            m.sender === 'user' ? styles.bubbleUser : styles.bubbleBot
                        }`}
                    >
                        {m.text}
                    </div>
                ))}
                {typing && !trollActive && <TypingIndicator />}
                {trollActive && (
                    <TrollTyping
                        remainingMs={trollRemaining}
                        note={trollNote}
                        onSpeedUp={handleSpeedUp}
                    />
                )}
            </div>

            {awaitingReply && !done && (
                <div className={styles.replyRow}>
                    <input
                        className={styles.replyInput}
                        placeholder="напиши что-нибудь..."
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleReplySubmit()}
                        autoFocus
                    />
                    <button className={styles.replyBtn} onClick={handleReplySubmit}>
                        отправить
                    </button>
                </div>
            )}

            {done && (
                <div className={styles.finalWrap}>
                    <img className={styles.finalGif} src={FINAL_GIF_SRC} alt="" />
                </div>
            )}
        </QuestShell>
    )
}