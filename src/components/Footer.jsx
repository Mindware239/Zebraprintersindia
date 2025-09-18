import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' }
      ]
    },
    {
      title: 'Products',
      links: [
        { name: 'Barcode Printers', path: '/products#printers' },
        { name: 'Barcode Scanners', path: '/products#scanners' },
        { name: 'Mobile Computers', path: '/products#mobile' },
        { name: 'Labels & Ribbons', path: '/products#labels' }
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Custom Labels', path: '/services#custom-labels' },
        { name: 'Printer Service', path: '/services#printer-service' },
        { name: 'Technical Support', path: '/services#support' },
        { name: 'Training', path: '/services#training' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' }
  ];

  const footerStyles = {
    backgroundColor: '#1f2937',
    color: '#ffffff'
  };

  const mainContentStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 16px',
    width: '100%'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    alignItems: 'start'
  };

  const companyInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  };

  const logoStyles = {
    width: '40px',
    height: '40px',
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const logoTextStyles = {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '20px'
  };

  const companyNameStyles = {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0
  };

  const companySubtextStyles = {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0
  };

  const descriptionStyles = {
    color: '#d1d5db',
    marginBottom: '16px',
    fontSize: '14px',
    lineHeight: 1.6
  };

  const contactInfoStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px'
  };

  const contactItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const iconStyles = {
    color: '#60a5fa'
  };

  const sectionTitleStyles = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#ffffff'
  };

  const linkListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const linkStyles = {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease'
  };

  const businessInfoStyles = {
    marginTop: '32px',
    paddingTop: '32px',
    borderTop: '1px solid #374151'
  };

  const businessGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
    fontSize: '14px',
    alignItems: 'start'
  };

  const businessSectionStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const businessTitleStyles = {
    fontWeight: '600',
    marginBottom: '8px',
    color: '#ffffff'
  };

  const businessTextStyles = {
    color: '#d1d5db',
    margin: 0
  };

  const socialLinksStyles = {
    display: 'flex',
    gap: '16px'
  };

  const socialLinkStyles = {
    color: '#9ca3af',
    transition: 'color 0.2s ease',
    textDecoration: 'none'
  };

  const bottomBarStyles = {
    backgroundColor: '#111827',
    padding: '16px 0'
  };

  const bottomContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  };

  const bottomTextStyles = {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0
  };

  const whatsappButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease'
  };

  return (
    <footer style={footerStyles}>
      {/* Main Footer Content */}
      <div style={mainContentStyles}>
        <div style={gridStyles}>
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={companyInfoStyles}>
              <div style={logoStyles}>
                <span style={logoTextStyles}>Z</span>
              </div>
              <div>
                <h3 style={companyNameStyles}>Zebra Printers India</h3>
                <p style={companySubtextStyles}>Mindware</p>
              </div>
            </div>
            <p style={descriptionStyles}>
              Leading manufacturer and supplier of barcode label printing solutions, 
              mobile computers, and RFID technology since 1997.
            </p>
            <div style={contactInfoStyles}>
              <div style={contactItemStyles}>
                <MapPin size={16} style={iconStyles} />
                <span>S-4, Plot No-7, Pocket-7, Pankaj Plaza, Near Metro Station, Sector-12 Dwarka, New Delhi - 110078</span>
              </div>
              <div style={contactItemStyles}>
                <Phone size={16} style={iconStyles} />
                <span>+91 9717122688</span>
              </div>
              <div style={contactItemStyles}>
                <Mail size={16} style={iconStyles} />
                <span>info@zebraprintersindia.com</span>
              </div>
            </div>
          </motion.div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h4 style={sectionTitleStyles}>{section.title}</h4>
              <div style={linkListStyles}>
                {section.links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    style={linkStyles}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#60a5fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#d1d5db';
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Business Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={businessInfoStyles}
        >
          <div style={businessGridStyles}>
            <div style={businessSectionStyles}>
              <h5 style={businessTitleStyles}>Business Details</h5>
              <p style={businessTextStyles}>Nature: Manufacturer & Supplier</p>
              <p style={businessTextStyles}>Employees: 11-25 People</p>
              <p style={businessTextStyles}>Established: 1997</p>
            </div>
            <div style={businessSectionStyles}>
              <h5 style={businessTitleStyles}>Legal Information</h5>
              <p style={businessTextStyles}>Status: Proprietorship</p>
              <p style={businessTextStyles}>GST: 07AFDPM9463K1ZY</p>
              <p style={businessTextStyles}>Turnover: Rs. 3-5 Crore</p>
            </div>
            <div style={businessSectionStyles}>
              <h5 style={businessTitleStyles}>Follow Us</h5>
              <div style={socialLinksStyles}>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    style={socialLinkStyles}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#60a5fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#9ca3af';
                    }}
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div style={bottomBarStyles}>
        <div style={bottomContainerStyles}>
          <p style={bottomTextStyles}>
            © {currentYear} Zebra Printers India. All Rights Reserved.
          </p>
          <div>
            <a
              href="https://wa.me/919717122688"
              target="_blank"
              rel="noopener noreferrer"
              style={whatsappButtonStyles}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
              }}
            >
              <MessageCircle size={16} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;