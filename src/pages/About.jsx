import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import aboutImage from '../assets/Zebra_aboutUs.png';
import { Award, Users, Target, Shield, CheckCircle, Star, Clock, MapPin, Building, Trophy, FileText, Phone, Download, ArrowRight, Calendar, Factory, Globe, Heart, Zap, Truck, Headphones } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Styled Card Component
const StyledCard = styled.div`
  .about-banner-card {
    width: 100%;
    height: 500px;
    background: rgb(223, 225, 235);
    border-radius: 50px;
    box-shadow: rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    margin-top: -6rem;
  }
  
  .card-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    position: relative;
  }
  
  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50px;
  }
  
  .card-text-overlay {
    position: absolute;
    top: 50%;
    left: 2rem;
    transform: translateY(-50%);
    z-index: 3;
    max-width: 50%;
  }
  
  .card-title {
    font-size: clamp(1.5rem, 3.5vw, 2.5rem);
    font-weight: bold;
    color: #000000;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
  }
  
  .card-subtitle {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    font-weight: 600;
    color: #000000;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
    margin: 0;
    line-height: 1.4;
  }
  
  .card-decoration {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
    border-radius: 50%;
    z-index: 1;
  }
  
  .card-decoration-2 {
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 150px;
    height: 150px;
    background: linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
    border-radius: 50%;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    .about-banner-card {
      height: 400px;
      border-radius: 30px;
      margin-top: -4rem;
    }
    
    .card-image {
      border-radius: 30px;
    }
    
    .card-text-overlay {
      left: 1rem;
      max-width: 60%;
    }
    
    .card-title {
      font-size: clamp(1.2rem, 4vw, 1.8rem);
    }
    
    .card-subtitle {
      font-size: clamp(0.8rem, 2.5vw, 1rem);
    }
    
    .card-decoration {
      width: 150px;
      height: 150px;
      top: -30px;
      right: -30px;
    }
    
    .card-decoration-2 {
      width: 100px;
      height: 100px;
      bottom: -20px;
      left: -20px;
    }
  }
`;

const About = () => {
  const { isEnglish } = useLanguage();
  const [counters, setCounters] = useState({
    years: 0,
    clients: 0,
    labels: 0,
    network: 0
  });

  // Counter animation effect
  useEffect(() => {
    const animateCounters = () => {
      const targets = { years: 27, clients: 10000, labels: 1000000, network: 50 };
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setCounters({
          years: Math.floor(targets.years * progress),
          clients: Math.floor(targets.clients * progress),
          labels: Math.floor(targets.labels * progress),
          network: Math.floor(targets.network * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateCounters, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const pageStyles = {
    minHeight: '100vh',
    paddingTop: '80px',
    fontFamily: '"Segoe UI", "Roboto", sans-serif'
  };

  const heroSectionStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    color: '#ffffff',
    padding: '100px 0',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const titleStyles = {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: '700',
    marginBottom: '24px',
    textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
    color: '#ffffff',
    lineHeight: 1.2,
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
    letterSpacing: '-0.02em'
  };

  const descriptionStyles = {
    fontSize: 'clamp(18px, 3vw, 22px)',
    maxWidth: '768px',
    margin: '0 auto',
    lineHeight: 1.6,
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    color: '#ffffff',
    fontWeight: '400',
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
    letterSpacing: '0.01em'
  };

  const sectionStyles = {
    padding: '80px 0',
    backgroundColor: '#ffffff'
  };

  const sectionTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px',
    textAlign: 'center',
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
    letterSpacing: '-0.02em'
  };

  const sectionDescriptionStyles = {
    fontSize: '18px',
    color: '#6b7280',
    maxWidth: '768px',
    margin: '0 auto 64px',
    textAlign: 'center',
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
    fontWeight: '400',
    lineHeight: 1.7,
    letterSpacing: '0.01em'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginTop: '64px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px'
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '24px'
    }
  };

  const cardStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden'
  };

  const iconStyles = {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
  };

  const cardTitleStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
    letterSpacing: '-0.01em'
  };

  const cardDescriptionStyles = {
    color: '#6b7280',
    lineHeight: 1.6,
    fontSize: '15px',
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
    fontWeight: '400',
    letterSpacing: '0.01em'
  };

  // Timeline data
  const timelineData = [
    { year: '1997', title: { en: 'Company Established', hi: 'कंपनी की स्थापना' }, description: { en: 'Founded in New Delhi as Mindware', hi: 'नई दिल्ली में माइंडवेयर के रूप में स्थापित' } },
    { year: '2000', title: { en: 'First 1000+ Clients', hi: 'पहले 1000+ ग्राहक' }, description: { en: 'Reached milestone of serving 1000+ businesses', hi: '1000+ व्यवसायों की सेवा का मील का पत्थर हासिल किया' } },
    { year: '2005', title: { en: ' Zebra Partner', hi: ' जेब्रा पार्टनर' }, description: { en: 'Zebra Printers service partner', hi: ' प्रिंटर्स सेवा भागीदार बने' } },
    { year: '2010', title: { en: 'PAN India Expansion', hi: 'पैन इंडिया विस्तार' }, description: { en: 'Expanded services across all major Indian cities', hi: 'सभी प्रमुख भारतीय शहरों में सेवाओं का विस्तार' } },
    { year: '2018', title: { en: 'Manufacturing Facility', hi: 'विनिर्माण सुविधा' }, description: { en: 'Established modern manufacturing facility in Delhi', hi: 'दिल्ली में आधुनिक विनिर्माण सुविधा स्थापित' } },
    { year: '2024', title: { en: 'Leading Manufacturer', hi: 'अग्रणी निर्माता' }, description: { en: 'Leading manufacturer of labels, ribbons & RFID solutions', hi: 'लेबल, रिबन और आरएफआईडी समाधान का अग्रणी निर्माता' } }
  ];

  // Achievements data
  const achievements = [
    {
      icon: Trophy,
      title: { en: 'Zebra Service Partner', hi: 'जेब्रा सेवा भागीदार' },
      description: { en: 'Zebra Printers service partner', hi: 'जेब्रा प्रिंटर्स सेवा भागीदार' }
    },
    {
      icon: Users,
      title: { en: '10,000+ Clients Served', hi: '10,000+ ग्राहकों की सेवा' },
      description: { en: 'Serving businesses across India', hi: 'पूरे भारत में व्यवसायों की सेवा' }
    },
    {
      icon: FileText,
      title: { en: 'Expert Engineers', hi: 'विशेषज्ञ इंजीनियर' },
      description: { en: 'Team of experienced technicians & engineers', hi: 'अनुभवी तकनीशियन और इंजीनियरों की टीम' }
    },
    {
      icon: Factory,
      title: { en: 'Leading Manufacturer', hi: 'अग्रणी निर्माता' },
      description: { en: 'Leading manufacturer of labels, ribbons & RFID solutions', hi: 'लेबल, रिबन और आरएफआईडी समाधान का अग्रणी निर्माता' }
    }
  ];

  // Statistics data
  const statistics = [
    { icon: Clock, value: `${counters.years}+`, label: { en: 'Years of Experience', hi: 'वर्षों का अनुभव' } },
    { icon: Users, value: `${counters.clients.toLocaleString()}+`, label: { en: 'Happy Clients', hi: 'खुश ग्राहक' } },
    { icon: Factory, value: `${counters.labels.toLocaleString()}+`, label: { en: 'Labels Printed Daily', hi: 'प्रतिदिन छपे लेबल' } },
    { icon: Globe, value: `${counters.network}+`, label: { en: 'Cities Served', hi: 'सेवित शहर' } }
  ];

  // Differentiators
  const differentiators = [
    { icon: Zap, title: { en: 'Best Price Guarantee', hi: 'सर्वोत्तम मूल्य गारंटी' } },
    { icon: Shield, title: { en: 'Service Support', hi: 'सेवा सहायता' } },
    { icon: Headphones, title: { en: '24x7 Customer Assistance', hi: '24x7 ग्राहक सहायता' } },
    { icon: Factory, title: { en: 'Custom Manufacturing', hi: 'कस्टम निर्माण' } }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Delhi Hospital',
      text: { en: 'Excellent service and quality products. Their technical support is outstanding.', hi: 'उत्कृष्ट सेवा और गुणवत्ता वाले उत्पाद। उनका तकनीकी समर्थन उत्कृष्ट है।' },
      rating: 5
    },
    {
      name: 'Priya Sharma',
      company: 'Mumbai Retail Chain',
      text: { en: 'Reliable partner for all our barcode needs. Highly recommended!', hi: 'हमारी सभी बारकोड जरूरतों के लिए भरोसेमंद साथी। अत्यधिक अनुशंसित!' },
      rating: 5
    },
    {
      name: 'Amit Patel',
      company: 'Gujarat Manufacturing',
      text: { en: 'Professional team with excellent product knowledge and support.', hi: 'उत्कृष्ट उत्पाद ज्ञान और समर्थन के साथ पेशेवर टीम।' },
      rating: 5
    }
  ];

  return (
    <div style={pageStyles}>
      {/* Hero Section with About Banner Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StyledCard>
          <div className="about-banner-card">
            <div className="card-decoration"></div>
            <div className="card-decoration-2"></div>
            <div className="card-content">
              <img 
                src={aboutImage} 
                alt="About Us" 
                className="card-image"
              />
              <div className="card-text-overlay">
                <h1 className="card-title">
                  {isEnglish ? 'About Mindware / Zebra Printers India' : 'माइंडवेयर / जेब्रा प्रिंटर्स इंडिया के बारे में'}
                </h1>
                <p className="card-subtitle">
                  {isEnglish 
                    ? 'Delivering Reliable Barcode & Printing Solutions Since 1997'
                    : '1997 से भरोसेमंद बारकोड और प्रिंटिंग समाधान प्रदान कर रहे हैं'
                  }
                </p>
              </div>
            </div>
          </div>
        </StyledCard>
      </div>

      {/* Company Introduction */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'About Us: Mindware—India\'s Undisputed Leader in Identification and Printing Technology' : 'हमारे बारे में: माइंडवेयर—भारत में पहचान और प्रिंटिंग तकनीक का निर्विवाद नेता'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'Since 1997, Mindware has been the powerhouse of the Automatic Identification (Auto-ID) and Point-of-Sale (POS) industry in India. We are more than just a supplier; we are a dedicated partner committed to revolutionizing how businesses track, identify, and transact. We are proudly recognized as India\'s pride in the market for superior Labels, Tags, Wristbands, and PVC Cards, and our expertise continues to set the benchmark in Thermal Printers and consumables. Our core mission is to empower businesses with the precision and reliability required for seamless operations.'
                : '1997 से, माइंडवेयर भारत में ऑटोमैटिक आइडेंटिफिकेशन (ऑटो-आईडी) और पॉइंट-ऑफ-सेल (पीओएस) उद्योग का पावरहाउस रहा है। हम केवल एक आपूर्तिकर्ता नहीं हैं; हम एक समर्पित साझेदार हैं जो इस बात के लिए प्रतिबद्ध हैं कि व्यवसाय कैसे ट्रैक करते हैं, पहचानते हैं और लेनदेन करते हैं।'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mindware: The Consumable Advantage */}
      <section style={{...sectionStyles, backgroundColor: '#f8fafc'}}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Mindware: The Consumable Advantage' : 'माइंडवेयर: कंज्यूमेबल एडवांटेज'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'At Mindware, we understand that hardware is only as good as the consumables it uses. Our commitment to world-class quality is why we confidently state: Without Mindware, no one can imagine the quality needed for critical consumables.'
                : 'माइंडवेयर में, हम समझते हैं कि हार्डवेयर उतना ही अच्छा है जितना कि वह कंज्यूमेबल्स का उपयोग करता है।'
              }
            </p>
          </motion.div>

          <div style={gridStyles}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Factory size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'Barcode Labels & Thermal Ribbons' : 'बारकोड लेबल और थर्मल रिबन'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'We are pioneers in premium Barcode Labels and high-standard Thermal Ribbons, guaranteeing optimal print quality and durability for every application.'
                  : 'हम प्रीमियम बारकोड लेबल और उच्च-मानक थर्मल रिबन में अग्रणी हैं।'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Trophy size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'Quality for Industry Giants' : 'उद्योग दिग्गजों के लिए गुणवत्ता'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'No one can imagine truly reliable labels for Zebra Printers or efficient scanning with Zebra Scanners without the precision and quality assurance of Mindware\'s consumables.'
                  : 'माइंडवेयर के कंज्यूमेबल्स की सटीकता और गुणवत्ता आश्वासन के बिना जेब्रा प्रिंटर के लिए वास्तव में भरोसेमंद लेबल की कल्पना नहीं की जा सकती।'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Zap size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'RFID Excellence' : 'आरएफआईडी उत्कृष्टता'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'We lead in advanced tracking with RFID Inlay Manufacturing, superior RFID Labels, and comprehensive RFID Solutions.'
                  : 'हम आरएफआईडी इनले निर्माण, श्रेष्ठ आरएफआईडी लेबल और व्यापक आरएफआईडी समाधान के साथ उन्नत ट्रैकिंग में अग्रणी हैं।'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section style={{...sectionStyles, backgroundColor: '#f8fafc'}}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Our Journey' : 'हमारी यात्रा'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'Key milestones that shaped our success'
                : 'हमारी सफलता को आकार देने वाले प्रमुख मील के पत्थर'
              }
            </p>
          </motion.div>

          <div style={{ position: 'relative', marginTop: '64px' }}>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              transform: 'translateX(-50%)'
            }}></div>
            
            {timelineData.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '48px',
                  flexDirection: index % 2 === 0 ? 'row' : 'row-reverse'
                }}
              >
                <div style={{
                  flex: 1,
                  padding: index % 2 === 0 ? '0 32px 0 0' : '0 0 0 32px',
                  textAlign: index % 2 === 0 ? 'right' : 'left'
                }}>
                  <div style={cardStyles}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <Calendar size={24} color="#ffffff" />
                      <span style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#667eea'
                      }}>{item.year}</span>
                    </div>
                    <h3 style={cardTitleStyles}>
                      {isEnglish ? item.title.en : item.title.hi}
                    </h3>
                    <p style={cardDescriptionStyles}>
                      {isEnglish ? item.description.en : item.description.hi}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  zIndex: 10
                }}></div>
                
                <div style={{ flex: 1 }}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Achievements */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Our Achievements' : 'हमारी उपलब्धियां'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'Recognition and milestones that define our success'
                : 'मान्यता और मील के पत्थर जो हमारी सफलता को परिभाषित करते हैं'
              }
            </p>
          </motion.div>

          <div style={gridStyles}>
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title.en}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={cardStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={iconStyles}>
                  <achievement.icon size={28} color="#ffffff" />
                </div>
                <h3 style={cardTitleStyles}>
                  {isEnglish ? achievement.title.en : achievement.title.hi}
                </h3>
                <p style={cardDescriptionStyles}>
                  {isEnglish ? achievement.description.en : achievement.description.hi}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industrial Printing Solutions & Service */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Industrial Printing Solutions & Service' : 'औद्योगिक प्रिंटिंग समाधान और सेवा'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'We are the ultimate destination for your entire printing ecosystem, from the core hardware to expert maintenance and specialized parts.'
                : 'हम आपके पूरे प्रिंटिंग इकोसिस्टम के लिए अंतिम गंतव्य हैं, मूल हार्डवेयर से लेकर विशेषज्ञ रखरखाव और विशेष भागों तक।'
              }
            </p>
          </motion.div>

          <div style={gridStyles}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Building size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'End-to-End Printer Expertise' : 'एंड-टू-एंड प्रिंटर विशेषज्ञता'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'While our consumables define the market standard for all brands, our hardware portfolio ensures you always have access to the right equipment. We proudly sell and service printers from leading global manufacturers, including TSC, Godex, Citizen, and Toshiba.'
                  : 'जबकि हमारे कंज्यूमेबल्स सभी ब्रांडों के लिए बाजार मानक को परिभाषित करते हैं।'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Shield size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'Focused on Service and Spares' : 'सेवा और स्पेयर पर केंद्रित'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'We maintain a sharp focus on minimizing your operational downtime with Printer Heads & Spares specialization and genuine high-quality inventory for all major thermal printer brands.'
                  : 'हम सभी प्रमुख थर्मल प्रिंटर ब्रांडों के लिए प्रिंटर हेड्स और स्पेयर विशेषज्ञता के साथ आपके परिचालन डाउनटाइम को कम करने पर तेज फोकस रखते हैं।'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Trophy size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'Zebra Service Center' : 'जेब्रा सेवा केंद्र'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'We operate a specialized Service Center providing expert, authorized maintenance and technical support for Zebra Printers, ensuring your equipment runs flawlessly year after year.'
                  : 'हम एक विशेष सेवा केंद्र संचालित करते हैं जो जेब्रा प्रिंटर के लिए विशेषज्ञ, अधिकृत रखरखाव और तकनीकी समर्थन प्रदान करता है।'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Identification and Tracking Solutions */}
      <section style={{...sectionStyles, backgroundColor: '#f8fafc'}}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Identification and Tracking Solutions' : 'पहचान और ट्रैकिंग समाधान'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'Beyond barcode printing, Mindware excels in niche identification and tracking technologies that ensure accuracy and security across various sectors.'
                : 'बारकोड प्रिंटिंग से परे, माइंडवेयर विभिन्न क्षेत्रों में सटीकता और सुरक्षा सुनिश्चित करने वाली आला पहचान और ट्रैकिंग तकनीकों में उत्कृष्टता प्राप्त करता है।'
              }
            </p>
          </motion.div>

          <div style={gridStyles}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Users size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'Specialized Wristbands' : 'विशेष कलाईबंद'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'We provide critical identification solutions, including robust Wristbands for Sports, highly secure RFID Wristbands, and dedicated Wristbands for Patient Tracking in healthcare settings.'
                  : 'हम महत्वपूर्ण पहचान समाधान प्रदान करते हैं, जिसमें खेल के लिए मजबूत कलाईबंद, अत्यधिक सुरक्षित आरएफआईडी कलाईबंद और स्वास्थ्य सेवा सेटिंग्स में रोगी ट्रैकिंग के लिए समर्पित कलाईबंद शामिल हैं।'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <FileText size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'PVC Cards' : 'पीवीसी कार्ड'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'We are a leading supplier of high-quality PVC Cards and related consumables for card printers.'
                  : 'हम कार्ड प्रिंटर के लिए उच्च गुणवत्ता वाले पीवीसी कार्ड और संबंधित कंज्यूमेबल्स के अग्रणी आपूर्तिकर्ता हैं।'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Vision & Mission' : 'दृष्टि और मिशन'}
            </h2>
          </motion.div>

          <div style={gridStyles}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Target size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'Our Vision' : 'हमारी दृष्टि'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'To be India\'s most trusted partner for barcode and printing solutions, empowering businesses to achieve operational excellence through innovative technology.'
                  : 'बारकोड और प्रिंटिंग समाधान के लिए भारत का सबसे भरोसेमंद साथी बनना, नवाचार तकनीक के माध्यम से व्यवसायों को परिचालन उत्कृष्टता प्राप्त करने में सशक्त बनाना।'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={cardStyles}
            >
              <div style={iconStyles}>
                <Heart size={32} color="#ffffff" />
              </div>
              <h3 style={cardTitleStyles}>
                {isEnglish ? 'Our Mission' : 'हमारा मिशन'}
              </h3>
              <p style={cardDescriptionStyles}>
                {isEnglish 
                  ? 'Providing innovative products, reliable support, and affordable solutions to empower businesses of all sizes. We are committed to delivering exceptional value through quality products, expert service, and continuous innovation.'
                  : 'सभी आकार के व्यवसायों को सशक्त बनाने के लिए नवाचार उत्पाद, भरोसेमंद समर्थन और किफायती समाधान प्रदान करना। हम गुणवत्ता वाले उत्पाद, विशेषज्ञ सेवा और निरंतर नवाचार के माध्यम से असाधारण मूल्य प्रदान करने के लिए प्रतिबद्ध हैं।'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Numbers That Impress' : 'प्रभावशाली संख्याएं'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'Our achievements in numbers'
                : 'संख्याओं में हमारी उपलब्धियां'
              }
            </p>
          </motion.div>

          <div style={gridStyles}>
            {statistics.map((stat, index) => (
              <motion.div
                key={stat.label.en}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  ...cardStyles,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff'
                }}
              >
                <div style={{
                  ...iconStyles,
                  background: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <stat.icon size={30} color="#ffffff" />
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  {stat.value}
                </div>
                <p style={{
                  ...cardDescriptionStyles,
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  {isEnglish ? stat.label.en : stat.label.hi}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{...sectionStyles, backgroundColor: '#f8fafc'}}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Why Choose Us' : 'हमें क्यों चुनें'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'What sets us apart from the competition'
                : 'हमें प्रतिस्पर्धा से अलग क्या बनाता है'
              }
            </p>
          </motion.div>

          <div style={gridStyles}>
            {differentiators.map((item, index) => (
              <motion.div
                key={item.title.en}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={cardStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={iconStyles}>
                  <item.icon size={32} color="#ffffff" />
                </div>
                <h3 style={cardTitleStyles}>
                  {isEnglish ? item.title.en : item.title.hi}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment & Guarantee */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Our Commitment & Guarantee' : 'हमारी प्रतिबद्धता और गारंटी'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'As your one-stop solution provider since 1997, Mindware relentlessly works across various industry verticals, offering solutions tailored to distinct business needs. We serve and empower industries including: Retail, Hospitality, Logistics, Healthcare, Security, Salon & Spa, and Gas Stations.'
                : '1997 से आपके वन-स्टॉप समाधान प्रदाता के रूप में, माइंडवेयर विभिन्न उद्योग क्षेत्रों में अथक रूप से काम करता है।'
              }
            </p>
          </motion.div>

          <div style={gridStyles}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                ...cardStyles,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff'
              }}
            >
              <div style={{
                ...iconStyles,
                background: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Trophy size={32} color="#ffffff" />
              </div>
              <h3 style={{
                ...cardTitleStyles,
                color: '#ffffff'
              }}>
                {isEnglish ? 'Top Selection' : 'शीर्ष चयन'}
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                ...cardStyles,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#ffffff'
              }}
            >
              <div style={{
                ...iconStyles,
                background: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Zap size={32} color="#ffffff" />
              </div>
              <h3 style={{
                ...cardTitleStyles,
                color: '#ffffff'
              }}>
                {isEnglish ? 'Great Value' : 'महान मूल्य'}
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                ...cardStyles,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: '#ffffff'
              }}
            >
              <div style={{
                ...iconStyles,
                background: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Shield size={32} color="#ffffff" />
              </div>
              <h3 style={{
                ...cardTitleStyles,
                color: '#ffffff'
              }}>
                {isEnglish ? 'Top-Notch Services' : 'शीर्ष-नॉच सेवाएं'}
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                ...cardStyles,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: '#ffffff'
              }}
            >
              <div style={{
                ...iconStyles,
                background: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Heart size={32} color="#ffffff" />
              </div>
              <h3 style={{
                ...cardTitleStyles,
                color: '#ffffff'
              }}>
                {isEnglish ? 'Exceptional Assistance' : 'असाधारण सहायता'}
              </h3>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              textAlign: 'center',
              marginTop: '48px',
              padding: '32px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}
          >
            <p style={{
              fontSize: '18px',
              color: '#1f2937',
              lineHeight: 1.6,
              margin: '0 0 16px 0'
            }}>
              {isEnglish 
                ? 'Partner with Mindware to leverage our two decades of experience and ensure your business operates with the precision, reliability, and superior quality that only India\'s best can provide.'
                : 'हमारे दो दशकों के अनुभव का लाभ उठाने और अपने व्यवसाय को सटीकता, विश्वसनीयता और श्रेष्ठ गुणवत्ता के साथ संचालित करने के लिए माइंडवेयर के साथ साझेदारी करें।'
              }
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              fontStyle: 'italic',
              margin: 0
            }}>
              {isEnglish 
                ? 'Disclaimer: All brands, logos, and trademarks mentioned, including but not limited to Zebra, TSC, Godex, Citizen, and Toshiba, are the property of their respective owners and are not the property of Mindware. We sell and service products from these companies.'
                : 'अस्वीकरण: उल्लिखित सभी ब्रांड, लोगो और ट्रेडमार्क, जिनमें जेब्रा, टीएससी, गोडेक्स, सिटीजन और टोशिबा शामिल हैं, उनके संबंधित मालिकों की संपत्ति हैं।'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: '#ffffff',
        color: '#1f2937',
        textAlign: 'center'
      }}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              {isEnglish ? 'Ready to Work With Us?' : 'हमारे साथ काम करने के लिए तैयार हैं?'}
            </h2>
            <p style={{
              fontSize: '20px',
              marginBottom: '32px',
              maxWidth: '512px',
              margin: '0 auto 32px'
            }}>
              {isEnglish 
                ? 'Join thousands of satisfied customers who trust us with their barcode solutions'
                : 'हजारों संतुष्ट ग्राहकों के साथ जुड़ें जो अपने बारकोड समाधान के लिए हम पर भरोसा करते हैं'
              }
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center'
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: '#667eea',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #667eea',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
                onClick={() => window.open('https://wa.me/918800839490?text=Hi, I want to know more about your barcode solutions', '_blank')}
              >
                <Phone size={20} />
                {isEnglish ? 'Contact Us Now' : 'अभी संपर्क करें'}
                <ArrowRight size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: '#f093fb',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #f093fb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
                onClick={() => window.open('/contact', '_blank')}
              >
                <Download size={20} />
                {isEnglish ? 'Download Company Profile' : 'कंपनी प्रोफाइल डाउनलोड करें'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
