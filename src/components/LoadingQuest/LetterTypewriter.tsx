import { useEffect, useRef, useState } from 'react'
import styles from './LoadingQuest.module.css'

type Props = {
    text: string
    troll: [string, string][]
    onDone?: () => void
}

const TYPE_MS = 26
const ERASE_MS = 34
const HOLD_MS = 520

export default function LetterTypewriter({ text, troll, onDone }: Props) {
    const [shown, setShown] = useState('')
    const [busy, setBusy] = useState(true)
    const timers = useRef<number[]>([])
    const startedRef = useRef(false)

    useEffect(() => {
        return () => timers.current.forEach(t => window.clearTimeout(t))
    }, [])

    useEffect(() => {
        if (startedRef.current) return
        startedRef.current = true

        const trollMap = new Map(troll.map(([userWord, original]) => [userWord, original]))
        let out = ''
        let queue: (() => void)[] = []

        const wait = (ms: number) =>
            new Promise<void>(res => timers.current.push(window.setTimeout(res, ms)))

        const typeChunk = async (chunk: string, speed = TYPE_MS) => {
            for (const ch of chunk) {
                out += ch
                setShown(out)
                await wait(speed)
            }
        }

        const eraseChars = async (n: number) => {
            for (let i = 0; i < n; i++) {
                out = out.slice(0, -1)
                setShown(out)
                await wait(ERASE_MS)
            }
        }

        const run = async () => {
            const words = text.split(/(\s+)/)
            for (const word of words) {
                const clean = word.trim()
                const original = clean ? trollMap.get(clean) : undefined

                if (original && original !== clean) {
                    const lead = word.match(/^\s*/)?.[0] ?? ''
                    const trail = word.match(/\s*$/)?.[0] ?? ''
                    await typeChunk(lead + original)
                    await wait(HOLD_MS)
                    await eraseChars(original.length)
                    await typeChunk(clean + trail)
                } else {
                    await typeChunk(word)
                }
            }
            setBusy(false)
            onDone?.()
        }

        run()
        return () => {
            queue = []
        }
    }, [text, troll, onDone])

    return (
        <p className={styles.typewriter}>
            {shown}
            {busy && <span className={styles.caret} />}
        </p>
    )
}