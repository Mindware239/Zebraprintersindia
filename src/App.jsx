import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { ModalProvider } from './components/modals/modal-context';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBannerNew from './components/CookieBannerNew';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import Home from './pages/Home';
import Products from './pages/Products';
import CategoryPage from './pages/CategoryPage';
import SubcategoryPage from './pages/SubcategoryPage';
import DirectSubcategoryPage from './pages/DirectSubcategoryPage';
import ProductDetail from './pages/ProductDetail';
import ServiceSupport from './pages/ServiceSupport';
import Drivers from './pages/Drivers';
import About from './pages/About';
import Contact from './pages/Contact';
import Jobs from './pages/Jobs';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import LocationPage from './pages/LocationPage';
import LocationDemo from './pages/LocationDemo';
import Network from './pages/Network';
import SEODemo from './pages/SEODemo';
import EmailTest from './pages/EmailTest';
import SearchResults from './pages/SearchResults';
import ErrorBoundary from './components/ErrorBoundary';


import Test from './pages/Test';
import Admin from './pages/Admin';
import './App.css';
import './styles/responsive.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/products" element={<CategoryPage />} />
          <Route path="/products/:category" element={<CategoryPage />} />
          <Route path="/products/:category/:subcategory" element={<SubcategoryPage />} />
          {/* Clean category routes for banner buttons */}
          <Route path="/printers" element={<CategoryPage />} />
          <Route path="/scanners" element={<CategoryPage />} />
          <Route path="/supplies" element={<CategoryPage />} />
          <Route path="/rfid" element={<CategoryPage />} />
          {/* Direct subcategory routes for cleaner URLs */}
          <Route path="/labels" element={<DirectSubcategoryPage subcategorySlug="labels" />} />
          <Route path="/ribbons" element={<DirectSubcategoryPage subcategorySlug="ribbons" />} />
          <Route path="/handheld-scanners" element={<DirectSubcategoryPage subcategorySlug="handheld-scanners" />} />
          <Route path="/fixed-mount-scanners" element={<DirectSubcategoryPage subcategorySlug="fixed-mount-scanners" />} />
          <Route path="/ultra-rugged-scanners" element={<DirectSubcategoryPage subcategorySlug="ultra-rugged-scanners" />} />
          <Route path="/multi-plane-scanners" element={<DirectSubcategoryPage subcategorySlug="multi-plane-scanners" />} />
          <Route path="/hands-free-scanners" element={<DirectSubcategoryPage subcategorySlug="hands-free-scanners" />} />
          <Route path="/oem-scan-engines" element={<DirectSubcategoryPage subcategorySlug="oem-scan-engines" />} />
          <Route path="/desktop-printers" element={<DirectSubcategoryPage subcategorySlug="desktop-printers" />} />
          <Route path="/industrial-printers" element={<DirectSubcategoryPage subcategorySlug="industrial-printers" />} />
          <Route path="/id-card-printers" element={<DirectSubcategoryPage subcategorySlug="id-card-printers" />} />
          <Route path="/mobile-printers" element={<DirectSubcategoryPage subcategorySlug="mobile-printers" />} />
          <Route path="/healthcare-printers" element={<DirectSubcategoryPage subcategorySlug="healthcare-printers" />} />
          <Route path="/print-engines" element={<DirectSubcategoryPage subcategorySlug="print-engines" />} />
          <Route path="/handheld-rfid" element={<DirectSubcategoryPage subcategorySlug="handheld-rfid" />} />
          <Route path="/fixed-rfid" element={<DirectSubcategoryPage subcategorySlug="fixed-rfid" />} />
          <Route path="/rfid-antennas" element={<DirectSubcategoryPage subcategorySlug="rfid-antennas" />} />
          <Route path="/rfid-printers" element={<DirectSubcategoryPage subcategorySlug="rfid-printers" />} />
          <Route path="/handheld-computers" element={<DirectSubcategoryPage subcategorySlug="handheld-computers" />} />
          <Route path="/vehicle-mounted-computers" element={<DirectSubcategoryPage subcategorySlug="vehicle-mounted-computers" />} />
          <Route path="/wearable-computers" element={<DirectSubcategoryPage subcategorySlug="wearable-computers" />} />
          <Route path="/healthcare-mobile-computers" element={<DirectSubcategoryPage subcategorySlug="healthcare-mobile-computers" />} />
          <Route path="/zebra-rfid-cards" element={<DirectSubcategoryPage subcategorySlug="Zebra RFID Cards" />} />
          <Route path="/service-support" element={<ServiceSupport />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/jobs" element={<ErrorBoundary><Jobs /></ErrorBoundary>} />
          <Route path="/blogs" element={<ErrorBoundary><Blogs /></ErrorBoundary>} />
          <Route path="/blog/:slug" element={<ErrorBoundary><BlogDetail /></ErrorBoundary>} />
          <Route path="/location/:citySlug?" element={<ErrorBoundary><LocationPage /></ErrorBoundary>} />
          <Route path="/location-demo" element={<ErrorBoundary><LocationDemo /></ErrorBoundary>} />
          <Route path="/network" element={<ErrorBoundary><Network /></ErrorBoundary>} />
          <Route path="/seo-demo" element={<ErrorBoundary><SEODemo /></ErrorBoundary>} />
          <Route path="/email-test" element={<ErrorBoundary><EmailTest /></ErrorBoundary>} />
          <Route path="/test" element={<Test />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/test-product" element={<ProductDetail />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/:productSlug/*" element={<ProductDetail />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
          <CookieBannerNew />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <ModalProvider>
              <Router>
                <AppContent />
              </Router>
            </ModalProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
