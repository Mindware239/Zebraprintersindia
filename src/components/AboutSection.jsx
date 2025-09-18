import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Users, Clock, Target, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
// Removed MissionCard, AchievementCard, and BusinessInfoCard imports - using inline components

const AboutSection = () => {
  const { language } = useLanguage();
  
  const achievements = [
    {
      icon: Award,
      title: '25+ Years Experience',
      description: 'Established in 1997, we have been serving businesses across India'
    },
    {
      icon: Users,
      title: '1000+ Happy Customers',
      description: 'Trusted by businesses of all sizes across various industries'
    },
    {
      icon: Target,
      title: '50+ Product Categories',
      description: 'Comprehensive range of barcode solutions and accessories'
    },
    {
      icon: Shield,
      title: 'Quality Certified',
      description: 'ISO certified manufacturing and quality assurance processes'
    }
  ];

  const services = [
    'Manufacturers of certified Labels and Ribbons',
    'Dealer and Distributor of all kinds of Barcode Label Printers from Zebra',
    'Dealer and Distributors of all kinds of Zebra Barcode Scanners',
    'Service Center for all Zebra Barcode Label Printers and Scanners',
    'Custom label design and printing services',
    'Technical support and training programs'
  ];

  const industries = [
    'Transportation & Logistics',
    'Retail & E-commerce',
    'Manufacturing',
    'Healthcare',
    'Food & Beverage',
    'Automotive',
    'Pharmaceutical',
    'Education'
  ];

  const businessInfo = [
    { label: 'Nature of Business', value: 'Manufacturer & Supplier', icon: Target },
    { label: 'Employees', value: '11 to 25 People', icon: Users },
    { label: 'Established', value: '1997', icon: Clock },
    { label: 'Legal Status', value: 'Proprietorship', icon: Shield },
    { label: 'Annual Turnover', value: 'Rs. 3 - 5 Crore', icon: Award },
    { label: 'GST No', value: '07AFDPM9463K1ZY', icon: CheckCircle }
  ];

  const sectionStyles = {
    padding: '80px 0 40px 0',
    backgroundColor: '#ffffff'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const gridStyles = {

    
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '64px',
    alignItems: 'center'
  };

  const contentStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  };

  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    width: 'fit-content',
    marginBottom: '16px'
  };

  const titleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px',
    lineHeight: 1.2
  };

  const highlightStyles = {
    color: '#8b5cf6',
    display: 'block'
  };

  const descriptionStyles = {
    fontSize: '18px',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '16px',
    textAlign: 'justify',
    textJustify: 'inter-word'
  };

  const businessInfoStyles = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px'
  };

  const businessTitleStyles = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  };

  const businessGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    fontSize: '14px'
  };

  const businessItemStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const businessLabelStyles = {
    fontWeight: '500',
    color: '#374151'
  };

  const businessValueStyles = {
    color: '#6b7280'
  };

  const rightContentStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  };

  const achievementsTitleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  };

  const achievementsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px'
  };

  const achievementCardStyles = {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.3s ease'
  };

  const achievementIconStyles = {
    width: '48px',
    height: '48px',
    backgroundColor: '#dbeafe',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px'
  };

  const achievementTitleStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const achievementDescriptionStyles = {
    fontSize: '14px',
    color: '#6b7280'
  };

  const expertiseTitleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  };

  const servicesListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const serviceItemStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  };

  const serviceIconStyles = {
    color: '#10b981',
    flexShrink: 0,
    marginTop: '2px'
  };

  const serviceTextStyles = {
    color: '#374151',
    fontSize: '14px',
    lineHeight: 1.5
  };

  const industriesTitleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  };

  const industriesListStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  };

  const industryTagStyles = {
    padding: '6px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500'
  };

  const missionSectionStyles = {
    marginTop: '40px',
    textAlign: 'center'
  };

  const missionCardStyles = {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    borderRadius: '16px',
    padding: '48px',
    color: '#ffffff'
  };

  const missionTitleStyles = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '16px'
  };

  const missionDescriptionStyles = {
    fontSize: '20px',
    maxWidth: '768px',
    margin: '0 auto',
    lineHeight: 1.6
  };

  return (
    <section style={sectionStyles}>
      <div style={containerStyles}>
        <div style={gridStyles}>
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={contentStyles}
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={badgeStyles}
              >
                <Award size={16} style={{ marginRight: '8px' }} />
                About Zebra Printers India
              </motion.div>
              
              <h2 style={titleStyles}>
                Your Trusted Partner in
                <span style={highlightStyles}>Barcode Solutions</span>
              </h2>
              
              <p style={descriptionStyles}>
                Since 1997, Zebra Printers India has been at the forefront of barcode technology, 
                providing comprehensive solutions to businesses across India. We specialize in 
                manufacturing, distribution, and service of barcode printers, scanners, and 
                related accessories.
              </p>

              <p style={descriptionStyles}>
                Our organization is driven with the motto to offer maximum client satisfaction 
                through our range of Labels, Stickers, Tags & Thermal Ribbon and Offset Printing 
                Services. We manufacture products according to client specifications and customize 
                them for specific applications.
              </p>
            </div>

            {/* Business Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Business Information
                </h3>
                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  {businessInfo.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <item.icon size={20} style={{ color: '#667eea', marginRight: '12px' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{item.label}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={rightContentStyles}
          >
            {/* Achievements */}
            <div>
              <h3 style={achievementsTitleStyles}>Our Achievements</h3>
              <div style={achievementsGridStyles}>
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: '#ffffff'
                      }}>
                        <achievement.icon size={24} />
                      </div>
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        {achievement.title}
                      </h4>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                      }}>
                        {achievement.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Our Expertise */}
            <div>
              <h3 style={expertiseTitleStyles}>Our Expertise</h3>
              <div style={servicesListStyles}>
                {services.map((service, index) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    style={serviceItemStyles}
                  >
                    <CheckCircle size={20} style={serviceIconStyles} />
                    <span style={serviceTextStyles}>{service}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Industries We Serve */}
            <div>
              <h3 style={industriesTitleStyles}>Industries We Serve</h3>
              <div style={industriesListStyles}>
                {industries.map((industry, index) => (
                  <motion.span
                    key={industry}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    style={industryTagStyles}
                  >
                    {industry}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={missionSectionStyles}
        >
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              Our Mission
            </h2>
            <p style={{
              fontSize: '1.125rem',
              lineHeight: '1.6',
              opacity: '0.9',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              To provide cutting-edge Zebra barcode solutions that empower businesses across India with reliable, efficient, and innovative technology for seamless operations and growth.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;