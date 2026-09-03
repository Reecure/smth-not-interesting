const DROP_COUNT = 60

const drops = Array.from({ length: DROP_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 1.2 + Math.random() * 1.3,
    height: 40 + Math.random() * 60,
    opacity: 0.15 + Math.random() * 0.3
}))

export default function RainBackground() {
    return (
        <div className="rain-bg">
            <div className="rain-bg__blob rain-bg__blob--a" />
            <div className="rain-bg__blob rain-bg__blob--b" />
            <div className="rain-bg__blob rain-bg__blob--c" />
            <div className="rain-bg__drops">
                {drops.map(d => (
                    <span
                        key={d.id}
                        className="rain-drop"
                        style={{
                            left: `${d.left}%`,
                            height: `${d.height}px`,
                            opacity: d.opacity,
                            animationDelay: `${d.delay}s`,
                            animationDuration: `${d.duration}s`
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
