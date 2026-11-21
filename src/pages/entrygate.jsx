import React, { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import ticketLeft from '../asserts/imgs/ticket-left.png';
import ticketRight from '../asserts/imgs/ticketright.png';
import './entrygate.css';
import '../genarel.css';

gsap.registerPlugin(Draggable);

const HINT = '— Drag across the perforated edge to unseal the gallery —';
const PIVOT = '63.5% 89%';
const TEAR_DISTANCE = 150;
const TEAR_THRESHOLD = 0.45;

const Entrygate = () => {
    const navigate = useNavigate();
    const rootRef = useRef(null);
    const ticketRef = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const textRef = useRef(null);
    const charsRef = useRef(null);
    const cursorRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const chars = charsRef.current.querySelectorAll('.entrygate-char');

            gsap.set([leftRef.current, rightRef.current], { transformOrigin: PIVOT });

            const nudge = gsap.timeline({ repeat: -1, repeatDelay: 1.8, paused: true });
            nudge
                .to(rightRef.current, { x: 8, rotation: 1.2, duration: 0.3, ease: 'power2.out' })
                .to(rightRef.current, { x: 0, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });

            const intro = gsap.timeline({ onComplete: () => nudge.play() });
            intro
                .fromTo(
                    ticketRef.current,
                    { y: 260, opacity: 0, filter: 'sepia(1) blur(10px)' },
                    {
                        y: 0,
                        opacity: 1,
                        filter: 'sepia(0) blur(0px)',
                        duration: 2.8,
                        ease: 'power2.out',
                        clearProps: 'filter'
                    }
                )
                .fromTo(cursorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 }, '-=0.6')
                .from(chars, { opacity: 0, duration: 0.01, stagger: 0.055, ease: 'none' })
                .to(cursorRef.current, { opacity: 0, duration: 0.6, delay: 0.8 });

            const finish = () => {
                const out = gsap.timeline({ onComplete: () => navigate('/preloader') });
                out
                    .to(rightRef.current, {
                        x: '+=460',
                        y: '+=280',
                        rotation: 36,
                        opacity: 0,
                        duration: 1,
                        ease: 'power2.in'
                    })
                    .to(leftRef.current, { x: -24, rotation: -2, duration: 0.6, ease: 'power2.out' }, 0)
                    .to(ticketRef.current, { scale: 1.06, duration: 1, ease: 'power2.inOut' }, 0.3)
                    .to(rootRef.current, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0.8);
            };

            Draggable.create(rightRef.current, {
                type: 'x',
                bounds: { minX: 0, maxX: TEAR_DISTANCE },
                cursor: 'grab',
                activeCursor: 'grabbing',
                onPress: () => {
                    nudge.pause(0);
                    intro.progress(1);
                    gsap.to(textRef.current, { opacity: 0, duration: 0.4 });
                },
                onDrag: function () {
                    const p = this.x / TEAR_DISTANCE;
                    gsap.set(rightRef.current, { rotation: p * 12 });
                    gsap.set(leftRef.current, { rotation: p * -2, x: p * -8 });
                },
                onRelease: function () {
                    if (this.x / TEAR_DISTANCE >= TEAR_THRESHOLD) {
                        this.disable();
                        finish();
                        return;
                    }
                    gsap.to(rightRef.current, { x: 0, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' });
                    gsap.to(leftRef.current, { x: 0, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' });
                    gsap.to(textRef.current, { opacity: 1, duration: 0.6, delay: 0.4 });
                    nudge.restart();
                }
            });
        }, rootRef);

        return () => ctx.revert();
    }, [navigate]);

    return (
        <div className="bk entrygate" ref={rootRef}>
            <div className="entrygate-ticket" ref={ticketRef}>
                <img className="entrygate-left" ref={leftRef} src={ticketLeft} alt="Digital portfolio ticket" draggable={false} />
                <img className="entrygate-right" ref={rightRef} src={ticketRight} alt="Tear to enter" draggable={false} />
            </div>
            <p className="entrygate-text" ref={textRef}>
                <span ref={charsRef}>
                    {[...HINT].map((char, i) => (
                        <span className="entrygate-char" key={i}>
                            {char}
                        </span>
                    ))}
                </span>
                <span className="entrygate-cursor" ref={cursorRef} />
            </p>
        </div>
    );
};

export default Entrygate;