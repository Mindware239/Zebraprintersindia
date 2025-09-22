import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './components/modals/modal-context';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ServiceSupport from './pages/ServiceSupport';
import Drivers from './pages/Drivers';
import Jobs from './pages/Jobs';
import Blogs from './pages/Blogs';
import About from './pages/About';
import Contact from './pages/Contact';
import Jobs from './pages/Jobs';
import Blogs from './pages/Blogs';


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
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/service-support" element={<ServiceSupport />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/blogs" element={<Blogs />} />
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
    <LanguageProvider>
      <AuthProvider>
        <ModalProvider>
          <Router>
            <AppContent />
          </Router>
        </ModalProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
