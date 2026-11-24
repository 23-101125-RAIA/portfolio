import React from 'react';

const GalleryFrame = ({ src, alt, className = '', style, onClick }) => {
  const image = (
    <img className="gallery-frame__img" src={src} alt={onClick ? '' : alt} draggable="false" />
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`gallery-frame ${className}`}
        style={style}
        onClick={onClick}
        aria-label={`Open ${alt}`}
      >
        {image}
      </button>
    );
  }

  return (
    <div className={`gallery-frame ${className}`} style={style}>
      {image}
    </div>
  );
};

export default GalleryFrame;