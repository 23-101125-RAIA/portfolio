import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Tools.css';
import '../genarel.css';
import { supabase } from '../supabaseClient';
import wire from '../assets/imgs/wire.png';
import holder from '../assets/imgs/holder.png';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

const PER_PAGE = 4;
const WIRE_SEGMENTS = 5;
const WIRE_EDGE_LEFT = 0.042;
const WIRE_EDGE_RIGHT = 0.046;
const WIRE_SCALE = 1 / (1 - WIRE_EDGE_LEFT - WIRE_EDGE_RIGHT);
const SLIDE_MS = 700;

const Tools = () => {
  const [info, setInfo] = useState({ title: '', subtitle: '' });
  const [tools, setTools] = useState([]);
  const [page, setPage] = useState(0);
  const [slide, setSlide] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [noAnim, setNoAnim] = useState(false);
  const [swinging, setSwinging] = useState(false);
  const [stageW, setStageW] = useState(0);
  const startX = useRef(0);
  const stageRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [pageRes, toolsRes] = await Promise.all([
        supabase
          .from('site_pages')
          .select('section_title, section_subtitle')
          .eq('page_slug', 'expert-tools')
          .single(),
        supabase.from('tools').select('*').order('display_order', { ascending: true }),
      ]);

      if (pageRes.data) {
        setInfo({
          title: pageRes.data.section_title,
          subtitle: pageRes.data.section_subtitle,
        });
      }
      if (toolsRes.data) setTools(toolsRes.data);
    };

    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSwinging(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const measure = () => {
      if (stageRef.current) setStageW(stageRef.current.offsetWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < tools.length; i += PER_PAGE) {
      result.push(tools.slice(i, i + PER_PAGE));
    }
    return result;
  }, [tools]);

  const count = pages.length;
  const canLoop = count > 1;

  useEffect(() => {
    if (slide === 0) return undefined;
    const timer = setTimeout(() => {
      setNoAnim(true);
      setPage((current) => (current + slide + count) % count);
      setSlide(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setNoAnim(false)));
    }, SLIDE_MS + 20);
    return () => clearTimeout(timer);
  }, [slide, count]);

  const direction = slide !== 0 ? slide : dragX > 0 ? -1 : 1;

  const getRel = (i) => {
    const d = (((i - page) % count) + count) % count;
    if (d === 0) return 0;
    if (count === 2) return direction;
    return d <= count / 2 ? d : d - count;
  };

  const handlePointerDown = (e) => {
    if (!canLoop || slide !== 0) return;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const limit = stageW * 0.95;
    setDragX(Math.max(-limit, Math.min(limit, e.clientX - startX.current)));
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    const threshold = stageW * 0.15;
    if (dragX < -threshold) setSlide(1);
    else if (dragX > threshold) setSlide(-1);
    setDragging(false);
    setDragX(0);
  };

  const transition =
    dragging || noAnim ? 'none' : `transform ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  const stageClass = [
    'tools-stage',
    swinging ? 'swinging' : '',
    dragging || slide !== 0 ? 'dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="bkk">
      <Header />

      <section className="tools-section">
        <h2 className="tools-title">{info.title}</h2>
        <p className="tools-subtitle">{info.subtitle}</p>

        <div
          ref={stageRef}
          className={stageClass}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="tools-wire-layer">
            <div
              className="tools-wire-row"
              style={{
                width: `${WIRE_SEGMENTS * 100}%`,
                left: `${-200 - WIRE_EDGE_LEFT * WIRE_SCALE * 100}%`,
                transform: `translateX(${-slide * stageW + dragX}px)`,
                transition,
              }}
            >
              {Array.from({ length: WIRE_SEGMENTS }).map((_, k) => (
                <img
                  key={k}
                  className="tools-wire"
                  src={wire}
                  alt=""
                  draggable={false}
                  style={{
                    width: `${(WIRE_SCALE * 100) / WIRE_SEGMENTS}%`,
                    marginRight: `${-((WIRE_EDGE_LEFT + WIRE_EDGE_RIGHT) * WIRE_SCALE * 100) / WIRE_SEGMENTS}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {pages.map((group, pageIndex) => {
            const rel = getRel(pageIndex);
            const active = rel - slide === 0;
            return (
              <div
                key={pageIndex}
                className={`tools-page ${active ? 'active' : ''}`}
                style={{
                  transform: `translateX(calc(${(rel - slide) * 100}% + ${dragX}px))`,
                  transition,
                }}
              >
                {group.map((tool, i) => (
                  <div key={tool.tool_id} className="tool" style={{ '--i': i }}>
                    <div className="tool-swing">
                      <div className="tool-icon">
                        <img
                          className="tool-image"
                          src={tool.icon_url}
                          alt={tool.tool_name}
                          draggable={false}
                        />
                        <img className="tool-holder" src={holder} alt="" draggable={false} />
                      </div>
                      <span className="tool-name">{tool.tool_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tools;