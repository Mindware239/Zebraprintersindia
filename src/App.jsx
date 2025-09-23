import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { ModalProvider } from './components/modals/modal-context';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
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
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
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
          <Route path="/test" element={<Test />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
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
