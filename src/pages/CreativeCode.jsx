import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './CreativeCode.css';
import '../genarel.css';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';
import { supabase } from '../supabaseClient';
import mirrorFrame from '../assets/imgs/mirror-frame.png';
import mirrorArt from '../assets/imgs/mirror-art.jpg';

const PAGE_SLUG = 'mirror-code-experiments';
const WIDTH = 360;
const HEIGHT = 469;

const EFFECTS = {
  vortex: 'Vortex Warp',
  glitch: 'Prism Glitch',
  fog: 'Ethereal Fog',
  shatter: 'Shatter Glass',
  ripple: 'Liquid Ripple',
  burn: 'Parchment Burn',
};
const LEFT_EFFECTS = ['vortex', 'glitch', 'fog'];
const RIGHT_EFFECTS = ['shatter', 'ripple', 'burn'];

const clamp = (value, max) => (value < 0 ? 0 : value > max ? max : value);

const createState = () => ({
  effect: null,
  time: 0,
  dt: 0,
  mx: WIDTH / 2,
  my: HEIGHT / 2,
  tx: WIDTH / 2,
  ty: HEIGHT / 2,
  fall: 0,
  crack: 0,
  burn: 0,
  twist: 0,
  amp: 0,
  fogAlpha: 0,
  flash: 0,
  shards: [],
  rows: new Int16Array(HEIGHT),
  glitchTimer: 0,
  glitchOffset: 6,
  fog: null,
  smoke: null,
  lastWipe: null,
});

const createNoise = () => {
  const noise = new Float32Array(WIDTH * HEIGHT);
  for (let y = 0, i = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++, i++) {
      noise[i] =
        (Math.sin(x * 0.045 + Math.sin(y * 0.031) * 3) +
          Math.sin(y * 0.06 - x * 0.02 + 1.7) +
          Math.sin((x + y) * 0.11) * 0.5 +
          Math.sin(x * 0.17) * Math.sin(y * 0.13) * 0.5) / 3;
    }
  }
  return noise;
};

const createFog = (dense) => {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (dense) {
    ctx.fillStyle = 'rgba(214, 221, 228, 0.42)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  for (let i = 0; i < (dense ? 90 : 40); i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const radius = 50 + Math.random() * 90;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(240, 243, 247, 0.55)');
    gradient.addColorStop(1, 'rgba(240, 243, 247, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  return canvas;
};

const createShards = (originX, originY) => {
  const count = 16;
  const angles = Array.from({ length: count }, (_, i) => ((i + Math.random() * 0.7) / count) * Math.PI * 2);
  const rings = [0, 45, 110, 210, 320, 1200].map((radius, ring) =>
    angles.map((angle) => {
      const jitter = ring ? 0.8 + Math.random() * 0.4 : 0;
      return [originX + Math.cos(angle) * radius * jitter, originY + Math.sin(angle) * radius * jitter];
    })
  );
  const shards = [];
  for (let ring = 0; ring < 5; ring++) {
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const points = [rings[ring][i], rings[ring][next], rings[ring + 1][next], rings[ring + 1][i]];
      const cx = points.reduce((sum, p) => sum + p[0], 0) / 4;
      const cy = points.reduce((sum, p) => sum + p[1], 0) / 4;
      shards.push({
        points,
        cx,
        cy,
        falls: ring < 3 || (ring === 3 && Math.random() < 0.5),
        vx: (cx - originX) * 0.9 + (Math.random() - 0.5) * 40,
        vy: (cy - originY) * 0.4 - Math.random() * 30,
        spin: (Math.random() - 0.5) * 4,
        shine: Math.random() * 0.12,
        jx: (Math.random() - 0.5) * 2.4,
        jy: (Math.random() - 0.5) * 2.4,
      });
    }
  }
  return shards;
};

const wipeFog = (fog, from, to) => {
  const ctx = fog.getContext('2d');
  const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / 8));
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 1; i <= steps; i++) {
    const x = from[0] + ((to[0] - from[0]) * i) / steps;
    const y = from[1] + ((to[1] - from[1]) * i) / steps;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 42);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 42, y - 42, 84, 84);
  }
  ctx.globalCompositeOperation = 'source-over';
};

const renderers = {
  base({ ctx, art }) {
    ctx.drawImage(art, 0, 0);
  },

  shatter({ ctx, art }, s) {
    ctx.fillStyle = '#120d0a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    s.shards.forEach((shard) => {
      ctx.save();
      ctx.translate(shard.jx * s.crack, shard.jy * s.crack);
      if (shard.falls) {
        ctx.translate(shard.cx + shard.vx * s.fall, shard.cy + shard.vy * s.fall + 560 * s.fall * s.fall);
        ctx.rotate(shard.spin * s.fall);
        ctx.translate(-shard.cx, -shard.cy);
      }
      ctx.beginPath();
      shard.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(art, 0, 0);
      ctx.fillStyle = `rgba(255, 255, 255, ${shard.shine * s.crack})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * s.crack})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    });
  },

  ripple({ ctx, src, frame }, s) {
    const out = frame.data;
    for (let y = 0, i = 0; y < HEIGHT; y++) {
      const sway = Math.sin(y * 0.05 + s.time * 2.5) * 1.6;
      for (let x = 0; x < WIDTH; x++, i += 4) {
        const dx = x - s.mx;
        const dy = y - s.my;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const wave = Math.sin(dist * 0.09 - s.time * 6) * Math.exp(-dist * 0.011) * s.amp;
        const sx = clamp(x + sway + (wave * dx) / dist, WIDTH - 1) | 0;
        const sy = clamp(y + (wave * dy) / dist, HEIGHT - 1) | 0;
        const j = (sy * WIDTH + sx) * 4;
        const light = 1 + wave * 0.03;
        out[i] = src[j] * light;
        out[i + 1] = src[j + 1] * light;
        out[i + 2] = src[j + 2] * light;
        out[i + 3] = 255;
      }
    }
    ctx.putImageData(frame, 0, 0);
  },

  burn({ ctx, src, frame, noise }, s) {
    const out = frame.data;
    for (let y = 0, i = 0, p = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++, i += 4, p++) {
        const dx = x - WIDTH / 2;
        const dy = (y - HEIGHT / 2) * 0.8;
        const edge = Math.sqrt(dx * dx + dy * dy) + noise[p] * 55 - s.burn;
        let r, g, b;
        if (edge < -4) {
          [r, g, b] = [24, 17, 14];
        } else if (edge < 0) {
          [r, g, b] = [70, 24, 8];
        } else if (edge < 7) {
          const k = edge / 7;
          [r, g, b] = [255, 215 - k * 150, 80 - k * 70];
        } else if (edge < 20) {
          const k = (edge - 7) / 13;
          [r, g, b] = [255 - k * 195, 65 - k * 50, 10];
        } else {
          const k = Math.min(1, (edge - 20) / 70);
          const j = p * 4;
          const scorchR = src[j] * 0.45 + 40;
          const scorchG = src[j + 1] * 0.32 + 20;
          const scorchB = src[j + 2] * 0.2 + 8;
          r = scorchR + (src[j] - scorchR) * k;
          g = scorchG + (src[j + 1] - scorchG) * k;
          b = scorchB + (src[j + 2] - scorchB) * k;
        }
        out[i] = r;
        out[i + 1] = g;
        out[i + 2] = b;
        out[i + 3] = 255;
      }
    }
    ctx.putImageData(frame, 0, 0);
  },

  vortex({ ctx, src, frame }, s) {
    const out = frame.data;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    const reach = Math.min(WIDTH, HEIGHT) * 0.62;
    const spin = s.time * 0.5 * Math.min(1, s.twist / 4);
    const shade = Math.min(1, s.twist / 6) * 0.55;
    for (let y = 0, i = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++, i += 4) {
        const dx = x - cx;
        const dy = y - cy;
        const pull = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / reach);
        const angle = s.twist * pull * pull + spin * pull;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const sx = cx + dx * cos + dy * sin;
        const sy = cy - dx * sin + dy * cos;
        if (sx < 0 || sy < 0 || sx >= WIDTH || sy >= HEIGHT) {
          out[i] = 20;
          out[i + 1] = 14;
          out[i + 2] = 12;
          out[i + 3] = 255;
          continue;
        }
        const j = ((sy | 0) * WIDTH + (sx | 0)) * 4;
        const light = 1 - pull * pull * shade;
        out[i] = src[j] * light;
        out[i + 1] = src[j + 1] * light;
        out[i + 2] = src[j + 2] * light * 1.04;
        out[i + 3] = 255;
      }
    }
    ctx.putImageData(frame, 0, 0);
  },

  glitch({ ctx, src, frame }, s) {
    const out = frame.data;
    s.glitchTimer -= s.dt;
    if (s.glitchTimer <= 0) {
      s.glitchTimer = 0.06 + Math.random() * 0.14;
      s.rows.fill(0);
      const bands = 2 + ((Math.random() * 4) | 0);
      for (let b = 0; b < bands; b++) {
        const start = (Math.random() * HEIGHT) | 0;
        const height = (4 + Math.random() * 40) | 0;
        const shift = ((Math.random() - 0.5) * 70) | 0;
        for (let y = start; y < Math.min(HEIGHT, start + height); y++) s.rows[y] = shift;
      }
      s.glitchOffset = 3 + Math.random() * (Math.random() < 0.3 ? 22 : 9);
    }
    for (let y = 0; y < HEIGHT; y++) {
      const dim = y % 3 ? 1 : 0.88;
      for (let x = 0; x < WIDTH; x++) {
        const center = clamp(x + s.rows[y], WIDTH - 1) | 0;
        const red = clamp(center + s.glitchOffset, WIDTH - 1) | 0;
        const blue = clamp(center - s.glitchOffset, WIDTH - 1) | 0;
        const i = (y * WIDTH + x) * 4;
        out[i] = src[(y * WIDTH + red) * 4] * dim;
        out[i + 1] = src[(y * WIDTH + center) * 4 + 1] * dim;
        out[i + 2] = src[(y * WIDTH + blue) * 4 + 2] * dim;
        out[i + 3] = 255;
        if (Math.random() < 0.003) out[i] = out[i + 1] = out[i + 2] = Math.random() < 0.5 ? 255 : 0;
      }
    }
    ctx.putImageData(frame, 0, 0);
  },

  fog({ ctx, art }, s) {
    ctx.drawImage(art, 0, 0);
    ctx.globalAlpha = s.fogAlpha;
    ctx.drawImage(s.fog, 0, 0);
    ctx.globalAlpha = s.fogAlpha * 0.3;
    ctx.drawImage(s.smoke, Math.sin(s.time * 0.4) * 30 - 30, Math.cos(s.time * 0.3) * 20 - 20, WIDTH + 60, HEIGHT + 40);
    ctx.globalAlpha = 1;
  },
};

const starters = {
  shatter(s, x, y) {
    s.shards = createShards(x, y);
    gsap.to(s, { crack: 1, duration: 0.35 });
    gsap.to(s, { fall: 1, duration: 1.8, delay: 0.9, ease: 'power2.in' });
  },
  ripple(s) {
    gsap.to(s, { amp: 10, duration: 0.8 });
  },
  burn(s) {
    gsap.to(s, { burn: 235, duration: 4.5, ease: 'power1.inOut' });
  },
  vortex(s) {
    gsap.to(s, { twist: 11, duration: 3, ease: 'power2.inOut', yoyo: true, repeat: -1 });
  },
  glitch(s) {
    s.glitchTimer = 0;
  },
  fog(s) {
    s.fog = createFog(true);
    s.smoke = createFog(false);
    gsap.to(s, { fogAlpha: 1, duration: 2 });
  },
};

const Code = () => {
  const canvasRef = useRef(null);
  const glassRef = useRef(null);
  const mirrorRef = useRef(null);
  const pageRef = useRef(null);
  const stateRef = useRef(createState());
  const [page, setPage] = useState({ title: '', subtitle: '' });
  const [drag, setDrag] = useState(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      const clear = { clearProps: 'transform,opacity' };
      gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .from('.creative-code__heading h1', { y: -80, opacity: 0, duration: 1.2, ...clear })
        .from('.creative-code__heading p', { y: -60, opacity: 0, duration: 1.2, ...clear }, '-=0.9')
        .from('.mirror', { scale: 0.92, y: 24, opacity: 0, duration: 1.4, ease: 'power2.inOut', ...clear }, '-=0.8')
        .from(
          '.creative-code__column:first-child .effect-token',
          { xPercent: -110, opacity: 0, duration: 0.8, stagger: 0.3, ease: 'power2.out', ...clear },
          '<0.5'
        )
        .from(
          '.creative-code__column:last-child .effect-token',
          { xPercent: 110, opacity: 0, duration: 0.8, stagger: 0.3, ease: 'power2.out', ...clear },
          '<'
        );
    }, pageRef);
    return () => context.revert();
  }, []);

  useEffect(() => {
    let active = true;
    supabase
      .from('site_pages')
      .select('section_title, section_subtitle')
      .eq('page_slug', PAGE_SLUG)
      .single()
      .then(({ data }) => {
        if (active && data) setPage({ title: data.section_title, subtitle: data.section_subtitle });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    const state = stateRef.current;
    const art = document.createElement('canvas');
    art.width = WIDTH;
    art.height = HEIGHT;
    const artCtx = art.getContext('2d');
    const env = {
      ctx,
      art,
      src: new Uint8ClampedArray(WIDTH * HEIGHT * 4),
      frame: ctx.createImageData(WIDTH, HEIGHT),
      noise: createNoise(),
    };
    const image = new Image();
    let ready = false;
    let last = performance.now();
    let raf;

    image.onload = () => {
      artCtx.drawImage(image, 0, 0, WIDTH, HEIGHT);
      env.src.set(artCtx.getImageData(0, 0, WIDTH, HEIGHT).data);
      ready = true;
    };
    image.src = mirrorArt;

    const tick = (now) => {
      state.dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      state.time += state.dt;
      state.mx += (state.tx - state.mx) * 0.18;
      state.my += (state.ty - state.my) * 0.18;
      if (ready) {
        (renderers[state.effect] || renderers.base)(env, state);
        if (state.flash > 0.01) {
          ctx.fillStyle = `rgba(255, 255, 255, ${state.flash})`;
          ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      gsap.killTweensOf(state);
    };
  }, []);

  const resetMirror = () => {
    gsap.killTweensOf(stateRef.current);
    Object.assign(stateRef.current, createState());
  };

  const toCanvas = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [((clientX - rect.left) / rect.width) * WIDTH, ((clientY - rect.top) / rect.height) * HEIGHT];
  };

  const isOverGlass = (clientX, clientY) => {
    const rect = glassRef.current.getBoundingClientRect();
    const nx = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const ny = (clientY - rect.top - rect.height / 2) / (rect.height / 2);
    return nx * nx + ny * ny <= 1;
  };

  const applyEffect = (id, clientX, clientY) => {
    resetMirror();
    const state = stateRef.current;
    const [x, y] = toCanvas(clientX, clientY);
    state.effect = id;
    state.tx = state.mx = x;
    state.ty = state.my = y;
    state.flash = 0.9;
    gsap.to(state, { flash: 0, duration: 0.6 });
    gsap.fromTo(mirrorRef.current, { x: -5 }, { x: 0, duration: 0.7, ease: 'elastic.out(1, 0.25)' });
    starters[id](state, x, y);
  };

  const startDrag = (event, id) => {
    event.preventDefault();
    const move = (e) => setDrag({ id, x: e.clientX, y: e.clientY, over: isOverGlass(e.clientX, e.clientY) });
    const release = (e) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      setDrag(null);
      if (isOverGlass(e.clientX, e.clientY)) applyEffect(id, e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', release);
    move(event.nativeEvent);
  };

  const handleGlassMove = (event) => {
    const state = stateRef.current;
    const point = toCanvas(event.clientX, event.clientY);
    state.tx = point[0];
    state.ty = point[1];
    if (state.effect === 'fog' && state.fog && event.buttons) {
      wipeFog(state.fog, state.lastWipe || point, point);
      state.lastWipe = point;
    }
  };

  const handleGlassDown = (event) => {
    stateRef.current.lastWipe = null;
    handleGlassMove(event);
  };

  const handleGlassUp = () => {
    stateRef.current.lastWipe = null;
  };

  const renderToken = (id) => (
    <div
      key={id}
      className={`effect-token${drag?.id === id ? ' is-dragging' : ''}`}
      onPointerDown={(event) => startDrag(event, id)}
    >
      {EFFECTS[id]}
    </div>
  );

  return (
    <div className="bkkk">
      <Header />

      <main className="creative-code" ref={pageRef}>
        <div className="creative-code__heading">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>

        <section className="creative-code__stage">
          <div className="creative-code__column">{LEFT_EFFECTS.map(renderToken)}</div>

          <div className="mirror" ref={mirrorRef}>
            <div ref={glassRef} className={`mirror__glass${drag?.over ? ' is-hovered' : ''}`}>
              <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                onPointerMove={handleGlassMove}
                onPointerDown={handleGlassDown}
                onPointerUp={handleGlassUp}
              />
            </div>
            <img className="mirror__frame" src={mirrorFrame} alt="" draggable={false} />
          </div>

          <div className="creative-code__column">{RIGHT_EFFECTS.map(renderToken)}</div>
        </section>
      </main>

      <Footer />

      {drag && (
        <div className="effect-token effect-token--ghost" style={{ left: drag.x, top: drag.y }}>
          {EFFECTS[drag.id]}
        </div>
      )}
    </div>
  );
};

export default Code;