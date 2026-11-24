import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeMusic, suspendMusic } from '../compoents/common/bgMusic';
import FlipRow from '../compoents/layout/FlipRow';
import {
    BOTTOM_START_MS,
    HOLD_MS,
    SLOT_COUNT,
    TOP_START_MS,
    TOP_TEXT
} from '../compoents/layout/preloaderConfig';

import leftDecoration from '../assets/imgs/left-decoration.png';
import rightDecoration from '../assets/imgs/right-decoration.png';
import preloaderCenter from '../assets/imgs/preloader-center.png';
import flipSound from '../assets/audio/luxury_vintage_typography_reveal.wav';

import './Preloader.css';

const GALLERY_NAME = 'GALLERY';
const GALLERY_PATH = '/gallery';

const Preloader = ({
    name = GALLERY_NAME,
    leaving,
    onComplete,
    onExited
}) => {
    const navigate = useNavigate();
    const [exiting, setExiting] = useState(false);
    const finishedRows = useRef(0);
    const timerRef = useRef(null);
    const soundTimerRef = useRef(null);
    const audioRef = useRef(null);
    const standalone = !onComplete;

    useLayoutEffect(() => {
        const root = document.getElementById('root');

        if (!root) {
            return undefined;
        }

        root.style.scrollBehavior = 'auto';
        root.scrollTop = 0;

        return () => {
            root.style.scrollBehavior = '';
        };
    }, []);
useEffect(() => {
    suspendMusic();
    return () => resumeMusic();
}, []);
    useEffect(() => {
        const audio = new Audio(flipSound);
        audio.preload = 'auto';
        audio.loop = false;
        audioRef.current = audio;

        soundTimerRef.current = setTimeout(() => {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }, TOP_START_MS);

        return () => {
            clearTimeout(timerRef.current);
            clearTimeout(soundTimerRef.current);
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    const handleRowDone = useCallback(() => {
        finishedRows.current += 1;

        if (finishedRows.current === 2) {
            timerRef.current = setTimeout(
                standalone ? () => setExiting(true) : onComplete,
                HOLD_MS
            );
        }
    }, [onComplete, standalone]);

    const handleAnimationEnd = (event) => {
        if (
            event.target === event.currentTarget &&
            event.animationName === 'preloader-out'
        ) {
            if (standalone) {
                navigate(GALLERY_PATH, { replace: true });
            } else {
                onExited();
            }
        }
    };

    return (
        <div
            className={`preloader${leaving || exiting ? ' is-leaving' : ''}`}
            role="status"
            aria-live="polite"
            aria-label={`${TOP_TEXT} ${name}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <img
                className="preloader-left"
                src={leftDecoration}
                alt=""
                draggable={false}
            />

            <img
                className="preloader-right"
                src={rightDecoration}
                alt=""
                draggable={false}
            />

            <div className="preloader-center">
                <img
                    className="preloader-center-image"
                    src={preloaderCenter}
                    alt=""
                    draggable={false}
                />

                <FlipRow
                    className="preloader-row preloader-row--top"
                    text={TOP_TEXT}
                    slots={TOP_TEXT.length}
                    tone="light"
                    startDelay={TOP_START_MS}
                    onDone={handleRowDone}
                />

                <FlipRow
                    className="preloader-row preloader-row--bottom"
                    text={name}
                    slots={SLOT_COUNT}
                    tone="dark"
                    startDelay={BOTTOM_START_MS}
                    onDone={handleRowDone}
                />
            </div>
        </div>
    );
};

export default Preloader;