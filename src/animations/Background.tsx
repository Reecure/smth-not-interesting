import { Lottie } from 'lottie-react';

import bg from '../assets/bg.json';

type Props = {
    className?: string;
    onComplete?: () => void;
};

export const Background = ({ className, onComplete }: Props) => (
    <div className={className}>
        <Lottie
            src={bg}
            autoplay
            subscriptions={{ complete: () => onComplete?.() }}
        />
    </div>
);

export default Background;