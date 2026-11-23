import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Timeline.css';
import '../genarel.css';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

import clockImg from '../assets/imgs/clock-clean.png';
import paperImg from '../assets/imgs/paper.png';
import coin1 from '../assets/imgs/coin-1.png';
import coin2 from '../assets/imgs/coin-2.png';
import coin3 from '../assets/imgs/coin-3.png';
import coin4 from '../assets/imgs/coin-4.png';
import coin5 from '../assets/imgs/coin-5.png';
import coin6 from '../assets/imgs/coin-6.png';
import coin7 from '../assets/imgs/coin-7.png';

const coins = [coin1, coin2, coin3, coin4, coin5, coin6, coin7];
const RADIUS = 33;

const Timeline = () => {
  const [steps, setSteps] = useState([]);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [angle, setAngle] = useState(0);
  const [error, setError] = useState('');
  const timer = useRef();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('timeline')
        .select('step_id, step_number, title, description')
        .order('step_number', { ascending: true });

      if (error) {
        setError('Could not load the timeline.');
        return;
      }
      setSteps(data || []);
    };
    load();
    return () => clearTimeout(timer.current);
  }, []);

  const select = (index) => {
    if (index === active || !steps[index]) return;
    setActive(index);

    const target = (steps[index].step_number % 12) * 30;
    const delta = ((target - (angle % 360) + 540) % 360) - 180;
    setAngle(angle + delta);

    clearTimeout(timer.current);
    setLeaving(true);
    timer.current = setTimeout(() => {
      setShown(index);
      setLeaving(false);
    }, 300);
  };

  const current = steps[shown];
  const heading = current ? `${current.step_number} // ${current.title}` : '';
  const words = current ? current.description.split(' ') : [];

  return (
    <div className="bkk">
      <Header />

      <section className="tl-stage">
        <div className="tl-paper" style={{ backgroundImage: `url(${paperImg})` }} />

        <div className="tl-clock">
          <img className="tl-clock__face" src={clockImg} alt="" draggable="false" />

          <div className="tl-hand" style={{ '--angle': `${angle}deg` }}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <path
                fill="#1c1710"
                d="M50 21 C52.8 27 54.6 31 53.2 35 C52.2 37.5 51.1 38.5 51.1 42 L51.3 58 L48.7 58 L48.9 42 C48.9 38.5 47.8 37.5 46.8 35 C45.4 31 47.2 27 50 21 Z"
              />
              <circle cx="50" cy="50" r="3.3" fill="#1c1710" />
              <circle cx="50" cy="50" r="1.3" fill="#6b5a3a" />
            </svg>
          </div>

          {steps.map((step, i) => {
            const a = ((step.step_number % 12) / 12) * 2 * Math.PI;
            return (
              <button
                key={step.step_id}
                type="button"
                className={`tl-hour ${i === active ? 'is-active' : ''}`}
                style={{
                  left: `${50 + Math.sin(a) * RADIUS}%`,
                  top: `${50 - Math.cos(a) * RADIUS}%`,
                }}
                onClick={() => select(i)}
                aria-label={step.title}
                aria-pressed={i === active}
              />
            );
          })}
        </div>

        <div className="tl-content">
          {error && <p className="tl-message">{error}</p>}

          {current && (
            <div key={shown} className={`tl-copy ${leaving ? 'is-leaving' : ''}`}>
              <h2 className="tl-title" aria-label={heading}>
                {heading.split('').map((ch, i) => (
                  <span key={i} aria-hidden="true" style={{ '--i': i }}>
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
              </h2>
              <p className="tl-text" aria-label={current.description}>
                {words.map((w, i) => (
                  <React.Fragment key={i}>
                    <span aria-hidden="true" style={{ '--i': i }}>{w}</span>{' '}
                  </React.Fragment>
                ))}
              </p>
            </div>
          )}

          <div className="tl-coins">
            {steps.map((step, i) => (
              <button
                key={step.step_id}
                type="button"
                className={`tl-coin ${i === active ? 'is-active' : ''}`}
                style={{ '--i': i }}
                onClick={() => select(i)}
                aria-label={`${step.step_number}: ${step.title}`}
                aria-pressed={i === active}
              >
                {coins[i] ? (
                  <img className="tl-coin__face" src={coins[i]} alt="" draggable="false" />
                ) : (
                  <span className="tl-coin__face tl-coin__face--num">{i + 1}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Timeline;