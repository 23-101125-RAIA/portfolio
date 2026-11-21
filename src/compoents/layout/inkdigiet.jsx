import React, { useEffect, useRef } from 'react';
import './inkdigiet.css';

const InkDigit = ({ children }) => {
  const ref = useRef(null);
  const sim = useRef({
    y: 0,
    target: 0,
    phase: 0,
    drift: 0,
    amp: 18,
    last: 0,
    lastX: null,
    hover: false,
    raf: 0,
  });

  const restLevel = () => (ref.current ? ref.current.offsetHeight + 120 : 0);

  const tick = (now) => {
    const el = ref.current;
    const s = sim.current;
    if (!el) return;

    const dt = s.last ? Math.min((now - s.last) / 16.67, 3) : 1;
    s.last = now;

    const ease = s.hover ? 0.035 : 0.02;
    const k = 1 - Math.pow(1 - ease, dt);
    const before = s.y;
    s.y += (s.target - s.y) * k;

    const speed = Math.abs(s.y - before) / Math.max(dt, 0.01);
    s.amp += (18 + Math.min(speed * 1.5, 14) - s.amp) * 0.05;
    s.drift *= Math.pow(0.97, dt);
    s.phase += (0.35 + s.drift) * dt;

    el.style.setProperty('--lv', `${s.y}px`);
    el.style.setProperty('--amp', `${s.amp}px`);
    el.style.setProperty('--ph', `${s.phase}px`);

    if (!s.hover && Math.abs(s.target - s.y) < 0.5) {
      s.raf = 0;
      s.last = 0;
      return;
    }
    s.raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!sim.current.raf) sim.current.raf = requestAnimationFrame(tick);
  };

  useEffect(() => {
    sim.current.y = restLevel();
    sim.current.target = sim.current.y;
    return () => cancelAnimationFrame(sim.current.raf);
  }, []);

  const enter = (e) => {
    const s = sim.current;
    const rect = ref.current.getBoundingClientRect();
    s.hover = true;
    s.target = e.clientY - rect.top;
    s.lastX = e.clientX;
    start();
  };

  const move = (e) => {
    const s = sim.current;
    const rect = ref.current.getBoundingClientRect();
    s.target = e.clientY - rect.top;
    if (s.lastX !== null) s.drift += (e.clientX - s.lastX) * 0.05;
    s.lastX = e.clientX;
    start();
  };

  const leave = () => {
    const s = sim.current;
    s.hover = false;
    s.lastX = null;
    s.target = restLevel();
    start();
  };

  return (
    <span
      ref={ref}
      className="ink-digit"
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
    </span>
  );
};

export default InkDigit;