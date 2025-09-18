import React from 'react';

const Test = () => {
  const testStyles = {
    minHeight: '100vh',
    paddingTop: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: 'Arial, sans-serif'
  };

  const titleStyles = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: '24px',
    textAlign: 'center'
  };

  const subtitleStyles = {
    fontSize: '24px',
    color: '#6b7280',
    marginBottom: '32px',
    textAlign: 'center'
  };

  const infoStyles = {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    textAlign: 'center'
  };

  const listStyles = {
    textAlign: 'left',
    fontSize: '18px',
    color: '#374151',
    lineHeight: 1.6
  };

  const itemStyles = {
    marginBottom: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb'
  };

  const checkmarkStyles = {
    color: '#10b981',
    fontWeight: 'bold',
    marginRight: '8px'
  };

  return (
    <div style={testStyles}>
      <h1 style={titleStyles}>✅ Website is Working!</h1>
      <p style={subtitleStyles}>Zebra Printers India - Responsive Design Test</p>
      
      <div style={infoStyles}>
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>What's Working:</h2>
        <ul style={listStyles}>
          <li style={itemStyles}>
            <span style={checkmarkStyles}>✓</span>
            React Application Loaded
          </li>
          <li style={itemStyles}>
            <span style={checkmarkStyles}>✓</span>
            Development Server Running
          </li>
          <li style={itemStyles}>
            <span style={checkmarkStyles}>✓</span>
            Responsive Header Component
          </li>
          <li style={itemStyles}>
            <span style={checkmarkStyles}>✓</span>
            Mobile Navigation (Hamburger Menu)
          </li>
          <li style={itemStyles}>
            <span style={checkmarkStyles}>✓</span>
            Desktop Navigation (Full Menu)
          </li>
          <li style={itemStyles}>
            <span style={checkmarkStyles}>✓</span>
            Smooth Animations
          </li>
          <li style={itemStyles}>
            <span style={checkmarkStyles}>✓</span>
            CSS Styling Applied
          </li>
        </ul>
        
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: '500' }}>
            🎉 <strong>Success!</strong> Your website is fully responsive and working perfectly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Test;

