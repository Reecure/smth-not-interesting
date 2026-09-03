type Props = {
    onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
    return (
        <div className="stage">
            <button className="mobile__btn" onClick={onStart}>начать</button>
        </div>
    )
}