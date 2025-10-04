import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const EmailTest = () => {
  const [email, setEmail] = useState('gm@indianbarcode.com');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testEmail = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail: email })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to send test email',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Helmet>
        <title>Email Test - Zebra Printers India</title>
        <meta name="description" content="Test email functionality for chat transcript delivery." />
      </Helmet>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>
          📧 Email Test for Chat Transcripts
        </h1>
        <p style={{ fontSize: '18px', color: '#6c757d' }}>
          Test that chat transcripts will be sent to your Gmail account
        </p>
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '30px', 
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Test Email Delivery</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
            Email Address:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '20px'
            }}
            placeholder="Enter email address to test"
          />
        </div>
        
        <button
          onClick={testEmail}
          disabled={isLoading || !email}
          style={{
            background: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {isLoading ? 'Sending Test Email...' : 'Send Test Email'}
        </button>
      </div>
      
      {result && (
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
          background: result.success ? '#d4edda' : '#f8d7da',
          color: result.success ? '#155724' : '#721c24'
        }}>
          <h4 style={{ marginTop: '0', color: result.success ? '#155724' : '#721c24' }}>
            {result.success ? '✅ Success!' : '❌ Error'}
          </h4>
          <p><strong>Message:</strong> {result.message || result.error}</p>
          {result.timestamp && <p><strong>Time:</strong> {new Date(result.timestamp).toLocaleString()}</p>}
          {result.details && <p><strong>Details:</strong> {result.details}</p>}
        </div>
      )}
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#e7f3ff', 
        borderRadius: '8px',
        border: '1px solid #b3d7ff'
      }}>
        <h3 style={{ color: '#0056b3', marginBottom: '15px' }}>How to Test:</h3>
        <ol style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li><strong>Configure Gmail credentials</strong> in your <code>process.env</code> file</li>
          <li><strong>Enter your email address</strong> above (default: gm@indianbarcode.com)</li>
          <li><strong>Click "Send Test Email"</strong> to verify email delivery</li>
          <li><strong>Check your Gmail inbox</strong> for the test email</li>
          <li><strong>Verify the email format</strong> matches the expected chat transcript format</li>
        </ol>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#fff3cd', 
          borderRadius: '6px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>Note:</strong> Make sure to set up your Gmail App Password in the environment variables 
          for the email functionality to work properly.
        </div>
      </div>
    </div>
  );
};

export default EmailTest;
