import React, { createContext, useContext, useState } from 'react';
import WhatsAppForm from '../whatsapp-form';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});

  const openModal = (modalType, data = {}) => {
    setActiveModal(modalType);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData({});
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'whatsapp-form':
        return <WhatsAppForm onClose={closeModal} />;
      case 'contact-form':
        return <div>Contact Form Modal - To be implemented</div>;
      case 'call-popup':
        return <div>Call Popup Modal - To be implemented</div>;
      default:
        return null;
    }
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, activeModal, modalData }}>
      {children}
      {activeModal && renderModal()}
    </ModalContext.Provider>
  );
};

