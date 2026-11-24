import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './Gallery.css';
import '../genarel.css';

import Chandelier from '../assets/imgs/Chandelier.webm';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

import GalleryFrame from '../compoents/layout/GalleryFrame';
import GalleryTunnel from '../compoents/layout/GalleryTunnel';
import useGalleryItems from '../compoents/layout/useGalleryItems';
import { FRAME_SLOTS, DECOR } from '../compoents/layout/galleryLayout.js';
import VintageButton from '../compoents/common/VintageButton';
import VintageButtonSecondary from '../compoents/common/VintageButtonSecondary';

const GalleryVR = lazy(() => import('../compoents/layout/GalleryVR'));

const ENTER_DURATION = 850;
const CHANDELIER_SPEED = 0.5;

const Gallery = () => {
  const { items, loading } = useGalleryItems();
  const [phase, setPhase] = useState('idle');
  const [startIndex, setStartIndex] = useState(0);
  const [vrOpen, setVrOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const enterGallery = (index = 0) => {
    if (phase !== 'idle' || loading || items.length === 0) return;
    setStartIndex(index);
    setPhase('entering');
    timer.current = setTimeout(() => setPhase('tunnel'), ENTER_DURATION);
  };

  const exitGallery = () => setPhase('idle');

  const openVR = () => {
    if (loading || items.length === 0) return;
    setVrOpen(true);
  };

  const slowDownChandelier = (e) => {
    e.currentTarget.playbackRate = CHANDELIER_SPEED;
  };

  return (
    <div className="bkk">
      <Header />

      <main className={`gallery-hero ${phase === 'entering' ? 'is-entering' : ''}`}>
        <video
          className="gallery-chandelier"
          src={Chandelier}
          autoPlay
          loop
          muted
          playsInline
          onLoadedMetadata={slowDownChandelier}
        />

        {DECOR.map((d) => (
          <img
            key={d.id}
            className="gallery-decor"
            src={d.src}
            alt=""
            aria-hidden="true"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: `${d.width}%`,
              zIndex: d.z,
              '--rot': `${d.rotate}deg`,
              '--float-dur': `${d.dur}s`,
              '--float-delay': `${d.delay}s`,
            }}
          />
        ))}

        {items.slice(0, FRAME_SLOTS.length).map((item, i) => {
          const slot = FRAME_SLOTS[i];
          const flyX = (slot.left + slot.width / 2 - 50) * 1.2;
          const flyY = slot.top - 40;

          return (
            <GalleryFrame
              key={item.gallery_id}
              src={item.image_url}
              alt={item.title}
              className="gallery-hero__frame"
              onClick={() => enterGallery(i)}
              style={{
                left: `${slot.left}%`,
                top: `${slot.top}%`,
                width: `${slot.width}%`,
                '--rot': `${slot.rotate}deg`,
                '--fly-x': `${flyX}cqw`,
                '--fly-y': `${flyY}cqw`,
                '--delay': `${i * 80}ms`,
              }}
            />
          );
        })}

        <section className="gallery-intro">
          <h1 className="gallery-intro__heading">
            <span className="gallery-intro__eyebrow">Step Into The</span>
            <span className="gallery-intro__title">PORTFOLIO</span>
          </h1>

          <p className="gallery-intro__text">
            An interactive walkthrough merging experimental mixed-media art with
            functional digital UI architecture.
          </p>

          <div className="gallery-intro__actions">
            <VintageButton onClick={() => enterGallery(0)}>Enter Gallery Space</VintageButton>
            <VintageButtonSecondary onClick={openVR}>VR View</VintageButtonSecondary>
          </div>
        </section>
      </main>

      <Footer />

      {phase === 'tunnel' && (
        <GalleryTunnel items={items} startIndex={startIndex} onExit={exitGallery} />
      )}

      {vrOpen && (
        <Suspense fallback={null}>
          <GalleryVR items={items} onExit={() => setVrOpen(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default Gallery;