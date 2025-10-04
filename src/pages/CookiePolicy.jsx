import React from 'react';
import './CookiePolicy.css';

const CookiePolicy = () => {
  return (
    <div className="cookie-policy">
      <div className="cookie-container">
        <header className="cookie-header">
          <h1>Cookie Policy</h1>
          <p className="last-updated">Last updated: January 10, 2025</p>
        </header>

        <main className="cookie-content">
          <section className="cookie-section">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p>
              Cookies allow a website to recognize a user's device and remember information about their visit, 
              such as their preferred language and other settings. This can make your next visit easier and 
              the site more useful to you.
            </p>
          </section>

          <section className="cookie-section">
            <h2>How We Use Cookies</h2>
            <p>
              Zebra Printers India uses cookies to improve your experience on our website. We use cookies 
              for several purposes, including:
            </p>
            <ul>
              <li>Remembering your preferences and settings</li>
              <li>Understanding how you use our website</li>
              <li>Improving our website's functionality</li>
              <li>Providing personalized content and advertisements</li>
              <li>Analyzing website traffic and user behavior</li>
            </ul>
          </section>

          <section className="cookie-section">
            <h2>Types of Cookies We Use</h2>
            
            <div className="cookie-category">
              <h3>🔒 Essential Cookies</h3>
              <p><strong>Purpose:</strong> These cookies are necessary for the website to function and cannot be switched off.</p>
              <div className="cookie-details">
                <h4>What we collect:</h4>
                <ul>
                  <li>Cookie consent preferences</li>
                  <li>Session information</li>
                  <li>Security tokens</li>
                  <li>User authentication status</li>
                </ul>
                <h4>Data Retention:</h4>
                <p>Session or until consent is withdrawn</p>
                <h4>Legal Basis:</h4>
                <p>Legitimate interest for website functionality</p>
              </div>
            </div>

            <div className="cookie-category">
              <h3>📊 Performance Cookies</h3>
              <p><strong>Purpose:</strong> These cookies help us understand how visitors interact with our website.</p>
              <div className="cookie-details">
                <h4>What we collect:</h4>
                <ul>
                  <li>Page views and navigation patterns</li>
                  <li>Time spent on pages</li>
                  <li>Click tracking and user interactions</li>
                  <li>Error reports and performance metrics</li>
                  <li>Device and browser information</li>
                  <li>IP address (anonymized)</li>
                  <li>Geographic location (country/city level)</li>
                </ul>
                <h4>Data Retention:</h4>
                <p>Up to 24 months</p>
                <h4>Legal Basis:</h4>
                <p>Consent (you can opt out)</p>
              </div>
            </div>

            <div className="cookie-category">
              <h3>⚙️ Functional Cookies</h3>
              <p><strong>Purpose:</strong> These cookies enable enhanced functionality and personalization.</p>
              <div className="cookie-details">
                <h4>What we collect:</h4>
                <ul>
                  <li>Language preferences</li>
                  <li>User interface customizations</li>
                  <li>Form data and preferences</li>
                  <li>Shopping cart contents</li>
                  <li>User account information</li>
                  <li>Location-based settings</li>
                </ul>
                <h4>Data Retention:</h4>
                <p>Up to 12 months</p>
                <h4>Legal Basis:</h4>
                <p>Consent (you can opt out)</p>
              </div>
            </div>

            <div className="cookie-category">
              <h3>🎯 Targeting Cookies</h3>
              <p><strong>Purpose:</strong> These cookies are used to deliver relevant advertisements.</p>
              <div className="cookie-details">
                <h4>What we collect:</h4>
                <ul>
                  <li>Browsing behavior and interests</li>
                  <li>Demographic information</li>
                  <li>Purchase history and preferences</li>
                  <li>Social media interactions</li>
                  <li>Advertising engagement data</li>
                  <li>Cross-site tracking information</li>
                </ul>
                <h4>Data Retention:</h4>
                <p>Up to 36 months</p>
                <h4>Legal Basis:</h4>
                <p>Consent (you can opt out)</p>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>Third-Party Cookies</h2>
            <p>We may also use third-party cookies from trusted partners:</p>
            
            <div className="third-party-cookies">
              <div className="third-party-item">
                <h4>Google Analytics</h4>
                <p>Helps us analyze website traffic and user behavior.</p>
                <p><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>
              </div>
              
              <div className="third-party-item">
                <h4>Google Ads</h4>
                <p>Used for targeted advertising and campaign measurement.</p>
                <p><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>
              </div>
              
              <div className="third-party-item">
                <h4>Facebook Pixel</h4>
                <p>Tracks conversions and enables targeted advertising.</p>
                <p><strong>Privacy Policy:</strong> <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer">Facebook Privacy Policy</a></p>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>Managing Your Cookie Preferences</h2>
            <p>You have several options for managing cookies:</p>
            
            <div className="cookie-management">
              <h3>1. Cookie Settings on Our Website</h3>
              <p>
                Click the "Cookie Settings" button in our cookie banner to customize your preferences. 
                You can enable or disable different categories of cookies according to your preferences.
              </p>
              
              <h3>2. Browser Settings</h3>
              <p>Most web browsers allow you to control cookies through their settings. You can:</p>
              <ul>
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Delete existing cookies</li>
                <li>Set notifications for new cookies</li>
              </ul>
              
              <h3>3. Browser-Specific Instructions</h3>
              <div className="browser-instructions">
                <div className="browser-item">
                  <h4>Google Chrome</h4>
                  <p>Settings → Privacy and security → Cookies and other site data</p>
                </div>
                <div className="browser-item">
                  <h4>Mozilla Firefox</h4>
                  <p>Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="browser-item">
                  <h4>Safari</h4>
                  <p>Preferences → Privacy → Manage Website Data</p>
                </div>
                <div className="browser-item">
                  <h4>Microsoft Edge</h4>
                  <p>Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>Impact of Disabling Cookies</h2>
            <p>If you choose to disable cookies, some features of our website may not function properly:</p>
            <ul>
              <li>You may need to re-enter information more frequently</li>
              <li>Some personalized features may not be available</li>
              <li>We may not be able to remember your preferences</li>
              <li>Some parts of the website may not work as expected</li>
            </ul>
          </section>

          <section className="cookie-section">
            <h2>Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any 
              material changes by posting the updated policy on our website.
            </p>
          </section>

          <section className="cookie-section">
            <h2>Contact Us</h2>
            <p>If you have any questions about our use of cookies, please contact us:</p>
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

export default CookiePolicy;
