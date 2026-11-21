import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Faq.css';
import '../genarel.css';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

import lensImg from '../assets/imgs/lens.png';
import flowerLeftImg from '../assets/imgs/flower-left.png';
import flowerRightImg from '../assets/imgs/flower-right.png';

const ZOOM_IN = 1.8;
const ZOOM_OUT = 0.55;

function measureLens(img) {
  const scale = Math.min(1, 300 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const solid = new Uint8Array(w * h);
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 40) {
        solid[y * w + x] = 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const seen = new Uint8Array(w * h);
  const fill = (startIndex) => {
    const stack = [startIndex];
    const cells = [];
    seen[startIndex] = 1;
    while (stack.length) {
      const index = stack.pop();
      cells.push(index);
      const x = index % w;
      const y = (index - x) / w;
      const next = [];
      if (x > 0) next.push(index - 1);
      if (x < w - 1) next.push(index + 1);
      if (y > 0) next.push(index - w);
      if (y < h - 1) next.push(index + w);
      for (const n of next) {
        if (!solid[n] && !seen[n]) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    return cells;
  };

  for (let x = 0; x < w; x++) {
    if (!solid[x] && !seen[x]) fill(x);
    const bottom = (h - 1) * w + x;
    if (!solid[bottom] && !seen[bottom]) fill(bottom);
  }
  for (let y = 0; y < h; y++) {
    const left = y * w;
    const right = y * w + w - 1;
    if (!solid[left] && !seen[left]) fill(left);
    if (!solid[right] && !seen[right]) fill(right);
  }

  let hole = null;
  for (let i = 0; i < w * h; i++) {
    if (!solid[i] && !seen[i]) {
      const cells = fill(i);
      if (!hole || cells.length > hole.length) hole = cells;
    }
  }

  const k = 1 / scale;
  const bx = minX * k;
  const by = minY * k;
  const bw = (maxX - minX + 1) * k;
  const bh = (maxY - minY + 1) * k;

  let cx = bx + bw * 0.62;
  let cy = by + bh * 0.235;
  let r = bw * 0.35;

  if (hole && hole.length > 50) {
    let hx0 = w, hx1 = 0, hy0 = h, hy1 = 0;
    for (const index of hole) {
      const x = index % w;
      const y = (index - x) / w;
      if (x < hx0) hx0 = x;
      if (x > hx1) hx1 = x;
      if (y < hy0) hy0 = y;
      if (y > hy1) hy1 = y;
    }
    cx = ((hx0 + hx1 + 1) / 2) * k;
    cy = ((hy0 + hy1 + 1) / 2) * k;
    r = (Math.min(hx1 - hx0 + 1, hy1 - hy0 + 1) / 2) * k;
  }

  return {
    iw: img.naturalWidth,
    ih: img.naturalHeight,
    bx,
    by,
    bw,
    bh,
    cx,
    cy,
    r,
    ringSide: cx > bx + bw / 2 ? 'right' : 'left',
  };
}

function useLensGeometry(src) {
  const [geo, setGeo] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setGeo(measureLens(img));
    img.src = src;
  }, [src]);

  return geo;
}

function FaqInner({ page, faqs, openIndex, onToggle, interactive }) {
  return (
    <div
      className={`faq__inner${interactive ? ' is-live' : ''}${page && faqs.length ? ' is-ready' : ''}`}
    >
      <img src={flowerLeftImg} className="faq__flower faq__flower--left" alt="" />
      <img src={flowerRightImg} className="faq__flower faq__flower--right" alt="" />

      <div className="faq__content">
        <h2 className="faq__title">{page?.section_title}</h2>
        <p className="faq__subtitle">{page?.section_subtitle}</p>

        <div className="faq__list">
          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.faq_id}
                className={`faq__item${open ? ' is-open' : ''}`}
                style={{ '--i': i }}
              >
                <button
                  type="button"
                  className="faq__question"
                  aria-expanded={open}
                  tabIndex={interactive ? 0 : -1}
                  onClick={interactive ? () => onToggle(i) : undefined}
                >
                  <span>{item.question}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </button>
                <div className="faq__answer">
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Lens({ zoom, ring, side, symbol, geo, size, sectionRef, children }) {
  const [dragPos, setDragPos] = useState(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const lensRef = useRef(null);
  const grab = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = lensRef.current;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const flip = geo.ringSide !== ring;
  const lensW = box.w;
  const lensH = box.h;

  const ringX = lensW * ((geo.cx - geo.bx) / geo.bw);
  const glassCX = flip ? lensW - ringX : ringX;
  const glassCY = lensH * ((geo.cy - geo.by) / geo.bh);
  const glassR = lensW * (geo.r / geo.bw);

  const artStyle = {
    width: lensW * (geo.iw / geo.bw),
    height: lensH * (geo.ih / geo.bh),
    left: -lensW * (geo.bx / geo.bw),
    top: -lensH * (geo.by / geo.bh),
  };

  const dragging = dragPos !== null;
  const focusX = (dragPos ? dragPos.x : 0) + glassCX;
  const focusY = (dragPos ? dragPos.y : 0) + glassCY;

  const onPointerDown = (e) => {
    const sec = sectionRef.current.getBoundingClientRect();
    const lens = e.currentTarget.getBoundingClientRect();
    grab.current = { x: e.clientX - lens.left, y: e.clientY - lens.top };
    setDragPos({ x: lens.left - sec.left, y: lens.top - sec.top });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const sec = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - sec.left - grab.current.x;
    const y = e.clientY - sec.top - grab.current.y;
    setDragPos({
      x: Math.max(-glassCX, Math.min(size.w - glassCX, x)),
      y: Math.max(-glassCY, Math.min(size.h - glassCY, y)),
    });
  };

  const onPointerUp = () => setDragPos(null);

  const handleOnLeft = ring === 'right';

  return (
    <div
      ref={lensRef}
      className={`lens lens--${side}${dragging ? ' is-dragging' : ''}`}
      style={{
        aspectRatio: `${geo.bw} / ${geo.bh}`,
        ...(dragging ? { left: dragPos.x, top: dragPos.y } : null),
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      aria-label={zoom > 1 ? 'Zoom in lens. Drag it over the page.' : 'Zoom out lens. Drag it over the page.'}
    >
      <div className="lens__body">
        {dragging && (
          <div
            className="lens__glass"
            aria-hidden="true"
            style={{
              width: glassR * 2,
              height: glassR * 2,
              left: glassCX - glassR,
              top: glassCY - glassR,
            }}
          >
            <div
              className="lens__zoomed"
              style={{
                width: size.w,
                height: size.h,
                transform: `translate(${glassR - focusX * zoom}px, ${glassR - focusY * zoom}px) scale(${zoom})`,
              }}
            >
              {children}
            </div>
          </div>
        )}

        <div className={`lens__art${flip ? ' is-flip' : ''}`}>
          <img src={lensImg} style={artStyle} alt="" draggable={false} />
        </div>

        <span
          className={`lens__badge ${symbol === 'plus' ? 'lens__badge--plus' : 'lens__badge--minus'}`}
          style={{ left: handleOnLeft ? '22%' : '78%' }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function FaqSection() {
  const [page, setPage] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const sectionRef = useRef(null);
  const geo = useLensGeometry(lensImg);

  useEffect(() => {
    const load = async () => {
      const [pageRes, faqRes] = await Promise.all([
        supabase
          .from('site_pages')
          .select('section_title, section_subtitle')
          .eq('page_slug', 'faq-inquiries')
          .single(),
        supabase
          .from('faqs')
          .select('faq_id, question, answer')
          .order('display_order', { ascending: true })
          .limit(5),
      ]);

      if (pageRes.data) setPage(pageRes.data);
      if (faqRes.data) setFaqs(faqRes.data);
    };

    load();
  }, []);

  useLayoutEffect(() => {
    const el = sectionRef.current;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = (i) => setOpenIndex((current) => (current === i ? null : i));

  const copy = <FaqInner page={page} faqs={faqs} openIndex={openIndex} interactive={false} />;

  return (
    <section className="faq" ref={sectionRef}>
      <FaqInner page={page} faqs={faqs} openIndex={openIndex} onToggle={toggle} interactive />

      {size.w > 0 && geo && (
        <>
          <Lens
            zoom={ZOOM_IN}
            symbol="plus"
            ring="left"
            side="right"
            geo={geo}
            size={size}
            sectionRef={sectionRef}
          >
            {copy}
          </Lens>
          <Lens
            zoom={ZOOM_OUT}
            symbol="minus"
            ring="right"
            side="left"
            geo={geo}
            size={size}
            sectionRef={sectionRef}
          >
            {copy}
          </Lens>
        </>
      )}
    </section>
  );
}

const Faq = () => {
  return (
    <div className="bkk">
      <Header />
      <FaqSection />
      <Footer />
    </div>
  );
};

export default Faq;