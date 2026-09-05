import { type Item, type Slot, sellPrice } from './casino.ts'
import styles from './StoryQuest.module.css'

type Props = {
    slot: Slot
    title: string
    items: Item[]
    spinnable: boolean
    multi?: boolean
    picked?: Item
    owned?: Item[]
    spinning: boolean
    coins: number
    spinCost: number
    onSpin: () => void
    onBuy: (item: Item) => void
    onSell: (itemId?: string) => void
}

export default function Reel({
                                 title,
                                 items,
                                 spinnable,
                                 multi,
                                 picked,
                                 owned = [],
                                 spinning,
                                 coins,
                                 spinCost,
                                 onSpin,
                                 onBuy,
                                 onSell,
                             }: Props) {
    const strip = [...items, ...items, ...items, ...items]
    const forSale = items.filter(i => i.price > 0)
    const done = multi ? owned.length > 0 : !!picked

    if (multi) {
        return (
            <div className={`${styles.reel} ${done ? styles.reelDone : ''}`}>
                <p className={styles.reelTitle}>
                    {title} · {owned.length}/{items.length}
                </p>

                <div className={styles.catList}>
                    {items.map(item => {
                        const has = owned.some(o => o.id === item.id)
                        return (
                            <div
                                key={item.id}
                                className={`${styles.catRow} ${has ? styles.catRowOwned : ''}`}
                            >
                                <span
                                    className={styles.catDot}
                                    style={{ background: item.color }}
                                />
                                <span className={styles.catName}>{item.label}</span>
                                {has ? (
                                    <button
                                        className={styles.catSell}
                                        onClick={() => onSell(item.id)}
                                    >
                                        −{sellPrice(item)}
                                    </button>
                                ) : (
                                    <button
                                        className={styles.catBuy}
                                        onClick={() => onBuy(item)}
                                        disabled={coins < item.price}
                                    >
                                        {item.price}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                <p className={styles.catHint}>
                    {owned.length === 0 && 'нужен хотя бы один'}
                    {owned.length === 1 && 'можно взять ещё'}
                    {owned.length === 2 && 'третий тоже свободен'}
                    {owned.length === 3 && 'больше нет'}
                </p>
            </div>
        )
    }

    return (
        <div className={`${styles.reel} ${done ? styles.reelDone : ''}`}>
            <p className={styles.reelTitle}>{title}</p>

            <div className={styles.window}>
                {spinning ? (
                    <div className={styles.strip}>
                        {strip.map((it, i) => (
                            <span key={i} className={styles.stripItem}>
                                {it.label}
                            </span>
                        ))}
                    </div>
                ) : picked ? (
                    <div className={styles.result}>
                        <span className={styles.resultLabel}>{picked.label}</span>
                        <span className={styles.resultPrice}>
                            {'★'.repeat(picked.score) || 'ничего'}
                        </span>
                    </div>
                ) : (
                    <span className={styles.empty}>—</span>
                )}
            </div>

            <div className={styles.reelActions}>
                {picked ? (
                    <button className={styles.sellBtn} onClick={() => onSell()}>
                        продать за {sellPrice(picked)}
                    </button>
                ) : spinnable ? (
                    <button
                        className={styles.spinBtn}
                        onClick={onSpin}
                        disabled={spinning || coins < spinCost}
                    >
                        крутить · {spinCost}
                    </button>
                ) : (
                    <span className={styles.noSpin}>—</span>
                )}
            </div>

            {!picked && (
                <div className={styles.shop}>
                    {forSale.map(item => (
                        <button
                            key={item.id}
                            className={styles.shopItem}
                            onClick={() => onBuy(item)}
                            disabled={coins < item.price || spinning}
                        >
                            <span>{item.label}</span>
                            <b>{item.price}</b>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}