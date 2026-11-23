import React, { useEffect, useRef, useState } from 'react';
import './About .css';
import '../genarel.css';
import { supabase } from '../supabaseClient';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';
import VintageButton from '../compoents/buttons/VintageButton';
import VintageButtonSecondary from '../compoents/buttons/VintageButtonSecondary';

import locketImage from '../assets/about/locket.png';
import flowerLeftImage from '../assets/about/flower-left.png';
import flowerRightImage from '../assets/about/flower-right.png';
import ribbonLeftImage from '../assets/about/ribbon-left.png';
import ribbonRightImage from '../assets/about/ribbon-right.png';
import cardFrontOne from '../assets/about/card-front-1.png';
import cardFrontTwo from '../assets/about/card-front-2.png';
import cardFrontThree from '../assets/about/card-front-3.png';
import fleurImage from '../assets/about/fleur.png';

const cardFronts = [cardFrontOne, cardFrontTwo, cardFrontThree];

const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const renderHeading = (text) =>
  text.split(' ').map((word, index) => (
    <React.Fragment key={`${word}-${index}`}>
      {index > 0 && ' '}
      <span className={/^(designer|art)\W*$/i.test(word) ? 'about-title__accent' : undefined}>{word}</span>
    </React.Fragment>
  ));

const AboutHero = ({ about }) => (
  <section className="about-hero">
    <div className="about-flower about-flower--left">
      <img src={flowerLeftImage} alt="" />
    </div>
    <div className="about-flower about-flower--right">
      <img src={flowerRightImage} alt="" />
    </div>

    <div className="about-ribbon about-ribbon--left">
      <img src={ribbonLeftImage} alt="" />
    </div>
    <div className="about-ribbon about-ribbon--right">
      <img src={ribbonRightImage} alt="" />
    </div>

    <div className="about-locket">
      <img className="about-locket__swing" src={locketImage} alt="Portrait locket" />
    </div>

    <h1 className="about-title">{renderHeading(about.heading || '')}</h1>

    <div className="about-frame">
      <p className="about-frame__text">{about.bio_text}</p>
      <div className="about-frame__actions">
        <VintageButton to="/exhibitions">{about.exhibitions_button_label}</VintageButton>
        <VintageButtonSecondary href={about.cv_url || '/cv.pdf'} download>
          {about.cv_button_label}
        </VintageButtonSecondary>
      </div>
    </div>
  </section>
);

const CoreValues = ({ title, cards }) => {
  const [ref, visible] = useInView(0.15);

  return (
    <section ref={ref} className={`about-values${visible ? ' is-visible' : ''}`}>
      <h2 className="about-values__title">{title}</h2>

      <div className="about-cards">
        {cards.map((card, index) => (
          <article key={card.card_id} className={`about-card about-card--${(index % 3) + 1}`} tabIndex={0}>
            <div className="about-card__tilt">
              <div className="about-card__inner">
                <div className="about-card__face about-card__front">
                  <img src={cardFronts[index % cardFronts.length]} alt={card.title} />
                </div>
                <div className="about-card__face about-card__back">
                  <img className="about-card__icon" src={card.icon_image_url || fleurImage} alt="" />
                  <h3 className="about-card__title">
                    {card.card_number} / {card.title}
                  </h3>
                  <p className="about-card__text">{card.description}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const About = () => {
  const [about, setAbout] = useState(null);
  const [cards, setCards] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [aboutResult, cardsResult, pageResult] = await Promise.all([
        supabase.from('about_page').select('*').order('about_id', { ascending: true }).limit(1).maybeSingle(),
        supabase
          .from('about_cards')
          .select('*')
          .order('display_order', { ascending: true })
          .order('card_id', { ascending: true }),
        supabase.from('site_pages').select('section_title').eq('page_id', 8).maybeSingle()
      ]);

      if (!active) return;

      setAbout(aboutResult.data);
      setCards(cardsResult.data || []);
      setSectionTitle(pageResult.data?.section_title || '');
      setLoaded(true);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bkk">
      <Header />

      <main className="about">
        {loaded && about && <AboutHero about={about} />}
        {loaded && cards.length > 0 && <CoreValues title={sectionTitle} cards={cards} />}
      </main>

      <Footer />
    </div>
  );
};

export default About;