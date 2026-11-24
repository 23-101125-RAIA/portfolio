import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Footer.css';
import '../../genarel.css';

import flowersBg from '../../assets/imgs/footer-flowers.png';
import textureBg from '../../assets/imgs/paper-texture.png';
import icon1 from '../../assets/imgs/icon1.png';
import icon2 from '../../assets/imgs/icon2.png';
import icon3 from '../../assets/imgs/icon3.png';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const getFooter = async () => {
      const [settingsRes, linksRes] = await Promise.all([
        supabase.from('footer_settings').select('*').limit(1).maybeSingle(),
        supabase
          .from('footer_links')
          .select('link_id, label, url_path, display_order')
          .order('display_order', { ascending: true }),
      ]);

      if (settingsRes.error) console.error('footer_settings:', settingsRes.error.message);
      if (linksRes.error) console.error('footer_links:', linksRes.error.message);

      setSettings(settingsRes.data || null);
      setLinks(linksRes.data || []);
    };
    getFooter();
  }, []);

  const socials = [
    { key: 'linkedin', icon: icon1, url: settings?.linkedin_url },
    { key: 'behance', icon: icon2, url: settings?.behance_url },
    { key: 'github', icon: icon3, url: settings?.github_url },
  ].filter((social) => social.url);

  return (
    <footer className="site-footer">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="rough-edge" x="-3%" y="-8%" width="106%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.12"
            numOctaves="4"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <img className="footer-flowers" src={flowersBg} alt="" />

      <div className="footer-card" style={{ '--texture': `url(${textureBg})` }}>
        <div className="footer-card-bg" />

        <div className="footer-chat">
          <h4>Let&apos;s chat!</h4>
          {settings?.contact_email && (
            <a className="footer-email" href={`mailto:${settings.contact_email}`}>
              {settings.contact_email}
            </a>
          )}
          <div className="footer-socials">
            {socials.map((social) => (
              <a key={social.key} href={social.url} target="_blank" rel="noreferrer">
                <img src={social.icon} alt={social.key} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-logo">
          {settings?.logo_url && <img src={settings.logo_url} alt="Logo" />}
        </div>

        <div className="footer-quick">
          <h4>Quick Links</h4>
          <ul>
            {links.map((link) => (
              <li key={link.link_id}>
                <Link to={link.url_path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="footer-copy">{settings?.copyright_text}</p>
      </div>
    </footer>
  );
};

export default Footer;