import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import DynamicSEO from '../components/DynamicSEO';
import DynamicContent from '../components/DynamicContent';
import LocationSelector from '../components/LocationSelector';
import { MapPin, Search, Globe, Tag } from 'lucide-react';

const SEODemo = () => {
  const { currentLocation, seoData, contentData, updateLocationByCityId } = useLocation();
  const [selectedCityId, setSelectedCityId] = useState('859'); // Default to Mumbai

  const handleLocationChange = (location) => {
    if (location.city?.id) {
      setSelectedCityId(location.city.id);
      updateLocationByCityId(location.city.id);
    }
  };

  const demoLocations = [
    { id: '859', name: 'Mumbai', state: 'Maharashtra' },
    { id: '867', name: 'Pune', state: 'Maharashtra' },
    { id: '1', name: 'Houston', state: 'Texas' },
    { id: '2', name: 'New York', state: 'New York' }
  ];

  return (
    <div className="seo-demo-page">
      <DynamicSEO 
        title="Dynamic SEO Demo | Zebra Printers India"
        description="Experience our dynamic location-based SEO system that automatically updates keywords, meta tags, and content based on selected locations."
        keywords="dynamic SEO, location-based SEO, Zebra printers, barcode solutions"
      />
      
      <div className="demo-container">
        <div className="demo-header">
          <h1>Dynamic SEO & Content System Demo</h1>
          <p>Select a location to see how our system dynamically updates SEO and content</p>
        </div>

        {/* Location Selector */}
        <div className="location-selector-section">
          <h2>Select Location</h2>
          <div className="location-buttons">
            {demoLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationChange({ city: { id: location.id, name: location.name } })}
                className={`location-btn ${selectedCityId === location.id ? 'active' : ''}`}
              >
                <MapPin size={16} />
                {location.name}, {location.state}
              </button>
            ))}
          </div>
        </div>

        {/* Current Location Display */}
        <div className="current-location-section">
          <h2>Current Location</h2>
          <div className="location-info">
            {currentLocation ? (
              <div className="location-card">
                <MapPin className="location-icon" />
                <div className="location-details">
                  <h3>{currentLocation.city.name}</h3>
                  <p>{currentLocation.state.name}, {currentLocation.country.name}</p>
                  <span className="location-code">{currentLocation.country.code}</span>
                </div>
              </div>
            ) : (
              <p>No location selected</p>
            )}
          </div>
        </div>

        {/* Dynamic SEO Data */}
        <div className="seo-data-section">
          <h2>Dynamic SEO Data</h2>
          <div className="seo-cards">
            <div className="seo-card">
              <h3>Page Title</h3>
              <p className="seo-value">
                {seoData?.seo?.title || 'Loading...'}
              </p>
            </div>
            <div className="seo-card">
              <h3>Meta Description</h3>
              <p className="seo-value">
                {seoData?.seo?.description || 'Loading...'}
              </p>
            </div>
            <div className="seo-card">
              <h3>Keywords</h3>
              <p className="seo-value">
                {seoData?.seo?.keywords || 'Loading...'}
              </p>
            </div>
            <div className="seo-card">
              <h3>H1 Tag</h3>
              <p className="seo-value">
                {seoData?.seo?.h1 || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="content-section">
          <h2>Dynamic Content</h2>
          <div className="content-cards">
            <div className="content-card">
              <h3>Banner Title</h3>
              <DynamicContent contentKey="banner_title" fallback="Zebra Barcode Solutions">
                <span>Zebra Barcode Solutions</span>
              </DynamicContent>
            </div>
            <div className="content-card">
              <h3>Hero Title</h3>
              <DynamicContent contentKey="hero_title" fallback="Professional Barcode Printers">
                <span>Professional Barcode Printers</span>
              </DynamicContent>
            </div>
            <div className="content-card">
              <h3>Services Title</h3>
              <DynamicContent contentKey="services_title" fallback="Our Services">
                <span>Our Services</span>
              </DynamicContent>
            </div>
            <div className="content-card">
              <h3>Contact Title</h3>
              <DynamicContent contentKey="contact_title" fallback="Get in Touch">
                <span>Get in Touch</span>
              </DynamicContent>
            </div>
          </div>
        </div>

        {/* Structured Data */}
        <div className="structured-data-section">
          <h2>Structured Data (JSON-LD)</h2>
          <div className="json-ld-container">
            <pre className="json-ld">
              {seoData?.seo?.structured_data ? 
                JSON.stringify(seoData.seo.structured_data, null, 2) : 
                'Loading structured data...'
              }
            </pre>
          </div>
        </div>

        {/* Meta Tags Preview */}
        <div className="meta-tags-section">
          <h2>Meta Tags Preview</h2>
          <div className="meta-tags-preview">
            <div className="meta-tag">
              <strong>Title:</strong> {seoData?.seo?.title || 'Loading...'}
            </div>
            <div className="meta-tag">
              <strong>Description:</strong> {seoData?.seo?.description || 'Loading...'}
            </div>
            <div className="meta-tag">
              <strong>Keywords:</strong> {seoData?.seo?.keywords || 'Loading...'}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .seo-demo-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px 20px;
        }

        .demo-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .demo-header h1 {
          font-size: 2.5rem;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .demo-header p {
          font-size: 1.2rem;
          color: #64748b;
        }

        .location-selector-section,
        .current-location-section,
        .seo-data-section,
        .content-section,
        .structured-data-section,
        .meta-tags-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .location-selector-section h2,
        .current-location-section h2,
        .seo-data-section h2,
        .content-section h2,
        .structured-data-section h2,
        .meta-tags-section h2 {
          color: #1e293b;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .location-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .location-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .location-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .location-btn.active {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        .location-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .location-icon {
          color: #3b82f6;
          width: 24px;
          height: 24px;
        }

        .location-details h3 {
          margin: 0 0 4px 0;
          color: #1e293b;
          font-size: 1.2rem;
        }

        .location-details p {
          margin: 0 0 8px 0;
          color: #64748b;
        }

        .location-code {
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .seo-cards,
        .content-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .seo-card,
        .content-card {
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .seo-card h3,
        .content-card h3 {
          margin: 0 0 12px 0;
          color: #1e293b;
          font-size: 1.1rem;
        }

        .seo-value {
          margin: 0;
          color: #64748b;
          line-height: 1.5;
          word-break: break-word;
        }

        .json-ld-container {
          background: #1e293b;
          border-radius: 8px;
          padding: 20px;
          overflow-x: auto;
        }

        .json-ld {
          color: #e2e8f0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          white-space: pre-wrap;
        }

        .meta-tags-preview {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meta-tag {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .meta-tag strong {
          color: #1e293b;
          display: block;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .demo-header h1 {
            font-size: 2rem;
          }

          .location-buttons {
            flex-direction: column;
          }

          .seo-cards,
          .content-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SEODemo;
