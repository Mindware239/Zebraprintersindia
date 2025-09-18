import React from 'react';
import logoImage from '../assets/logo.png';

const MINDWARELogo = ({ size = 180, showText = true, isMobile = false }) => {
  const logoSize = isMobile ? size * 0.9 : size;
  const textSize = isMobile ? '14px' : '16px';
  const subtextSize = isMobile ? '10px' : '12px';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '6px' : '8px',
      textDecoration: 'none',
      color: 'inherit'
    }}>
      {/* MINDWARE Logo Image */}
      <img 
        src={logoImage} 
        alt="MINDWARE Logo" 
        style={{
          width: logoSize,
          height: logoSize,
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default MINDWARELogo;
