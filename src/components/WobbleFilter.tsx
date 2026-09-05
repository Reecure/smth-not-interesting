export default function WobbleFilter() {
    return (
        <svg className="wobble-defs" aria-hidden="true" focusable="false">
            <defs>
                <filter id="wobble" x="-25%" y="-25%" width="150%" height="150%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.02 0.035"
                        numOctaves="2"
                        seed="7"
                        result="noise"
                    >
                        <animate
                            attributeName="baseFrequency"
                            dur="14s"
                            values="0.02 0.035; 0.035 0.02; 0.02 0.035"
                            repeatCount="indefinite"
                        />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="7"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                <filter id="wobble-strong" x="-30%" y="-30%" width="160%" height="160%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.03 0.05"
                        numOctaves="3"
                        seed="19"
                        result="noise2"
                    >
                        <animate
                            attributeName="baseFrequency"
                            dur="5s"
                            values="0.03 0.05; 0.06 0.025; 0.03 0.05"
                            repeatCount="indefinite"
                        />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise2"
                        scale="13"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>
    )
}