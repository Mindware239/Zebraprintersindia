import React from 'react';
import logoImage from '../assets/logo.png';

const MINDWARELogo = ({ size = 60, showText = true, isMobile = false }) => {
  const logoWidth = isMobile ? 120 : 150;
  const logoHeight = isMobile ? 68 : 85;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit'
    }}>
      {/* MINDWARE Logo Image Only */}
      <img 
        src={logoImage} 
        alt="MINDWARE Logo" 
        style={{
          width: logoWidth,
          height: logoHeight,
          objectFit: 'contain',
          display: 'block'
        }}
        onLoad={() => {
          console.log('MINDWARE Logo loaded successfully');
        }}
        onError={(e) => {
          console.error('Logo image failed to load:', e.target.src);
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
};

export default MINDWARELogo;
