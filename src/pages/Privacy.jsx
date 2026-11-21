import React, { Fragment, useEffect, useMemo, useState } from 'react';
import './Privacy.css';
import '../genarel.css';

import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

const CONTENT = [
  { type: 'title', text: 'Privacy and Data Policy' },
  {
    type: 'paragraph',
    text: 'At this digital studio, your privacy and trust are paramount while exploring this gallery experience. We ensure that any personal details or session interactions remain completely secure, confidential, and transparent.',
  },
  {
    type: 'list',
    items: [
      'Information Collection: We only collect personal details (such as your name and email) when you voluntarily send a message through the contact portal, alongside basic technical data used strictly to optimize site performance and micro-interactions.',
      'Cookies & Data Protection: Lightweight local storage is used solely to remember your session preferences, like sound toggles, and your correspondence is never sold, leased, or shared with third parties.',
      'Your Personal Rights: You maintain full authority to request access to, update, or permanently erase any personal inquiry records sent through this platform at any time.',
    ],
  },
  {
    type: 'paragraph',
    text: 'If you have any questions regarding data handling or wish to request the deletion of your records, feel free to reach out directly via email at raia.yakout@gmail.com.',
  },
];

const buildContent = () => {
  let index = 0;

  const write = (text) => (
    <>
      <span className="scroll__sr">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((word, w, words) => (
          <Fragment key={w}>
            <span className="scroll__word">
              {[...word].map((char, c) => (
                <span key={c} className="scroll__char" style={{ '--i': index++ }}>
                  {char}
                </span>
              ))}
            </span>
            {w < words.length - 1 && (index++, ' ')}
          </Fragment>
        ))}
      </span>
    </>
  );

  return CONTENT.map((block, i) => {
    if (block.type === 'title') {
      return (
        <h1 key={i} id="privacy-title" className="scroll__title">
          {write(block.text)}
        </h1>
      );
    }
    if (block.type === 'list') {
      return (
        <ul key={i} className="scroll__list">
          {block.items.map((item) => {
            const start = index;
            return (
              <li key={item} style={{ '--start': start }}>
                {write(item)}
              </li>
            );
          })}
        </ul>
      );
    }
    return (
      <p key={i} className="scroll__text">
        {write(block.text)}
      </p>
    );
  });
};

const Roller = ({ side }) => (
  <div className={`scroll__roller scroll__roller--${side}`} aria-hidden="true">
    <div className="scroll__roller-top" />
    <div className="scroll__roller-mid" />
    <div className="scroll__roller-bottom" />
  </div>
);

const Privacy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const content = useMemo(buildContent, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bkk">
      <Header />

      <section className="privacy-scroll" aria-labelledby="privacy-title">
        <div className="scroll">
          <Roller side="left" />

          <div className={`scroll__paper${isOpen ? ' is-open' : ''}`}>
            <div className="scroll__sheet">
              <div className="scroll__edge scroll__edge--top" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              <div className="scroll__body">{content}</div>
              <div className="scroll__edge scroll__edge--bottom" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
            </div>
          </div>

          <Roller side="right" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;