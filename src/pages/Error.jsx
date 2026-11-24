import React, { useRef, useEffect } from 'react';
import './Error.css';
import '../genarel.css';

import meltedClock from '../assets/imgs/melted-clock.webm';
import VintageButton from '../compoents/common/VintageButton';
import InkDigit from '../compoents/layout/inkdigiet';
import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

const Error = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const setSpeed = () => {
      video.playbackRate = 0.5;
    };
    setSpeed();
    video.addEventListener('loadedmetadata', setSpeed);
    video.addEventListener('play', setSpeed);
    return () => {
      video.removeEventListener('loadedmetadata', setSpeed);
      video.removeEventListener('play', setSpeed);
    };
  }, []);

  return (
    <div className="bkk">
      <Header />

      <main className="error-page">
        <div className="error-message">
          <p className="error-text">
            Time seems to have melted away. The page you are looking for doesn&apos;t exist or
            has been moved
          </p>
          <VintageButton to="/">Return Home</VintageButton>
        </div>

        <h1 className="error-code" aria-label="Error 404">
          <InkDigit>4</InkDigit>
          <video
            ref={videoRef}
            className="error-clock"
            src={meltedClock}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
          />
          <InkDigit>4</InkDigit>
        </h1>
      </main>

      <Footer />
    </div>
  );
};

export default Error;