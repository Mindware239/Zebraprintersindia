import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: January 10, 2025</p>
        </header>

        <main className="privacy-content">
          <section className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              Zebra Printers India ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website zebraprintersindia.com.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us, including:</p>
            <ul>
              <li>Name and contact information (email, phone number)</li>
              <li>Company/organization details</li>
              <li>Location information (country, city)</li>
              <li>Communication preferences</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect certain information:</p>
            <ul>
              <li>IP address and geographic location</li>
              <li>Browser type and version</li>
              <li>Operating system and device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process your inquiries and requests</li>
              <li>Improve our website and user experience</li>
              <li>Send you relevant marketing communications (with consent)</li>
              <li>Analyze website usage and performance</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and security threats</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Cookie Policy</h2>
            <p>
              We use cookies and similar technologies to enhance your browsing experience. 
              Cookies are small text files stored on your device that help us:
            </p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Provide personalized content and advertisements</li>
              <li>Improve website functionality and performance</li>
            </ul>
            
            <h3>4.1 Types of Cookies We Use</h3>
            <div className="cookie-types">
              <div className="cookie-type">
                <h4>Essential Cookies</h4>
                <p>Required for the website to function properly. These cannot be disabled.</p>
              </div>
              <div className="cookie-type">
                <h4>Performance Cookies</h4>
                <p>Help us understand how visitors interact with our website to improve performance.</p>
              </div>
              <div className="cookie-type">
                <h4>Functional Cookies</h4>
                <p>Enable enhanced functionality and personalization features.</p>
              </div>
              <div className="cookie-type">
                <h4>Targeting Cookies</h4>
                <p>Used to deliver relevant advertisements and track advertising effectiveness.</p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>5. Data Sharing and Disclosure</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>With service providers who assist us in operating our website</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
              <li>With your explicit consent</li>
            </ul>
            <p>We do not sell, trade, or rent your personal information to third parties.</p>
          </section>

          <section className="privacy-section">
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your personal information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
              <li>Withdrawal of consent</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information only as long as necessary to fulfill the 
              purposes outlined in this Privacy Policy, unless a longer retention period 
              is required or permitted by law.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. International Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than 
              your own. We ensure appropriate safeguards are in place to protect your 
              information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13 years of age. We do not 
              knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new Privacy Policy on this page and updating 
              the "Last updated" date.
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> gm@indianbarcode.com</p>
              <p><strong>Phone:</strong> +91 8800839490</p>
              <p><strong>Address:</strong> Zebra Printers India, New Delhi, India</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
