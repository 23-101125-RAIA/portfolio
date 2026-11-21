
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const lineX = (y) => 1153 - 0.0594 * (y - 192);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

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
    const [dragging, setDragging] = useState(false);

    const wrapRef = useRef(null);
    const dragRef = useRef(null);
    const frameRef = useRef(0);
    const progressRef = useRef(0);

    progressRef.current = progress;

    const stop = () => cancelAnimationFrame(frameRef.current);

    const tween = useCallback((from, to, duration, setter, done) => {
        stop();

        const start = performance.now();

        const step = (now) => {
            const k = clamp((now - start) / duration, 0, 1);

            setter(from + (to - from) * ease(k));

            if (k < 1) {
                frameRef.current = requestAnimationFrame(step);
            } else if (done) {
                done();
            }
        };

        frameRef.current = requestAnimationFrame(step);
    }, []);

    const finish = useCallback(() => {
        tween(progressRef.current, 1, 260, setProgress, () => {
            tween(0, 1, 1000, setFly, () => onTear?.());
        });
    }, [tween, onTear]);

    const springBack = useCallback(() => {
        tween(progressRef.current, 0, 450, setProgress, () => onGrab?.(false));
    }, [tween, onGrab]);

    useEffect(() => stop, []);

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
            drag.moved = true;
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

    const flyTransform = `translate(${fly * 300} ${fly * 870}) rotate(${fly * 38} ${lineX(BOTTOM)} ${BOTTOM})`;

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

                <g
                    style={{ opacity: torn ? 1 - fly * fly : 1 }}
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
