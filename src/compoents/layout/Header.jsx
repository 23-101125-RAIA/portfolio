import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Header.css';
import '../../genarel.css';

import soundOnIcon from '../../assets/imgs/sound-on.png';
import soundOffIcon from '../../assets/imgs/sound-off.png';
import ticketImg from '../../assets/imgs/ticketheader.png';
import VintageButton from '../common/VintageButton';
import { initMusic, toggleMusic, useMusicOn } from '../common/bgMusic';

const Header = () => {
  const [navLinks, setNavLinks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const isPlaying = useMusicOn();

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
    initMusic();
  }, []);

  return (
    <header className="site-header">
      <div className="header-actions">
        <VintageButton to="/contact">Let&apos;s Talk</VintageButton>
        <button
          className="sound-btn"
          onClick={toggleMusic}
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