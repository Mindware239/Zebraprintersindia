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
    paddingTop: '80px'
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
    fontWeight: 'bold',
    marginBottom: '24px',
    textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
    color: '#ffffff',
    lineHeight: 1.2
  };

  const descriptionStyles = {
    fontSize: 'clamp(18px, 3vw, 22px)',
    maxWidth: '768px',
    margin: '0 auto',
    lineHeight: 1.6,
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    color: '#ffffff',
    fontWeight: '500'
  };

  const sectionStyles = {
    padding: '80px 0',
    backgroundColor: '#ffffff'
  };

  const sectionTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
    textAlign: 'center'
  };

  const sectionDescriptionStyles = {
    fontSize: '20px',
    color: '#6b7280',
    maxWidth: '768px',
    margin: '0 auto 64px',
    textAlign: 'center'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    marginTop: '64px'
  };

  const cardStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'box-shadow 0.3s ease'
  };

  const iconStyles = {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  };

  const cardTitleStyles = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const cardDescriptionStyles = {
    color: '#6b7280',
    lineHeight: 1.6
  };

  // Timeline data
  const timelineData = [
    { year: '1997', title: { en: 'Company Established', hi: 'कंपनी की स्थापना' }, description: { en: 'Founded in New Delhi as Mindware Technologies', hi: 'नई दिल्ली में माइंडवेयर टेक्नोलॉजीज के रूप में स्थापित' } },
    { year: '2000', title: { en: 'First 1000+ Clients', hi: 'पहले 1000+ ग्राहक' }, description: { en: 'Reached milestone of serving 1000+ businesses', hi: '1000+ व्यवसायों की सेवा का मील का पत्थर हासिल किया' } },
    { year: '2005', title: { en: 'Authorized Zebra Partner', hi: 'अधिकृत जेब्रा पार्टनर' }, description: { en: 'Became authorized Zebra Printers service partner', hi: 'अधिकृत जेब्रा प्रिंटर्स सेवा भागीदार बने' } },
    { year: '2010', title: { en: 'PAN India Expansion', hi: 'पैन इंडिया विस्तार' }, description: { en: 'Expanded services across all major Indian cities', hi: 'सभी प्रमुख भारतीय शहरों में सेवाओं का विस्तार' } },
    { year: '2018', title: { en: 'Manufacturing Facility', hi: 'विनिर्माण सुविधा' }, description: { en: 'Established modern manufacturing facility in Delhi', hi: 'दिल्ली में आधुनिक विनिर्माण सुविधा स्थापित' } },
    { year: '2024', title: { en: 'Leading Manufacturer', hi: 'अग्रणी निर्माता' }, description: { en: 'Leading manufacturer of labels, ribbons & RFID solutions', hi: 'लेबल, रिबन और आरएफआईडी समाधान का अग्रणी निर्माता' } }
  ];

  // Achievements data
  const achievements = [
    {
      icon: Award,
      title: { en: 'ISO 9001:2015 Certified', hi: 'ISO 9001:2015 प्रमाणित' },
      description: { en: 'Quality management system certification', hi: 'गुणवत्ता प्रबंधन प्रणाली प्रमाणन' }
    },
    {
      icon: Trophy,
      title: { en: 'Authorized Zebra Partner', hi: 'अधिकृत जेब्रा पार्टनर' },
      description: { en: 'Official Zebra Printers service partner', hi: 'आधिकारिक जेब्रा प्रिंटर्स सेवा भागीदार' }
    },
    {
      icon: Users,
      title: { en: '10,000+ Clients Served', hi: '10,000+ ग्राहकों की सेवा' },
      description: { en: 'Serving businesses across India', hi: 'पूरे भारत में व्यवसायों की सेवा' }
    },
    {
      icon: FileText,
      title: { en: 'Certified Engineers', hi: 'प्रमाणित इंजीनियर' },
      description: { en: 'Team of certified technicians & engineers', hi: 'प्रमाणित तकनीशियन और इंजीनियरों की टीम' }
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
    { icon: Shield, title: { en: 'Authorized Service Support', hi: 'अधिकृत सेवा सहायता' } },
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
              {isEnglish ? 'Our Story' : 'हमारी कहानी'}
            </h2>
            <p style={sectionDescriptionStyles}>
              {isEnglish 
                ? 'Founded in 1997, Zebra Printers India (by Mindware) is a leading provider of barcode printers, labels, ribbons, and complete print solutions across India. With 27+ years of industry experience, we serve retail, healthcare, logistics, and manufacturing sectors with unmatched expertise.'
                : '1997 में स्थापित, जेब्रा प्रिंटर्स इंडिया (माइंडवेयर द्वारा) भारत भर में बारकोड प्रिंटर, लेबल, रिबन और पूर्ण प्रिंट समाधान का अग्रणी प्रदाता है। 27+ वर्षों के उद्योग अनुभव के साथ, हम खुदरा, स्वास्थ्य सेवा, रसद और विनिर्माण क्षेत्रों की बेजोड़ विशेषज्ञता के साथ सेवा करते हैं।'
              }
            </p>
          </motion.div>
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
                      <Calendar size={24} color="#667eea" />
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

      {/* Achievements & Certifications */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={sectionTitleStyles}>
              {isEnglish ? 'Achievements & Certifications' : 'उपलब्धियां और प्रमाणपत्र'}
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
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={iconStyles}>
                  <achievement.icon size={32} color="#667eea" />
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

      {/* Vision & Mission */}
      <section style={{...sectionStyles, backgroundColor: '#f8fafc'}}>
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
                <Target size={32} color="#667eea" />
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
                <Heart size={32} color="#667eea" />
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
                  <stat.icon size={32} color="#ffffff" />
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
                  <item.icon size={32} color="#667eea" />
                </div>
                <h3 style={cardTitleStyles}>
                  {isEnglish ? item.title.en : item.title.hi}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        color: '#ffffff',
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
                  backgroundColor: '#ffffff',
                  color: '#667eea',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
                onClick={() => window.open('https://wa.me/919810822688?text=Hi, I want to know more about your barcode solutions', '_blank')}
              >
                <Phone size={20} />
                {isEnglish ? 'Contact Us Now' : 'अभी संपर्क करें'}
                <ArrowRight size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #ffffff',
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