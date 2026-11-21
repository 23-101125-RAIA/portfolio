
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CHARSET, FLIPS_PER_CHAR, FLIP_MS, STAGGER_MS } from './preloaderConfig';

const randomChar = (previous) => {
    let char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    while (char === previous) {
        char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return char;
};

const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FlipTile = ({ index, target, delay, onDone }) => {
    const [view, setView] = useState({
        current: ' ',
        next: ' ',
        step: 0
    });

    const doneRef = useRef(onDone);
    doneRef.current = onDone;

    useEffect(() => {
        if (target === null) {
            doneRef.current(index);
            return undefined;
        }

        if (prefersReducedMotion()) {
            setView({ current: target, next: target, step: 0 });
            const timer = setTimeout(() => doneRef.current(index), delay);
            return () => clearTimeout(timer);
        }

        const sequence = [];

        for (let i = 0; i < FLIPS_PER_CHAR; i += 1) {
            sequence.push(randomChar(sequence[i - 1]));
        }

        sequence.push(target);

        let position = 0;
        let previous = ' ';

        let timer = setTimeout(function step() {
            const next = sequence[position];

            setView({
                current: previous,
                next,
                step: position + 1
            });

            previous = next;
            position += 1;

            timer = setTimeout(
                position < sequence.length
                    ? step
                    : () => doneRef.current(index),
                FLIP_MS
            );
        }, delay);

        return () => clearTimeout(timer);
    }, [index, target, delay]);

    if (target === null) {
        return <span className="flip-tile is-unused" />;
    }

    return (
        <span className="flip-tile">
            <span className="flip-half flip-half--top">
                <span className="flip-char">{view.next}</span>
            </span>

            <span className="flip-half flip-half--bottom">
                <span className="flip-char">{view.current}</span>
            </span>

            {view.step > 0 && (
                <>
                    <span key={`front-${view.step}`} className="flip-flap flip-flap--front">
                        <span className="flip-char">{view.current}</span>
                    </span>

                    <span key={`back-${view.step}`} className="flip-flap flip-flap--back">
                        <span className="flip-char">{view.next}</span>
                    </span>
                </>
            )}
        </span>
    );
};

const FlipRow = ({
    text = '',
    slots = 0,
    tone,
    startDelay = 0,
    className = '',
    onDone
}) => {
    const finishedTiles = useRef(new Set());
    const finishedRow = useRef(false);
    const onDoneRef = useRef(onDone);

    onDoneRef.current = onDone;

    const handleTileDone = useCallback(
        (index) => {
            finishedTiles.current.add(index);

            if (!finishedRow.current && finishedTiles.current.size === slots) {
                finishedRow.current = true;
                onDoneRef.current?.();
            }
        },
        [slots]
    );

    const padLeft = Math.floor((slots - text.length) / 2);

    return (
        <div className={`flip-row flip-row--${tone} ${className}`} aria-hidden="true">
            {Array.from({ length: slots }, (_, i) => {
                const position = i - padLeft;
                const inside = position >= 0 && position < text.length;

                return (
                    <FlipTile
                        key={i}
                        index={i}
                        target={inside ? text[position] : null}
                        delay={startDelay + Math.max(position, 0) * STAGGER_MS}
                        onDone={handleTileDone}
                    />
                );
            })}
        </div>
    );
};

export default FlipRow;
