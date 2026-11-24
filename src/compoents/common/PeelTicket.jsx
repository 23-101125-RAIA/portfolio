import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import tearSound from '../../assets/audio/tanweraman-paper-rip-fast-252617.mp3';
import './PeelTicket.css';

const W = 2000;
const H = 2000;
const TOP = 61;
const BOTTOM = 958;
const STRIPS = 28;
const STRIP_H = (BOTTOM - TOP) / STRIPS;
const PULL_RANGE = 450;
const BEND_RANGE = 280;
const TEAR_POINT = 0.55;
const FLY_MS = 750;
const LEFT_FALL_MS = 850;
const TEAR_NOTIFY_MS = 700;

const lineX = (y) => 1153 - 0.0594 * (y - 192);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const linear = (t) => t;

const STUB_CENTER_X = (lineX(BOTTOM) + W) / 2;
const STUB_CENTER_Y = (TOP + BOTTOM) / 2;
const LEFT_CENTER_X = lineX(BOTTOM) / 2;
const LEFT_CENTER_Y = (TOP + BOTTOM) / 2;

const makeEdge = () => {
    const points = [];
    let seed = 7;

    const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };

    for (let y = TOP; y <= BOTTOM + 0.01; y += 5) {
        points.push([lineX(y) + (random() - 0.5) * 7, y]);
    }

    return points;
};

const PeelTicket = ({ src, alt, onGrab, onTear }) => {
    const edge = useMemo(makeEdge, []);

    const [progress, setProgress] = useState(0);
    const [fly, setFly] = useState(0);
    const [leftFall, setLeftFall] = useState(0);
    const [dragging, setDragging] = useState(false);

    const wrapRef = useRef(null);
    const dragRef = useRef(null);
    const framesRef = useRef({});
    const progressRef = useRef(0);
    const soundRef = useRef(null);
    const tearTimerRef = useRef(null);

    progressRef.current = progress;

    useEffect(() => {
        soundRef.current = new Audio(tearSound);
        soundRef.current.loop = false;
        soundRef.current.preload = 'auto';

        return () => {
            if (soundRef.current) {
                soundRef.current.pause();
                soundRef.current = null;
            }
        };
    }, []);

    const playSound = useCallback(() => {
        const audio = soundRef.current;

        if (!audio || !audio.paused || audio.ended) return;

        audio.play().catch((error) => {
            console.error('Unable to play tearing sound:', error);
        });
    }, []);

    const pauseSound = useCallback(() => {
        const audio = soundRef.current;

        if (audio && !audio.paused) {
            audio.pause();
        }
    }, []);

    const stopSound = useCallback(() => {
        const audio = soundRef.current;

        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, []);

    const stop = () => Object.values(framesRef.current).forEach((id) => cancelAnimationFrame(id));

    const tween = useCallback((from, to, duration, setter, done, key = 'main', easing = ease) => {
        cancelAnimationFrame(framesRef.current[key]);

        const start = performance.now();

        const step = (now) => {
            const k = clamp((now - start) / duration, 0, 1);

            setter(from + (to - from) * easing(k));

            if (k < 1) {
                framesRef.current[key] = requestAnimationFrame(step);
            } else if (done) {
                done();
            }
        };

        framesRef.current[key] = requestAnimationFrame(step);
    }, []);

    const finish = useCallback(() => {
        pauseSound();

        tween(progressRef.current, 1, 200, setProgress, () => {
            stopSound();

            tearTimerRef.current = setTimeout(() => onTear?.(), TEAR_NOTIFY_MS);

            tween(0, 1, FLY_MS, setFly, null, 'fly', linear);
            tween(0, 1, LEFT_FALL_MS, setLeftFall, null, 'left', linear);
        });
    }, [tween, onTear, pauseSound, stopSound]);

    const springBack = useCallback(() => {
        pauseSound();

        tween(progressRef.current, 0, 450, setProgress, () => onGrab?.(false));
    }, [tween, onGrab, pauseSound]);

    useEffect(() => {
        return () => {
            stop();
            stopSound();
            clearTimeout(tearTimerRef.current);
        };
    }, [stopSound]);

    const toImage = (e) => {
        const rect = wrapRef.current.getBoundingClientRect();
        const scale = rect.width / W;

        return {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale + 150,
            scale
        };
    };

    const handleDown = (e) => {
        if (fly > 0) return;

        const point = toImage(e);

        if (point.x < lineX(point.y) || point.y < 0 || point.y > H) return;

        stop();

        wrapRef.current.setPointerCapture(e.pointerId);

        dragRef.current = {
            x: e.clientX,
            y: e.clientY,
            scale: point.scale,
            start: progressRef.current,
            moved: false
        };

        setDragging(true);
        onGrab?.(true);
    };

    const handleMove = (e) => {
        const drag = dragRef.current;

        if (!drag) return;

        const dx = (e.clientX - drag.x) / drag.scale;
        const dy = (e.clientY - drag.y) / drag.scale;

        if (Math.abs(dx) + Math.abs(dy) > 4) {
            if (!drag.moved) {
                drag.moved = true;
            }

            playSound();
        }

        setProgress(
            clamp(drag.start + (dx * 0.9 + dy * 0.55) / PULL_RANGE, 0, 1)
        );
    };

    const handleUp = () => {
        const drag = dragRef.current;

        dragRef.current = null;
        setDragging(false);

        if (!drag) return;

        pauseSound();

        if (!drag.moved || progressRef.current > TEAR_POINT) {
            finish();
        } else {
            springBack();
        }
    };

    const hinge = TOP + progress * (BOTTOM - TOP);
    const torn = fly > 0;

    const stripClip = (i) => {
        const y0 = TOP + i * STRIP_H;
        const y1 = i === STRIPS - 1 ? H : TOP + (i + 1) * STRIP_H + 1.5;
        const yStart = i === 0 ? 0 : y0;

        const inside = edge.filter(
            ([, y]) => y >= y0 - 5 && y <= y1 + 5
        );

        const points = inside.map(([x, y]) => [
            x,
            clamp(y, yStart, y1)
        ]);

        if (i === 0) points.unshift([lineX(TOP), 0]);
        if (i === STRIPS - 1) points.push([lineX(BOTTOM), H]);

        return [
            ...points.map(([x, y]) => `${x},${y}`),
            `${W},${y1}`,
            `${W},${yStart}`
        ].join(' ');
    };

    const strips = useMemo(
        () => Array.from({ length: STRIPS }, (_, i) => stripClip(i)),
        [edge]
    );

    const renderStrip = (s) => {
        const jointY = TOP + s * STRIP_H;
        const jointX = lineX(jointY);

        const angle = 1.8 * progress * clamp(
            (hinge - jointY) / BEND_RANGE,
            0,
            1
        );

        return (
            <g key={s}>
                <image
                    href={src}
                    width={W}
                    height={H}
                    clipPath={`url(#peel-strip-${s})`}
                />

                {s > 0 && (
                    <g transform={`rotate(${angle} ${jointX} ${jointY})`}>
                        {renderStrip(s - 1)}
                    </g>
                )}
            </g>
        );
    };

    const flySway = Math.sin(fly * Math.PI * 2.2);

    const flyTransform = [
        `translate(${flySway * 110} ${fly * fly * 1300})`,
        `rotate(${flySway * 26} ${STUB_CENTER_X} ${STUB_CENTER_Y})`
    ].join(' ');

    const flyOpacity = 1 - clamp((fly - 0.85) / 0.15, 0, 1);

    const leftGravity = leftFall * leftFall;
    const leftTilt = Math.pow(leftFall, 1.6);

    const leftTransform = [
        `translate(${-leftGravity * 140} ${leftGravity * 1800})`,
        `rotate(${-leftTilt * 38} ${LEFT_CENTER_X} ${LEFT_CENTER_Y})`
    ].join(' ');

    const leftOpacity = 1 - clamp((leftFall - 0.9) / 0.1, 0, 1);

    const tornEdge = edge
        .filter(([, y]) => y <= hinge)
        .map(([x, y]) => `${x},${y}`)
        .join(' ');

    const mainClip = [
        '0,0',
        `${lineX(TOP) + 2},0`,
        ...edge.map(([x, y]) => `${x + 2},${y}`),
        `${lineX(BOTTOM) + 2},${H}`,
        `0,${H}`
    ].join(' ');

    return (
        <div
            ref={wrapRef}
            className={`peel${dragging ? ' is-dragging' : ''}`}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            role="img"
            aria-label={alt}
        >
            <svg viewBox="0 500 2000 1100" width="100%" height="100%">
                <defs>
                    <clipPath id="peel-main">
                        <polygon points={mainClip} />
                    </clipPath>

                    {strips.map((points, i) => (
                        <clipPath id={`peel-strip-${i}`} key={i}>
                            <polygon points={points} />
                        </clipPath>
                    ))}

                    <filter
                        id="peel-shadow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="8"
                            stdDeviation="11"
                            floodColor="#3d2a10"
                            floodOpacity="0.45"
                        />
                    </filter>
                </defs>

                <g
                    opacity={leftFall > 0 ? leftOpacity : 1}
                    transform={leftFall > 0 ? leftTransform : undefined}
                >
                    <image
                        href={src}
                        width={W}
                        height={H}
                        clipPath="url(#peel-main)"
                    />

                    {progress > 0 && (
                        <polyline
                            points={tornEdge}
                            fill="none"
                            stroke="#FFF3DA"
                            strokeWidth="4"
                            strokeLinejoin="round"
                            opacity="0.85"
                        />
                    )}
                </g>

                <g
                    opacity={torn ? flyOpacity : 1}
                    filter={progress > 0.02 ? 'url(#peel-shadow)' : undefined}
                    transform={torn ? flyTransform : undefined}
                >
                    {renderStrip(STRIPS - 1)}
                </g>
            </svg>
        </div>
    );
};

export default PeelTicket;