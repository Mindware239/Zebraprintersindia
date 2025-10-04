import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  FileText, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { CookieManager, trackInteraction } from '../utils/cookieManager';

const ContactForm = ({ onSubmit, isSubmitting = false, showSuccess = false, showError = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    company: '',
    city: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [cookieConsent, setCookieConsent] = useState(null);

  useEffect(() => {
    // Check cookie consent status
    const consent = CookieManager.hasConsented();
    setCookieConsent(consent);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data immediately - NO VALIDATION ON CHANGE
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Track user interaction if consent given
    if (cookieConsent === true) {
      trackInteraction('form_field_change', { field: name, value: value.length > 0 ? 'filled' : 'empty' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Mobile validation
    const mobileRegex = /^[0-9]{10,}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!mobileRegex.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Mobile number must contain only digits and be at least 10 digits long';
    }
    
    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message/Requirement is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only validate on form submission
    if (validateForm() && onSubmit) {
      // Track form submission if consent given
      if (cookieConsent === true) {
        trackInteraction('form_submission_attempt', { 
          formType: 'contact',
          fieldsFilled: Object.keys(formData).filter(key => formData[key].trim()).length
        });
      }
      
      onSubmit(formData);
    }
  };

  const InputField = ({ name, label, type = 'text', placeholder, icon: Icon, required = false, textarea = false }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white hover:border-gray-400"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
        />
      )}
      {errors[name] && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Contact Us</h3>
            <p className="text-blue-100 text-sm">We'll get back to you within 24 hours</p>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300 ml-auto" />
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Thank you! Your details have been submitted successfully.</p>
              <p className="text-green-600 text-sm">Our team will contact you shortly.</p>
            </div>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Failed to send message</p>
              <p className="text-red-600 text-sm">Please try again or contact us directly.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              icon={User}
              required
            />
            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              icon={Mail}
              required
            />
          </div>

          {/* Mobile and City Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="mobile"
              label="Mobile Number"
              type="tel"
              placeholder="Enter your mobile number"
              icon={Phone}
              required
            />
            <InputField
              name="city"
              label="City"
              placeholder="Enter your city"
              icon={MapPin}
              required
            />
          </div>

          {/* Company Row */}
          <InputField
            name="company"
            label="Company/Organization Name"
            placeholder="Your company or organization name (optional)"
            icon={Building}
          />

          {/* Message Row */}
          <InputField
            name="message"
            label="Message/Requirement"
            placeholder="Please describe your requirements in detail..."
            icon={FileText}
            textarea
            required
          />

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </div>

          {/* Required Fields Note */}
          <p className="text-xs text-gray-500 text-center">
            All fields marked with <span className="text-red-500">*</span> are required
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
