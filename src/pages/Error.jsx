import React from 'react';
import './Error.css';
import '../genarel.css';

import meltedClock from '../assets/imgs/melted-clock.png';
import VintageButton from '../compoents/common/VintageButton';
import InkDigit from '../compoents/layout/inkdigiet';
import Header from '../compoents/layout/Header';
import Footer from '../compoents/layout/Footer';

const Error = () => {
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
          <img className="error-clock" src={meltedClock} alt="" draggable="false" />
          <InkDigit>4</InkDigit>
        </h1>
      </main>

      <Footer />
    </div>
  );
};

export default Error;