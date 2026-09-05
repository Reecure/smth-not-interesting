import { useCallback, useRef, useState } from 'react'
import {
    type Board,
    type Item,
    type Slot,
    REELS,
    SPIN_COST,
    START_COINS,
    emptyBoard,
    rollItem,
    sellPrice,
} from './casino.ts'

export function useCasino() {
    const [coins, setCoins] = useState(START_COINS)
    const [board, setBoard] = useState<Board>(emptyBoard)
    const [spinning, setSpinning] = useState<Slot | null>(null)
    const [toast, setToast] = useState('')
    const [spins, setSpins] = useState(0)
    const toastTimer = useRef<number | undefined>(undefined)

    const say = useCallback((text: string) => {
        setToast(text)
        if (toastTimer.current) window.clearTimeout(toastTimer.current)
        toastTimer.current = window.setTimeout(() => setToast(''), 2400)
    }, [])

    const spin = useCallback(
        (slot: Slot) => {
            if (spinning || !REELS[slot].spinnable) return
            if (coins < SPIN_COST) {
                say('монет не хватает')
                return
            }
            setCoins(c => c - SPIN_COST)
            setSpinning(slot)
            setSpins(n => n + 1)

            window.setTimeout(() => {
                const item = rollItem(slot)
                setBoard(b => ({ ...b, [slot]: item }))
                setSpinning(null)
                if (item.price === 0) say('ну, тоже вариант')
            }, 1300)
        },
        [coins, spinning, say]
    )

    const buy = useCallback(
        (slot: Slot, item: Item) => {
            if (spinning) return
            if (coins < item.price) {
                say('дорого')
                return
            }

            if (slot === 'cat') {
                setBoard(b => {
                    if (b.cats.some(c => c.id === item.id)) return b
                    const next = [...b.cats, item]
                    if (next.length === 3) say('все три. смело')
                    else if (next.length === 2) say('второй? ну ладно')
                    return { ...b, cats: next }
                })
                setCoins(c => c - item.price)
                return
            }

            setCoins(c => c - item.price)
            setBoard(b => ({ ...b, [slot]: item }))
        },
        [coins, spinning, say]
    )

    const sell = useCallback(
        (slot: Slot, itemId?: string) => {
            if (slot === 'cat') {
                const cat = board.cats.find(c => c.id === itemId)
                if (!cat) return
                setCoins(c => c + sellPrice(cat))
                setBoard(b => ({ ...b, cats: b.cats.filter(x => x.id !== cat.id) }))
                say('кота вернули в приют')
                return
            }

            const item = board[slot as 'food']
            if (!item) return
            const back = sellPrice(item)
            setCoins(c => c + back)
            setBoard(b => {
                const next = { ...b }
                delete next[slot as 'food']
                return next
            })
            if (back === 0) say('за это никто ничего не даст')
        },
        [board, say]
    )

    const addCoins = useCallback((n: number) => setCoins(c => c + n), [])
    const takeCoins = useCallback((n: number) => setCoins(c => Math.max(0, c - n)), [])

    return {
        coins,
        board,
        spinning,
        toast,
        spins,
        spin,
        buy,
        sell,
        addCoins,
        takeCoins,
        say,
        reels: REELS,
    }
}