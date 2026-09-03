export type DuckSeed = {
    id: string
    x: number
    y: number
    amp: number
    dur: number
    delay: number
    flip: boolean
}

const POSITIONS = [
    { x: 22, y: 42 },
    { x: 42, y: 68 },
    { x: 62, y: 30 },
    { x: 78, y: 58 },
    { x: 50, y: 18 }
]

export function makeDuckSeed(index: number): DuckSeed {
    const base = POSITIONS[index % POSITIONS.length]
    return {
        id: `duck-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x: base.x,
        y: base.y,
        amp: 22 + ((index * 7) % 26),
        dur: 8 + ((index * 1.7) % 5),
        delay: -((index * 1.9) % 6),
        flip: index % 2 === 0
    }
}