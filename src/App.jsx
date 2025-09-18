import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './components/modals/modal-context';
import Header from './components/HeaderSimple';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ServiceSupport from './pages/ServiceSupport';
import About from './pages/About';
import Contact from './pages/Contact';
import Test from './pages/Test';
import Admin from './pages/Admin';
import './App.css';
import './styles/responsive.css';

// Component that uses useLocation inside Router
function AppContent() {
  const location = useLocation();
  
  return (
    <div className="App">
      {!location.pathname.startsWith('/admin') && <Header />}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/service-support" element={<ServiceSupport />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/test" element={<Test />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </motion.main>
      {!location.pathname.startsWith('/admin') && <Footer />}
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
