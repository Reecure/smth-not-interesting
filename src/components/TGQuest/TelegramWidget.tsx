import { useEffect, useRef } from 'react'
import styles from './TelegramQuest.module.css'

type Props = {
    channel: string
    postId: number
}

export default function TelegramWidget({ channel, postId }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return
        containerRef.current.innerHTML = ''

        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-widget.js?22'
        script.async = true
        script.setAttribute('data-telegram-post', `${channel}/${postId}`)
        script.setAttribute('data-width', '100%')
        script.setAttribute('data-dark', '1')

        containerRef.current.appendChild(script)
    }, [channel, postId])

    return <div className={styles.widgetCrop} ref={containerRef} />
}