import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import serviceImage from '../assets/service-support.png';
import { 
  Headphones, 
  Wrench, 
  Download, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Users,
  Award,
  Shield,
  Zap,
  Globe,
  FileText,
  Video,
  MessageCircle,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Monitor,
  Hammer,
  ShieldCheck,
  MessageSquare,
  ExternalLink,
  Home,
  Laptop,
  Settings
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../components/ServiceSupport.css';

// Styled Card Component
const StyledCard = styled.div`
  .service-banner-card {
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
    .service-banner-card {
      height: 400px;
      border-radius: 30px;
      margin-top: -4rem;
    }
    
    .card-image {
      border-radius: 30px;
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

const ServiceSupport = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { isEnglish } = useLanguage();

  // Why Choose Our Service Center features
  const serviceFeatures = [
    {
      icon: Award,
      title: { en: 'Zebra  Service & Support', hi: 'ज़ेबरा अधिकृत सेवा और सहायता भागीदार' },
      description: { en: 'Zebra Printers sales & Service ', hi: 'ज़ेबरा टेक्नोलॉजीज से आधिकारिक प्राधिकरण' }
    },
    {
      icon: Settings,
      title: { en: 'Support for Zebra and other printer brands', hi: 'ज़ेबरा और अन्य प्रिंटर ब्रांडों के लिए सहायता' },
      description: { en: 'Expert repair services for all major printer brands', hi: 'सभी प्रमुख प्रिंटर ब्रांडों के लिए विशेषज्ञ मरम्मत सेवाएं' }
    },
    {
      icon: ShieldCheck,
      title: { en: '1-Year Free Warranty Support if purchased from us', hi: 'हमसे खरीदने पर 1-वर्ष मुफ्त वारंटी सहायता' },
      description: { en: 'Comprehensive warranty coverage for all purchases', hi: 'सभी खरीदारी के लिए व्यापक वारंटी कवरेज' }
    },
    {
      icon: Monitor,
      title: { en: 'Remote support via Anydesk / UltraViewer', hi: 'Anydesk / UltraViewer के माध्यम से दूरस्थ सहायता' },
      description: { en: 'Quick remote assistance for software issues', hi: 'सॉफ्टवेयर समस्याओं के लिए त्वरित दूरस्थ सहायता' }
    },
    {
      icon: Hammer,
      title: { en: 'Same-day in-office repair for hardware issues', hi: 'हार्डवेयर समस्याओं के लिए समान दिन कार्यालय में मरम्मत' },
      description: { en: 'Fast turnaround for hardware repairs', hi: 'हार्डवेयर मरम्मत के लिए त्वरित टर्नअराउंड' }
    },
    {
      icon: Globe,
      title: { en: 'Pan-India customer support', hi: 'पैन-इंडिया ग्राहक सहायता' },
      description: { en: 'Nationwide service coverage', hi: 'देशव्यापी सेवा कवरेज' }
    }
  ];

  // FAQ data based on your specifications
  const faqs = [
    {
      question: { 
        en: 'Do you provide printer repair services?', 
        hi: 'क्या आप प्रिंटर मरम्मत सेवाएं प्रदान करते हैं?' 
      },
      answer: { 
        en: 'Yes ✅ We are a Zebra support & service center, and we also repair other branded printers.', 
        hi: 'हां ✅ हम एक ज़ेबरा सहायता और सेवा केंद्र हैं, और हम अन्य ब्रांडेड प्रिंटरों की भी मरम्मत करते हैं।' 
      }
    },
    {
      question: { 
        en: 'Is your service free?', 
        hi: 'क्या आपकी सेवा मुफ्त है?' 
      },
      answer: { 
        en: 'Service is paid if you bought the printer from another seller. But if you purchase Zebra printers from us, you will get 1-year warranty support. Within warranty, service & support are free of cost.', 
        hi: 'यदि आपने प्रिंटर किसी अन्य विक्रेता से खरीदा है तो सेवा भुगतान योग्य है। लेकिन यदि आप हमसे ज़ेबरा प्रिंटर खरीदते हैं, तो आपको 1-वर्ष की वारंटी सहायता मिलेगी। वारंटी के भीतर, सेवा और सहायता मुफ्त है।' 
      }
    },
    {
      question: { 
        en: 'How do you provide support?', 
        hi: 'आप सहायता कैसे प्रदान करते हैं?' 
      },
      answer: { 
        en: 'We provide:\n🖥️ Remote Support via Anydesk or UltraViewer for software/driver issues.\n🛠️ In-office repair for hardware issues. Customers can bring their printer to our office and get it repaired hand-to-hand.', 
        hi: 'हम प्रदान करते हैं:\n🖥️ सॉफ्टवेयर/ड्राइवर समस्याओं के लिए Anydesk या UltraViewer के माध्यम से दूरस्थ सहायता।\n🛠️ हार्डवेयर समस्याओं के लिए कार्यालय में मरम्मत। ग्राहक अपना प्रिंटर हमारे कार्यालय में ला सकते हैं और हाथों-हाथ मरम्मत करवा सकते हैं।' 
      }
    },
    {
      question: { 
        en: 'Can you service Zebra printers outside warranty?', 
        hi: 'क्या आप वारंटी के बाहर ज़ेबरा प्रिंटरों की सेवा कर सकते हैं?' 
      },
      answer: { 
        en: 'Yes ✅ We provide paid support & repair services for Zebra and even other printer brands after warranty expires.', 
        hi: 'हां ✅ हम वारंटी समाप्त होने के बाद ज़ेबरा और यहां तक कि अन्य प्रिंटर ब्रांडों के लिए भुगतान योग्य सहायता और मरम्मत सेवाएं प्रदान करते हैं।' 
      }
    },
    {
      question: { 
        en: 'My printer is not working, how do I get help?', 
        hi: 'मेरा प्रिंटर काम नहीं कर रहा, मुझे मदद कैसे मिलेगी?' 
      },
      answer: { 
        en: 'Please share your issue. For software-related problems, we can assist online. For hardware problems, kindly bring your printer to our office:\n🏢 S 4, Plot No-7, Pocket-7, Pankaj Plaza, Near Metro Station, Sector-12, Dwarka, New Delhi 110078', 
        hi: 'कृपया अपनी समस्या साझा करें। सॉफ्टवेयर संबंधी समस्याओं के लिए, हम ऑनलाइन सहायता कर सकते हैं। हार्डवेयर समस्याओं के लिए, कृपया अपना प्रिंटर हमारे कार्यालय में लाएं:\n🏢 S 4, Plot No-7, Pocket-7, Pankaj Plaza, Near Metro Station, Sector-12, Dwarka, New Delhi 110078' 
      }
    },
    {
      question: { 
        en: 'Do you provide onsite visits?', 
        hi: 'क्या आप ऑनसाइट यात्राएं प्रदान करते हैं?' 
      },
      answer: { 
        en: 'Currently, we provide remote support and in-office repair. For onsite support, please contact our team to confirm availability.', 
        hi: 'वर्तमान में, हम दूरस्थ सहायता और कार्यालय में मरम्मत प्रदान करते हैं। ऑनसाइट सहायता के लिए, कृपया उपलब्धता की पुष्टि के लिए हमारी टीम से संपर्क करें।' 
      }
    }
  ];

  // Support process steps
  const supportProcess = [
    {
      step: '1️⃣',
      title: { en: 'Contact Us', hi: 'हमसे संपर्क करें' },
      description: { en: 'via phone/email to report the issue', hi: 'समस्या की रिपोर्ट करने के लिए फोन/ईमेल के माध्यम से' }
    },
    {
      step: '2️⃣',
      title: { en: 'Remote Troubleshooting', hi: 'दूरस्थ समस्या निवारण' },
      description: { en: 'Our technician will guide you with remote troubleshooting if possible', hi: 'हमारा तकनीशियन यदि संभव हो तो दूरस्थ समस्या निवारण में आपका मार्गदर्शन करेगा' }
    },
    {
      step: '3️⃣',
      title: { en: 'In-Office Repair', hi: 'कार्यालय में मरम्मत' },
      description: { en: 'For hardware problems, bring your printer to our Delhi service center', hi: 'हार्डवेयर समस्याओं के लिए, अपना प्रिंटर हमारे दिल्ली सेवा केंद्र में लाएं' }
    },
    {
      step: '4️⃣',
      title: { en: 'Same-Day Repair', hi: 'समान दिन मरम्मत' },
      description: { en: 'Get same-day repair for most issues', hi: 'अधिकांश समस्याओं के लिए समान दिन मरम्मत प्राप्त करें' }
    },
    {
      step: '5️⃣',
      title: { en: 'Warranty Check', hi: 'वारंटी जांच' },
      description: { en: 'If under warranty and purchased from us → Free service. If out of warranty or purchased elsewhere → Paid service', hi: 'यदि वारंटी के तहत और हमसे खरीदा गया → मुफ्त सेवा। यदि वारंटी से बाहर या कहीं और से खरीदा गया → भुगतान योग्य सेवा' }
    }
  ];

  // Contact information
  const contactInfo = {
    phone: '+91 8800839490, +91 8800122315',
    email: 'gm@indianbarcode.com',
    address: 'S 4, Plot No-7, Pocket-7, Pankaj Plaza, Near Metro Station, Sector-12, Dwarka, New Delhi 110078'
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>

      {/* Hero Section with Service & Support Banner Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StyledCard>
          <div className="service-banner-card">
            <div className="card-decoration"></div>
            <div className="card-decoration-2"></div>
            <div className="card-content">
              <img 
                src={serviceImage} 
                alt="Service & Support" 
                className="card-image"
              />
            </div>
          </div>
        </StyledCard>
      </div>

      {/* Why Choose Our Service Center Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '48px',
              color: '#1f2937'
            }}>
              {isEnglish ? 'Why Choose Our Service Center?' : 'हमारे सेवा केंद्र को क्यों चुनें?'}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '32px'
            }}>
              {serviceFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#f0f4ff',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <feature.icon size={24} color="#667eea" />
                    </div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {isEnglish ? feature.title.en : feature.title.hi}
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {isEnglish ? feature.description.en : feature.description.hi}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '48px',
              color: '#1f2937'
            }}>
              {isEnglish ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले प्रश्न'}
            </h2>
            
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    style={{
                      padding: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '18px',
                      fontWeight: '500',
                      color: '#1f2937',
                      border: 'none',
                      backgroundColor: 'transparent',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{isEnglish ? faq.question.en : faq.question.hi}</span>
                    {expandedFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        padding: '0 24px 24px',
                        fontSize: '16px',
                        color: '#6b7280',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {isEnglish ? faq.answer.en : faq.answer.hi}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '48px',
              color: '#1f2937'
            }}>
              {isEnglish ? 'How It Works (Support Process)' : 'यह कैसे काम करता है (सहायता प्रक्रिया)'}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {supportProcess.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '16px'
                  }}>
                    {step.step}
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '12px'
                  }}>
                    {isEnglish ? step.title.en : step.title.hi}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {isEnglish ? step.description.en : step.description.hi}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Our Support Team Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '48px',
              color: '#1f2937'
            }}>
              {isEnglish ? 'Contact Our Support Team' : 'हमारी सहायता टीम से संपर्क करें'}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}
              >
                <Phone size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                  {isEnglish ? 'Phone Support' : 'फोन सहायता'}
                </h3>
                <p style={{ fontSize: '18px', fontWeight: '500', color: '#374151', margin: 0 }}>
                  {contactInfo.phone}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}
              >
                <Mail size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                  {isEnglish ? 'Email Support' : 'ईमेल सहायता'}
                </h3>
                <p style={{ fontSize: '18px', fontWeight: '500', color: '#374151', margin: 0 }}>
                  {contactInfo.email}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}
              >
                <MapPin size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                  {isEnglish ? 'Office Address' : 'कार्यालय पता'}
                </h3>
                <p style={{ fontSize: '16px', color: '#374151', margin: 0, lineHeight: 1.6 }}>
                  {contactInfo.address}
                </p>
              </motion.div>
            </div>
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
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
              {isEnglish ? 'Need quick support for your Zebra or other printers?' : 'अपने ज़ेबरा या अन्य प्रिंटरों के लिए त्वरित सहायता चाहिए?'}
            </h2>
            <p style={{
              fontSize: '20px',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px',
              opacity: 0.9
            }}>
              {isEnglish 
                ? 'Call us now at +91 8800839490 or request a remote session via Anydesk.'
                : 'अभी हमें +91 8800839490 पर कॉल करें या Anydesk के माध्यम से दूरस्थ सत्र का अनुरोध करें।'
              }
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <motion.a
                href={`tel:${contactInfo.phone.split(',')[0].trim()}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: '#667eea',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #667eea',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a67d8';
                  e.target.style.borderColor = '#5a67d8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.borderColor = '#667eea';
                }}
              >
                <Phone size={20} />
                <span>{isEnglish ? 'Call Now' : 'अभी कॉल करें'}</span>
              </motion.a>
              <motion.a
                href={`mailto:${contactInfo.email}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: '#f093fb',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #f093fb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e879f9';
                  e.target.style.borderColor = '#e879f9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f093fb';
                  e.target.style.borderColor = '#f093fb';
                }}
              >
                <Mail size={20} />
                <span>{isEnglish ? 'Send Email' : 'ईमेल भेजें'}</span>
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: '#4facfe',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #4facfe',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4facfe';
                  e.target.style.borderColor = '#4facfe';
                }}
              >
                <MessageSquare size={20} />
                <span>{isEnglish ? 'Book Service Now' : 'अभी सेवा बुक करें'}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServiceSupport;
