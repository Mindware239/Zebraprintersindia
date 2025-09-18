import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onClose }) => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginType, setLoginType] = useState('username'); // 'username' or 'email'

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginType === 'username') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    
    try {
      const credentials = {
        password: formData.password,
        rememberMe: formData.rememberMe
      };

      if (loginType === 'username') {
        credentials.username = formData.username;
      } else {
        credentials.email = formData.email;
      }

      const result = await login(credentials, formData.rememberMe);
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLoginType = () => {
    setLoginType(prev => prev === 'username' ? 'email' : 'username');
    setErrors({});
    setFormData(prev => ({
      ...prev,
      username: '',
      email: ''
    }));
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="loginType" className="form-label">
              Login with:
            </label>
            <div className="login-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${loginType === 'username' ? 'active' : ''}`}
                onClick={() => setLoginType('username')}
              >
                Username
              </button>
              <button
                type="button"
                className={`toggle-btn ${loginType === 'email' ? 'active' : ''}`}
                onClick={() => setLoginType('email')}
              >
                Email
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={loginType} className="form-label">
              {loginType === 'username' ? 'Username' : 'Email Address'}
            </label>
            <input
              type={loginType === 'email' ? 'email' : 'text'}
              id={loginType}
              name={loginType}
              value={formData[loginType]}
              onChange={handleInputChange}
              className={`form-input ${errors[loginType] ? 'error' : ''}`}
              placeholder={loginType === 'username' ? 'Enter your username' : 'Enter your email'}
              disabled={isSubmitting}
            />
            {errors[loginType] && (
              <span className="error-message">{errors[loginType]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <span className="checkmark"></span>
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            className={`login-btn ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button className="link-btn" onClick={toggleLoginType}>
              {loginType === 'username' ? 'Use email instead' : 'Use username instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

