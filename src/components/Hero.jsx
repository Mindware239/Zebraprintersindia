import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import banner1 from '../assets/ban 1.png';
import banner2 from '../assets/ban 2.png';
import banner3 from '../assets/banner.png';
import banner4 from '../assets/ban4.png';
import './Hero.css';

const Hero = () => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Banner images array
  const bannerImages = [
    { src: banner1, alt: 'Ban 1' },
    { src: banner2, alt: 'Ban 2' },
    { src: banner4, alt: 'Ban 4' },
    { src: banner3, alt: 'Banner' }
  ];

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const heroStyles = {
    position: 'relative',
    width: '100%',
    maxWidth: '1400px',
    height: '608px',
    margin: '0 auto',
    marginTop: '2%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  };

  const sliderContainerStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  };

  const slideStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    transform: 'translateX(100%)',
    transition: 'all 0.8s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const imageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '16px'
  };

  const indicatorsStyles = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 10
  };

  const indicatorStyles = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const activeIndicatorStyles = {
    background: '#ff6b35',
    transform: 'scale(1.2)'
  };

  return (
    <div className="hero-container">
      <div className="slider-container">
        {/* Banner Slides */}
        {bannerImages.map((banner, index) => (
          <div
            key={index}
            className={`slide ${currentSlide === index ? 'active' : ''}`}
          >
            <img
              src={banner.src}
              alt={banner.alt}
              className="slide-image"
            />
          </div>
        ))}

        {/* Slide Indicators */}
        <div style={indicatorsStyles}>
          {bannerImages.map((_, index) => (
            <div
              key={index}
              style={{
                ...indicatorStyles,
                ...(currentSlide === index ? activeIndicatorStyles : {})
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
