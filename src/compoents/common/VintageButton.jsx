import React from 'react';
import { Link } from 'react-router-dom';
import './VintageButton.css';

const VintageButton = ({ to, onClick, children, type = 'button', className = '' }) => {
  const classes = `vintage-btn ${className}`.trim();

  const content = (
    <>
      <span className="vintage-btn__wave vintage-btn__wave--gold" aria-hidden="true" />
      <span className="vintage-btn__wave vintage-btn__wave--cream" aria-hidden="true" />
      <span className="vintage-btn__label">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {content}
    </button>
  );
};

export default VintageButton;