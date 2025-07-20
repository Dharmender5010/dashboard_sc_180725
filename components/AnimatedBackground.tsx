
import React, { useMemo } from 'react';

export const AnimatedBackground = React.memo(() => {
    const shapes = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => {
            const size = Math.random() * 60 + 20;
            const left = Math.random() * 100;
            const animationDelay = Math.random() * 15;
            const animationDuration = Math.random() * 10 + 15;

            return {
                id: i,
                style: {
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${animationDelay}s`,
                    animationDuration: `${animationDuration}s`,
                }
            };
        });
    }, []);

    return (
        <div className="animated-shapes-container" aria-hidden="true">
            <ul className="h-full w-full relative">
                {shapes.map(shape => <li key={shape.id} style={shape.style as React.CSSProperties}></li>)}
            </ul>
        </div>
    );
});
