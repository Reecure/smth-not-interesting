import React from 'react'
import BackSvg from '../../../assets/back.svg'
import styles from './BackButton.module.css'

interface BackButtonProps {
    onClick?: () => void
    ariaLabel?: string
}

const BackButton: React.FC<BackButtonProps> = ({
                                                   onClick,
                                                   ariaLabel = "Назад"
                                               }) => {
    return (
        <button
            type="button"
            className={styles.backButton}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            <img src={BackSvg} alt="" className={styles.icon} />
        </button>
    )
}

export default BackButton