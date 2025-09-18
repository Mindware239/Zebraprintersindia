import React, { useState, useEffect } from "react";
import styled from "styled-components";
import contactImage from "../assets/contact.png";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Globe, 
  Zap,
  Shield,
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  FileText,
  CheckCircle,
  Star,
  Sparkles,
  User,
  Building,
  MessageSquare as MessageIcon,
  BarChart3,
  PieChart,
  Activity,
  X,
  ExternalLink,
  Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import WhatsAppForm from "../components/whatsapp-form";
import WhatsAppFloatingButton from "../components/whatsapp-floating-button";
import { useModal } from "../components/modals/modal-context";
// Removed MetallicCard, AnimatedButton, and SocialMediaCard imports - using inline components

// Styled Card Component
const StyledCard = styled.div`
  .contact-banner-card {
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
    margin-top: -1rem;
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
    top: 35%;
    right: 2rem;
    transform: translateY(-50%);
    z-index: 3;
  }
  
  .card-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: bold;
    color: #000000;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .contact-banner-card {
      height: 400px;
      border-radius: 30px;
      margin-top: -0.5rem;
    }
    
    .card-image {
      border-radius: 30px;
    }
    
    .card-text-overlay {
      right: 1rem;
    }
    
    .card-title {
      font-size: clamp(1.5rem, 6vw, 2.5rem);
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
`;

// WhatsApp Logo Component
const WhatsAppLogo = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

export default function Contact() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [whatsAppFormData, setWhatsAppFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isSubmittingWhatsApp, setIsSubmittingWhatsApp] = useState(false);
  const [showWhatsAppSuccess, setShowWhatsAppSuccess] = useState(false);
  const [, setLocation] = useLocation();
  
  // Use the centralized modal system
  const { openModal } = useModal();
  
  // Dynamic data state
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch contact info from API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
        // Fallback to static data if API fails
        setContactInfo([
          { id: "1", type: "phone", title: "Sales Phone", value: "+91-9717122688", description: "Call us for sales inquiries", icon: "Phone", isActive: true, sortOrder: 1 },
          { id: "2", type: "phone", title: "Support Phone", value: "+91-9810822688", description: "Call us for technical support", icon: "Phone", isActive: true, sortOrder: 2 },
          { id: "3", type: "email", title: "General Email", value: "gulshanmarwah@indianbarcode.com", description: "Email us for general inquiries", icon: "Mail", isActive: true, sortOrder: 3 },
          { id: "4", type: "address", title: "Office Address", value: "MINDWARE, S-4, Plot No-7, Pocket-7, Pankaj Plaza, Near Metro Station, Sector-12, Dwarka, New Delhi-110078, India", description: "Visit our office for personalized consultation", icon: "MapPin", isActive: true, sortOrder: 4 },
          { id: "5", type: "social_media", title: "LinkedIn", value: "https://linkedin.com/company/indianbarcode", description: "Follow us on LinkedIn", icon: "Linkedin", isActive: true, sortOrder: 5 },
          { id: "6", type: "social_media", title: "Instagram", value: "https://instagram.com/indianbarcode", description: "Follow us on Instagram", icon: "Instagram", isActive: true, sortOrder: 6 },
          { id: "7", type: "social_media", title: "Facebook", value: "https://facebook.com/indianbarcode", description: "Follow us on Facebook", icon: "Facebook", isActive: true, sortOrder: 7 },
          { id: "8", type: "social_media", title: "Twitter", value: "https://twitter.com/indianbarcode", description: "Follow us on Twitter/X", icon: "Twitter", isActive: true, sortOrder: 8 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      Phone,
      Mail,
      MapPin,
      Linkedin,
      Instagram,
      Facebook,
      Twitter,
      MessageCircle
    };
    return iconMap[iconName] || Phone;
  };

  const contactOptions = [
    {
      id: "form",
      title: "Fill Form",
      description: "Quick form submission for instant support.",
      icon: FileText,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-300",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      iconColor: "#2563eb"
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "Instant chat for immediate assistance.",
      icon: WhatsAppLogo,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-300",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      iconColor: "#25D366"
    },
    {
      id: "call",
      title: "Call Now",
      description: "Direct phone support with experts.",
      icon: Phone,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-300",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      iconColor: "#9333ea"
    },
    {
      id: "email",
      title: "Email Us",
      description: "Send detailed queries via email.",
      icon: Mail,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-300",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
      iconColor: "#ea580c"
    }
  ];

  // Get social media links from dynamic data
  const socialMediaLinks = contactInfo
    .filter(info => info.type === 'social_media' && info.isActive)
    .map(info => {
      const IconComponent = getIconComponent(info.icon);
      const colorMap = {
        Linkedin: "hsl(201, 96%, 32%)",
        Instagram: "hsl(329, 100%, 50%)",
        Facebook: "hsl(221, 44%, 41%)",
        Twitter: "hsl(203, 89%, 53%)"
      };
      const bgColorMap = {
        Linkedin: "hsl(201, 96%, 32%, 0.1)",
        Instagram: "hsl(329, 100%, 50%, 0.1)",
        Facebook: "hsl(221, 44%, 41%, 0.1)",
        Twitter: "hsl(203, 89%, 53%, 0.1)"
      };
      
      return {
        name: info.title,
        icon: IconComponent,
        url: info.value,
        color: colorMap[info.icon] || "hsl(0, 0%, 0%)",
        bgColor: bgColorMap[info.icon] || "hsl(0, 0%, 0%, 0.1)",
        description: info.description
      };
    });

  // Fallback social media data if API fails
  const fallbackSocialMedia = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/company/indianbarcode",
      color: "hsl(201, 96%, 32%)",
      bgColor: "hsl(201, 96%, 32%, 0.1)",
      description: "Follow us on LinkedIn"
    },
    {
      name: "Instagram", 
      icon: Instagram,
      url: "https://instagram.com/indianbarcode",
      color: "hsl(329, 100%, 50%)",
      bgColor: "hsl(329, 100%, 50%, 0.1)",
      description: "Follow us on Instagram"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/indianbarcode", 
      color: "hsl(221, 44%, 41%)",
      bgColor: "hsl(221, 44%, 41%, 0.1)",
      description: "Follow us on Facebook"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/indianbarcode",
      color: "hsl(203, 89%, 53%)",
      bgColor: "hsl(203, 89%, 53%, 0.1)",
      description: "Follow us on Twitter/X"
    }
  ];

  // Use fallback data if no social media links are loaded
  const displaySocialMediaLinks = socialMediaLinks.length > 0 ? socialMediaLinks : fallbackSocialMedia;

  const handleOptionClick = (optionId) => {
    if (optionId === "form") {
      openModal('contact-form');
    } else if (optionId === "call") {
      openModal('call-popup');
    } else if (optionId === "whatsapp") {
      openModal('whatsapp-form');
    } else if (optionId === "email") {
      window.open('mailto:gulshanmarwah@indianbarcode.com?subject=Inquiry from Website&body=Hello, I would like to know more about your barcode and RFID solutions.', '_blank');
    } else {
      setSelectedOption(optionId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Contact Banner Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StyledCard>
          <div className="contact-banner-card">
            <div className="card-decoration"></div>
            <div className="card-decoration-2"></div>
            <div className="card-content">
              <img 
                src={contactImage} 
                alt="Contact Us" 
                className="card-image"
              />
              <div className="card-text-overlay">
                <h1 className="card-title">Contact Us</h1>
              </div>
            </div>
          </div>
        </StyledCard>
      </div>

      {/* Help Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="relative">
              {/* Card Background */}
              <div className="w-full h-auto min-h-[400px] rounded-[50px] bg-[#e0e0e0] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-12">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold mb-4 text-gray-900">
                    We are here to help you
                  </h2>
                  <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
                </div>
                
                <div className="prose prose-lg max-w-none text-black leading-relaxed">
                  <p className="text-lg mb-6 text-justify font-medium leading-8 text-black">
                    Our sales and technical staff is very qualified to understand your specific barcoding application and then recommend the best alternatives to give you the value-priced solution you need. In addition, Indian Barcode will connect you with one of our certified Reseller Partners in your area that specializes in barcoding solutions for your particular requirements. Our Reseller Partner will work with you over the phone and in person, providing software, and service solutions for your application.
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <p className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Please feel free to contact us, our customer service center is working for you.
                    </p>
                    <div className="flex items-center justify-center gap-8 mt-6">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-bold">24/7 Support</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-bold">Instant Response</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-bold">Expert Team</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Options Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose how you'd like to connect with us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select your preferred contact method below
          </p>
        </div>

        <div className="flex justify-center items-center gap-8 flex-wrap">
          {contactOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <div
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Icon */}
                <IconComponent 
                  className="w-24 h-24 mb-4"
                  style={{ color: option.iconColor }}
                />
                
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {option.title}
                </h3>
                
                {/* Description */}
                <p className="text-base text-gray-600 mb-5 text-center leading-relaxed">
                  {option.description}
                </p>
                
                {/* Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(option.id);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginTop: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {option.id === "form" ? "Fill Form" : 
                   option.id === "whatsapp" ? "WhatsApp" : 
                   option.id === "call" ? "Call Now" : 
                   option.id === "email" ? "Email Us" : "Button"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton />

      {/* Social Media Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Follow Us on Social Media
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay connected with us for the latest updates, industry insights, and exclusive offers.
          </p>
        </div>

        <div className="flex justify-center items-center gap-8 flex-wrap">
          {displaySocialMediaLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <div
                key={social.name}
                style={{
                  background: social.bgColor || '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
                onClick={() => window.open(social.url, '_blank')}
              >
                <IconComponent 
                  size={48} 
                  style={{ color: social.color || '#667eea', marginBottom: '16px' }}
                />
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  {social.name}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {social.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Maps Location Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Find Our Office
          </h2>
          <p className="text-lg text-gray-600">
            Visit us at our office for personalized consultation and support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.5!2d77.0431384!3d28.5905887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b3b8df2f243%3A0x4da4e90cceab74f0!2sMINDWARE%20(TSC%20PRINTERS%20SERVICE%20CENTER)!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MINDWARE TSC PRINTERS SERVICE CENTER Location"
              ></iframe>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Office Location</h3>
            </div>
            
            <div className="space-y-4">
              {contactInfo
                .filter(info => info.isActive)
                .map(info => {
                  const IconComponent = getIconComponent(info.icon);
                  return (
                    <div key={info.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <IconComponent className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-base mb-1">{info.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {info.value}
                        </p>
                        {info.description && (
                          <p className="text-gray-500 text-xs mt-1">{info.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Recognition Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Trust & Recognition
          </h2>
          <p className="text-lg text-gray-600">
            Our achievements, certifications, and trusted partnerships
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Trust Badges */}
          <Card className="bg-white shadow-xl border border-gray-200 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Trust Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">ISO Certified</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Award Winner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="bg-white shadow-xl border border-gray-200 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">ISO 9001:2015</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Quality Assured</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp QR */}
          <Card className="bg-white shadow-xl border border-gray-200 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <WhatsAppLogo className="w-6 h-6 text-green-600" />
                WhatsApp QR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="w-40 h-40 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center shadow-md p-2">
                  <div className="w-36 h-36 bg-white rounded flex items-center justify-center relative">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/919810822688?text=Hello%20Sir"
                      alt="WhatsApp QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">Scan to Chat</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}