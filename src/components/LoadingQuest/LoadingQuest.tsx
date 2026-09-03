import { useRef, useState } from 'react'
import QuestShell from '../QuestShell.tsx'
import LoadingBar from './LoadingBar.tsx'
import { useLoadingBlocks } from './useLoadingBlocks.ts'
import { buildVerdictLines } from './verdict.ts'
import { submitAnswer } from '../../api/questApi.ts'
import styles from './LoadingQuest.module.css'

type Stage = 'loading' | 'falling' | 'result'

const BLOCK_TYPE = 'application/x-loading-block'
const TOTAL_BLOCKS = 10
const QUEST_ID = 'loading'

export default function LoadingQuest() {
    const [stage, setStage] = useState<Stage>('loading')
    const [placed, setPlaced] = useState(0)
    const [verdict, setVerdict] = useState<string[]>([])
    const areaRef = useRef<HTMLDivElement>(null)
    const { blocks, explode, remove } = useLoadingBlocks()

    const handleExplode = () => {
        const rect = areaRef.current?.getBoundingClientRect()
        explode(TOTAL_BLOCKS, rect ? rect.left + rect.width / 2 : window.innerWidth / 2, rect ? rect.top : 200)
        setStage('falling')
    }

    const handleBlockDragStart = (e: React.DragEvent, id: number) => {
        e.dataTransfer.setData(BLOCK_TYPE, String(id))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleFieldDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const raw = e.dataTransfer.getData(BLOCK_TYPE)
        if (!raw) return
        remove(Number(raw))
        setPlaced(p => {
            const next = p + 1
            if (next >= TOTAL_BLOCKS) {
                const lines = buildVerdictLines()
                setVerdict(lines)
                setStage('result')
                submitAnswer(QUEST_ID, { verdict: lines })
            }
            return next
        })
    }

    return (
        <QuestShell status={stage === 'result' ? 'done' : 'todo'}>
            {stage === 'loading' && (
                <div ref={areaRef}>
                    <LoadingBar onExplode={handleExplode} />
                </div>
            )}

            {stage === 'falling' && (
                <>
                    <div
                        className={styles.field}
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleFieldDrop}
                    >
                        <p className={styles.fieldLabel}>перетащи блоки сюда — {placed}/{TOTAL_BLOCKS}</p>
                    </div>

                    <div className={styles.blocksLayer}>
                        {blocks.map(b => (
                            <div
                                key={b.id}
                                className={styles.block}
                                draggable
                                onDragStart={e => handleBlockDragStart(e, b.id)}
                                style={{
                                    left: b.x,
                                    top: b.y,
                                    transform: `translate(-50%, -50%) rotate(${b.rot}deg)`
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            {stage === 'result' && (
                <div className={styles.verdict}>
                    <p className={styles.verdictTitle}>вот что мы запомнили</p>
                    {verdict.map((line, i) => (
                        <p key={i} className={styles.verdictLine}>{line}</p>
                    ))}
                </div>
            )}
        </QuestShell>
    )
}