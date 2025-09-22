import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import './ContactSection.css';

const ContactSection = () => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const schema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    company: yup.string().required('Company name is required'),
    message: yup.string().required('Message is required')
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    reset();
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const sectionStyles = {
    padding: '80px 0',
    backgroundColor: '#f8fafc'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const sectionHeaderStyles = {
    textAlign: 'center',
    marginBottom: '64px'
  };

  const sectionTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px'
  };

  const sectionDescriptionStyles = {
    fontSize: '20px',
    color: '#6b7280',
    maxWidth: '768px',
    margin: '0 auto'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '48px',
    alignItems: 'start'
  };

  const contactInfoStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  };

  const contactTitleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  };

  const contactListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  };

  const contactItemStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  };

  const contactIconStyles = {
    width: '48px',
    height: '48px',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const contactContentStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const contactItemTitleStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937'
  };

  const contactItemDetailsStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '14px',
    color: '#6b7280'
  };

  const quickActionsStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const quickActionsTitleStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  };

  const quickActionsListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const quickActionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  const quickActionIconStyles = {
    width: '20px',
    height: '20px'
  };

  const quickActionTextStyles = {
    fontSize: '14px',
    fontWeight: '500'
  };

  const formStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '32px'
  };

  const formTitleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const formDescriptionStyles = {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px'
  };

  const successStyles = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px'
  };

  const successContentStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const successIconStyles = {
    width: '24px',
    height: '24px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const successTitleStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#065f46',
    margin: 0
  };

  const formGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  };

  const formGroupStyles = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyles = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const textareaStyles = {
    ...inputStyles,
    resize: 'vertical',
    minHeight: '120px'
  };

  const errorStyles = {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '4px'
  };

  const submitButtonStyles = {
    width: '100%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'background-color 0.2s ease'
  };

  const disabledButtonStyles = {
    opacity: 0.5,
    cursor: 'not-allowed'
  };

  const contactInfo = [
    {
      icon: Phone,
      titleKey: 'contact.info.phone.title',
      details: ['+91 9717122688', 'Mon-Fri 9AM-6PM'],
      color: '#10b981'
    },
    {
      icon: Mail,
      titleKey: 'contact.info.email.title',
      details: ['info@zebraprintersindia.com', 'support@zebraprintersindia.com'],
      color: '#2563eb'
    },
    {
      icon: MapPin,
      titleKey: 'contact.info.address.title',
      details: [
        'S-4, Plot No-7, Pocket-7, Pankaj Plaza',
        'Near Metro Station, Sector-12 Dwarka',
        'New Delhi - 110078, India'
      ],
      color: '#ef4444'
    },
    {
      icon: Clock,
      titleKey: 'contact.info.hours.title',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 2:00 PM', 'Sunday: Closed'],
      color: '#8b5cf6'
    }
  ];

  const quickActions = [
    {
      icon: MessageCircle,
      title: 'WhatsApp Chat',
      description: 'Get instant support via WhatsApp',
      action: 'https://wa.me/919717122688',
      color: '#10b981'
    },
    {
      icon: Phone,
      title: 'Call Now',
      description: 'Speak directly with our experts',
      action: 'tel:+919717122688',
      color: '#2563eb'
    },
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us a detailed message',
      action: 'mailto:info@zebraprintersindia.com',
      color: '#8b5cf6'
    }
  ];

  return (
    <section className="contact-container">
      <div className="contact-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="contact-info"
        >
          <h2 style={sectionTitleStyles}>{getTranslation('contact.title', language)}</h2>
          <p style={sectionDescriptionStyles}>
            {getTranslation('contact.description', language)}
          </p>
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={contactInfoStyles}
          >
            <div>
              <h3 style={contactTitleStyles}>{getTranslation('contact.info.title', language)}</h3>
              <div style={contactListStyles}>
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={contactItemStyles}
                  >
                    <div style={contactIconStyles}>
                      <info.icon size={24} color={info.color} />
                    </div>
                    <div style={contactContentStyles}>
                      <h4 style={contactItemTitleStyles}>{getTranslation(info.titleKey, language)}</h4>
                      <div style={contactItemDetailsStyles}>
                        {info.details.map((detail, idx) => (
                          <p key={idx} style={{ margin: 0 }}>{detail}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={quickActionsStyles}
            >
              <h4 style={quickActionsTitleStyles}>Quick Actions</h4>
              <div style={quickActionsListStyles}>
                {quickActions.map((action, index) => (
                  <a
                    key={action.title}
                    href={action.action}
                    target={action.action.startsWith('http') ? '_blank' : '_self'}
                    rel={action.action.startsWith('http') ? 'noopener noreferrer' : ''}
                    style={quickActionStyles}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <action.icon size={20} color={action.color} style={quickActionIconStyles} />
                    <div>
                      <div style={quickActionTextStyles}>{action.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{action.description}</div>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="contact-form"
        >
            <h3 style={formTitleStyles}>{getTranslation('contact.form.title', language)}</h3>
            <p style={formDescriptionStyles}>
              {getTranslation('contact.form.description', language)}
            </p>
            
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={successStyles}
              >
                <div style={successContentStyles}>
                  <div style={successIconStyles}>
                    <CheckCircle size={16} color="#ffffff" />
                  </div>
                  <div>
                    <h4 style={successTitleStyles}>{getTranslation('contact.form.success.title', language)}</h4>
                    <p style={{ color: '#047857', margin: 0, fontSize: '14px' }}>{getTranslation('contact.form.success.description', language)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{getTranslation('contact.form.name.label', language)}</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="form-input"
                    placeholder={getTranslation('contact.form.name.placeholder', language)}
                  />
                  {errors.name && (
                    <p style={errorStyles}>{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{getTranslation('contact.form.phone.label', language)}</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="form-input"
                    placeholder={getTranslation('contact.form.phone.placeholder', language)}
                  />
                  {errors.phone && (
                    <p style={errorStyles}>{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{getTranslation('contact.form.email.label', language)}</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="form-input"
                    placeholder={getTranslation('contact.form.email.placeholder', language)}
                  />
                  {errors.email && (
                    <p style={errorStyles}>{errors.email.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{getTranslation('contact.form.company.label', language)}</label>
                  <input
                    {...register('company')}
                    type="text"
                    className="form-input"
                    placeholder={getTranslation('contact.form.company.placeholder', language)}
                  />
                  {errors.company && (
                    <p style={errorStyles}>{errors.company.message}</p>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">{getTranslation('contact.form.message.label', language)}</label>
                <textarea
                  {...register('message')}
                  className="form-textarea"
                  placeholder={getTranslation('contact.form.message.placeholder', language)}
                />
                {errors.message && (
                  <p style={errorStyles}>{errors.message.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="submit-button"
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>{getTranslation('contact.form.sending', language)}</span>
                  </>
                ) : (
                  <>
                    <Send size={24} />
                    <span>{getTranslation('contact.form.submit', language)}</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
