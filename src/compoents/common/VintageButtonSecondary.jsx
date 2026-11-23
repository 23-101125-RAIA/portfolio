import React from 'react';
import { Link } from 'react-router-dom';
import './VintageButtonSecondary.css';

const VintageButtonSecondary = ({ to, href, onClick, children, type = 'button', className = '', ...rest }) => {
  const classes = `vintage-btn-alt ${className}`.trim();

  const content = (
    <>
      <span className="vintage-btn-alt__wave vintage-btn-alt__wave--dark" aria-hidden="true" />
      <span className="vintage-btn-alt__wave vintage-btn-alt__wave--red" aria-hidden="true" />
      <span className="vintage-btn-alt__label">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} {...rest}>
      {content}
    </button>
  );
};

export default VintageButtonSecondary;