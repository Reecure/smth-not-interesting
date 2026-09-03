import { CRATE_LANDED_TYPE } from './dnd.ts'

type Props = {
    filled: number
    total: number
    onDropCrate: (crateId: string) => void
}

export default function DropZone({ filled, total, onDropCrate }: Props) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const crateId = e.dataTransfer.getData(CRATE_LANDED_TYPE)
        if (crateId) onDropCrate(crateId)
    }

    return (
        <div
            className="dropzone dropzone--puddle"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
        >
            <p className="dropzone__label">{filled}/{total}</p>
            <div className="dropzone__pips">
                {Array.from({ length: total }).map((_, i) => (
                    <span key={i} className={`pip ${i < filled ? 'pip--filled' : ''}`}>{i < filled ? '🦆' : ''}</span>
                ))}
            </div>
        </div>
    )
}
