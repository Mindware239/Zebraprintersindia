import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  MapPin,
  Package
} from 'lucide-react';
import { CookieManager, trackInteraction } from '../utils/cookieManager';

// InputField component moved outside to prevent re-creation on every render
const InputField = ({ 
  name, 
  label, 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  required = false, 
  textarea = false,
  select = false,
  options = [],
  value,
  onChange,
  error,
  maxLength,
  inputMode,
  pattern
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {textarea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white hover:border-gray-400 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    ) : select ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    )}
    {error && (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const EnhancedContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    location: '',
    company: '',
    productService: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [cookieConsent, setCookieConsent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check cookie consent status
    const consent = CookieManager.hasConsented();
    setCookieConsent(consent);
  }, []);

  const productServiceOptions = useMemo(() => [
    'Printers',
    'Labels',
    'Scanners',
    'Software',
    'RFID',
    'Tablets',
    'Printer Heads',
    'Other'
  ], []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Special handling for mobile number field
    if (name === 'mobile') {
      // Only allow digits, +, -, spaces, and parentheses
      const allowedChars = /^[0-9+\-\s()]*$/;
      if (!allowedChars.test(value)) {
        return; // Don't update if invalid characters
      }
      
      // Auto-format: if user types 10 digits without +91, add +91-
      let formattedValue = value;
      const cleanValue = value.replace(/[\s\-\(\)]/g, '');
      
      if (cleanValue.length === 10 && !cleanValue.startsWith('+91')) {
        formattedValue = '+91-' + cleanValue;
      } else if (cleanValue.length === 13 && cleanValue.startsWith('+91')) {
        formattedValue = '+91-' + cleanValue.substring(3);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      // Update form data immediately for other fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
    
    // Track user interaction if consent given
    if (cookieConsent === true) {
      trackInteraction('form_field_change', { field: name, value: value.length > 0 ? 'filled' : 'empty' });
    }
  }, [cookieConsent]);

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
    
    // Mobile validation - Allow country code or 10 digit Indian number
    const mobileRegex = /^(\+?\d{1,3}[-.\s]?)?\d{10,}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!mobileRegex.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid mobile number (10 digits or with country code)';
    }
    
    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'State / City / Country is required';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }
    
    // Product/Service validation
    if (!formData.productService) {
      newErrors.productService = 'Please select a Product / Service';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      // Track form submission if consent given
      if (cookieConsent === true) {
        trackInteraction('enhanced_form_submission_attempt', { 
          formType: 'enhanced_contact',
          productService: formData.productService
        });
      }
      
      console.log('📤 Submitting form data:', formData);
      
      const response = await fetch('/api/contact/enhanced-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cookieConsent: cookieConsent
        }),
      });

      console.log('📥 Response status:', response.status);
      
      const result = await response.json();
      console.log('📥 Response result:', result);

      if (response.ok && result.success) {
        console.log('✅ Form submitted successfully!');
        setShowSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          mobile: '',
          location: '',
          company: '',
          productService: '',
          message: ''
        });
        setErrors({});
        
        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 8000);
      } else {
        console.error('❌ Form submission failed:', result.error || result);
        setShowError(true);
        // Show alert with error details for debugging
        alert(`Submission failed: ${result.error || 'Unknown error'}\n\nPlease contact us directly via phone or email.`);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setShowError(true);
      // Show alert with error details for debugging
      alert(`Error: ${error.message || 'Network error'}\n\nPlease check your internet connection or contact us directly.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Contact Us</h3>
            <p className="text-blue-100 text-sm">Please fill out the form below and our team will get back to you promptly.</p>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300 ml-auto animate-pulse" />
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
        {showSuccess && (
          <div className="mb-6 p-5 bg-green-50 border-2 border-green-300 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-green-800 font-bold text-lg">Thank you for contacting us.</p>
              <p className="text-green-700 text-sm mt-1">Our team will reach out to you soon.</p>
            </div>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-red-800 font-bold text-lg">Failed to send message</p>
              <p className="text-red-700 text-sm mt-1">Please try again or contact us directly via phone or email.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              icon={User}
              required
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
            />
            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your business email"
              icon={Mail}
              required
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
            />
          </div>

          {/* Mobile and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              name="mobile"
              label="Mobile Number"
              type="tel"
              placeholder="+91-9876543210 or 9876543210"
              icon={Phone}
              required
              maxLength="14"
              inputMode="numeric"
              pattern="[0-9+\-\s()]*"
              value={formData.mobile}
              onChange={handleInputChange}
              error={errors.mobile}
            />
            <InputField
              name="location"
              label="State / City / Country"
              placeholder="Select your location"
              icon={MapPin}
              required
              value={formData.location}
              onChange={handleInputChange}
              error={errors.location}
            />
          </div>

          {/* Company Name Row */}
          <InputField
            name="company"
            label="Company Name"
            placeholder="Enter your company or organization name (optional)"
            icon={Building}
            value={formData.company}
            onChange={handleInputChange}
            error={errors.company}
          />

          {/* Product/Service Dropdown */}
          <InputField
            name="productService"
            label="Product / Service"
            icon={Package}
            select
            options={productServiceOptions}
            required
            value={formData.productService}
            onChange={handleInputChange}
            error={errors.productService}
          />

          {/* Message Row */}
          <InputField
            name="message"
            label="Message"
            placeholder="Write your message, query, or requirements here"
            icon={FileText}
            textarea
            required
            value={formData.message}
            onChange={handleInputChange}
            error={errors.message}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Submit
                </>
              )}
            </button>
          </div>

          {/* Required Fields Note */}
          <p className="text-sm text-gray-600 text-center pt-2">
            All fields marked with <span className="text-red-500 font-bold">*</span> are required
          </p>
        </form>
      </div>
    </div>
  );
};

export default EnhancedContactForm;