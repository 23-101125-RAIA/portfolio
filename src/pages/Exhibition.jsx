import React, { useEffect, useRef, useState } from 'react';
import './Exhibition.css';
import '../genarel.css';
import { supabase } from '../supabaseClient';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

import featherImg from '../assets/imgs/feather.png';
import dividerImg from '../assets/imgs/divider.png';

const useReveal = (threshold = 0.2) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const DraggableFrame = ({ src, alt, side, visible }) => {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const maxPull = 260;

  const clamp = (value) => {
    if (side === 'right') return Math.max(-maxPull, Math.min(16, value));
    return Math.max(-16, Math.min(maxPull, value));
  };

  const handleDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX - offset;
    setDragging(true);
  };

  const handleMove = (e) => {
    if (!dragging) return;
    setOffset(clamp(e.clientX - startX.current));
  };

  const handleUp = () => {
    setDragging(false);
    setOffset(0);
  };

  return (
    <div className={`frame-wrap frame-${side} ${visible ? 'in' : ''}`}>
      <div className={`frame-hint hint-${side} ${dragging ? 'paused' : ''}`}>
        <div
          className={`frame-drag ${dragging ? 'is-dragging' : ''}`}
          style={{
            transform: `translateX(${offset}px)`,
            transition: dragging
              ? 'none'
              : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        >
          <img className="frame-image" src={src} alt={alt} draggable="false" />
        </div>
      </div>
    </div>
  );
};

const ExhibitionBlock = ({ item, reversed }) => {
  const [ref, visible] = useReveal();
  const frameSide = reversed ? 'left' : 'right';

  return (
    <section
      ref={ref}
      className={`exhibition-block ${reversed ? 'reversed' : ''} ${
        visible ? 'visible' : ''
      }`}
    >
      <div className="exhibition-text">
        <h2 className="exhibition-title">{item.title}</h2>
        <p className="exhibition-meta">{item.subtitle}</p>
        <p className="exhibition-description">{item.description}</p>
      </div>

      <DraggableFrame
        src={item.image_url}
        alt={item.title}
        side={frameSide}
        visible={visible}
      />
    </section>
  );
};

const FeatherRow = () => {
  const [ref, visible] = useReveal(0.25);

  return (
    <div ref={ref} className={`feather-row ${visible ? 'visible' : ''}`}>
      <div className="feather-slot feather-slot-left">
        <img src={featherImg} alt="" draggable="false" />
      </div>

      <div className="feather-divider">
        <img src={dividerImg} alt="" draggable="false" />
      </div>

      <div className="feather-slot feather-slot-right">
        <img src={featherImg} alt="" draggable="false" />
      </div>
    </div>
  );
};

const Exhibition = () => {
  const [page, setPage] = useState(null);
  const [exhibitions, setExhibitions] = useState([]);
  const [headRef, headVisible] = useReveal();

  useEffect(() => {
    const load = async () => {
      const { data: pageData } = await supabase
        .from('site_pages')
        .select('*')
        .eq('page_id', 5)
        .single();

      const { data: exhibitionData } = await supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: true });

      if (pageData) setPage(pageData);
      if (exhibitionData) setExhibitions(exhibitionData);
    };
    load();
  }, []);

  return (
    <div className="bkk">
      <Header />

      <main className="exhibition-page">
        <div
          ref={headRef}
          className={`exhibition-head ${headVisible ? 'visible' : ''}`}
        >
          <h1 className="exhibition-page-title">{page?.section_title}</h1>
          <p className="exhibition-page-subtitle">{page?.section_subtitle}</p>
        </div>

        {exhibitions[0] && (
          <ExhibitionBlock item={exhibitions[0]} reversed={false} />
        )}

        <FeatherRow />

        {exhibitions[1] && (
          <ExhibitionBlock item={exhibitions[1]} reversed={true} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Exhibition;