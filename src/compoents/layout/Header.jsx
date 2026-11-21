import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Header.css';
import '../../genarel.css';

import soundOnIcon from '../../assets/imgs/sound-on.png';
import soundOffIcon from '../../assets/imgs/sound-off.png';
import ticketImg from '../../assets/imgs/ticketheader.png';
import bgMusic from '../../assets/audio/voytekpavlik-classical-and-elegant-fantasy-tale-147366.mp3';
import VintageButton from '../common/VintageButton';

const Header = () => {
  const audioRef = useRef(null);
  const [navLinks, setNavLinks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const getNav = async () => {
      const { data, error } = await supabase
        .from('header_navigation')
        .select('nav_id, label, url_path, display_order')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('header_navigation:', error.message);
        return;
      }
      setNavLinks(data || []);
    };
    getNav();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.loop = true;
    audio.volume = 0.4;

    const removeListeners = () => {
      document.removeEventListener('pointerdown', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };

    function startOnInteraction(e) {
      removeListeners();
      if (e.target.closest && e.target.closest('.sound-btn')) return;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        document.addEventListener('pointerdown', startOnInteraction);
        document.addEventListener('keydown', startOnInteraction);
      });

    return () => {
      removeListeners();
      audio.pause();
    };
  }, []);

  const toggleSound = () => {

    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <header className="site-header">
      <audio ref={audioRef} src={bgMusic} preload="auto" />

      <div className="header-actions">
        <VintageButton to="/contact">Let&apos;s Talk</VintageButton>
        <button
          className="sound-btn"
          onClick={toggleSound}
          aria-label={isPlaying ? 'Mute music' : 'Play music'}
        >
          <img src={isPlaying ? soundOnIcon : soundOffIcon} alt="" />
        </button>
      </div>

      <nav className={`ticket ${isOpen ? 'open' : 'closed'}`}>
        <div className={`ticket-swing ${isOpen ? 'settle' : 'idle'}`}>
          <img className="ticket-img" src={ticketImg} alt="" draggable="false" />

          <ul className="ticket-links">
            {navLinks.map((item) => (
              <li key={item.nav_id}>
                <Link to={item.url_path} onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            className="ticket-handle"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;