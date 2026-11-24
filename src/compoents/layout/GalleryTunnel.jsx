import React, { useEffect, useRef, useState } from 'react';
import GalleryFrame from './GalleryFrame';
import VintageButton from '../common/VintageButton';

const DEPTH_GAP = 650;
const SCROLL_SPEED = 1.5;
const SMOOTHING = 0.08;
const SIDE_OFFSET_VW = 27;
const FOCUS_NEAR = 150;
const FOCUS_RANGE = 500;
const MAX_BLUR = 9;
const DIM_OPACITY = 0.45;
const VISIBLE_DISTANCE = 1900;

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const lookAt = (relativeZ) => {
  const focus =
    relativeZ >= -FOCUS_NEAR ? 1 : 1 - clamp01((-relativeZ - FOCUS_NEAR) / FOCUS_RANGE);
  const arriving = clamp01((relativeZ + VISIBLE_DISTANCE) / 500);
  const leaving = clamp01((350 - relativeZ) / 250);
  const blur = (1 - focus) * MAX_BLUR;

  return {
    focus,
    style: {
      opacity: arriving * leaving * (DIM_OPACITY + (1 - DIM_OPACITY) * focus),
      filter: blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none',
    },
  };
};

const splitTitle = (title = '') => {
  const [no, ...rest] = title.split(' / ');
  return rest.length ? { no, name: rest.join(' / ') } : { no: '', name: title };
};

const GalleryTunnel = ({ items, startIndex = 0, onExit }) => {
  const maxDepth = (items.length + 1) * DEPTH_GAP;
  const startDepth = startIndex ? startIndex * DEPTH_GAP + 250 : 0;

  const [depth, setDepth] = useState(startDepth);
  const target = useRef(startDepth);
  const current = useRef(startDepth);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    let frame;
    let lastTouchY = null;

    const move = (delta) => {
      target.current = Math.min(maxDepth, Math.max(0, target.current + delta));
    };

    const onWheel = (e) => {
      e.preventDefault();
      move(e.deltaY * SCROLL_SPEED);
    };

    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) move(DEPTH_GAP / 2);
      if (['ArrowUp', 'PageUp'].includes(e.key)) move(-DEPTH_GAP / 2);
      if (e.key === 'Escape') onExit();
    };

    const onTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      const y = e.touches[0].clientY;
      move((lastTouchY - y) * 3);
      lastTouchY = y;
    };

    const tick = () => {
      current.current += (target.current - current.current) * SMOOTHING;
      if (Math.abs(target.current - current.current) < 0.05) current.current = target.current;
      setDepth(current.current);
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [maxDepth, onExit]);

  const endZ = -(items.length + 1) * DEPTH_GAP;
  const endLook = lookAt(depth + endZ);

  return (
    <div className="gallery-tunnel" role="dialog" aria-label="Gallery walkthrough">
      <div className="gallery-tunnel__scene" style={{ transform: `translate3d(0, 0, ${depth}px)` }}>
        {items.map((item, i) => {
          const z = -(i + 1) * DEPTH_GAP;
          const isRight = i % 2 === 1;
          const { no, name } = splitTitle(item.title);
          const x = `calc(-50% ${isRight ? '+' : '-'} ${SIDE_OFFSET_VW}vw)`;
          const look = lookAt(depth + z);

          return (
            <article
              key={item.gallery_id}
              className={`gallery-tunnel__item ${isRight ? 'is-right' : ''}`}
              style={{ transform: `translate3d(${x}, -50%, ${z}px)`, ...look.style }}
            >
              <GalleryFrame src={item.image_url} alt={item.title} />
              <div className="gallery-tunnel__caption">
                {no && <p className="gallery-tunnel__no">{no}</p>}
                <h2 className="gallery-tunnel__title">{name}</h2>
                {item.subtitle && <p className="gallery-tunnel__subtitle">{item.subtitle}</p>}
                {item.description && <p className="gallery-tunnel__desc">{item.description}</p>}
              </div>
            </article>
          );
        })}

        <div
          className="gallery-tunnel__end"
          style={{
            transform: `translate3d(-50%, -50%, ${endZ}px)`,
            ...endLook.style,
            pointerEvents: endLook.focus > 0.6 ? 'auto' : 'none',
          }}
        >
          <h2 className="gallery-tunnel__title">That&rsquo;s the whole gallery</h2>
          <VintageButton onClick={onExit}>Return to Gallery</VintageButton>
        </div>
      </div>

      <p className="gallery-tunnel__hint">{depth < 200 ? 'Scroll, swipe or press ↓ to walk deeper' : ''}</p>
      <div className="gallery-tunnel__progress">
        <i style={{ width: `${(depth / maxDepth) * 100}%` }} />
      </div>
    </div>
  );
};

export default GalleryTunnel;