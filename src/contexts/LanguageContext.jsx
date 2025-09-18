import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Indian Languages Configuration
export const INDIAN_LANGUAGES = {
  en: { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  hi: { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  bn: { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  te: { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  mr: { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  gu: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  pa: { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  or: { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  as: { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
  ur: { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
  ne: { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '🇮🇳' },
  sa: { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳' }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage for saved language preference
    const savedLanguage = localStorage.getItem('zebra-language');
    return savedLanguage || 'en';
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('zebra-language', language);
  }, [language]);

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const currentLanguage = INDIAN_LANGUAGES[language] || INDIAN_LANGUAGES.en;

  const value = {
    language,
    setLanguage: changeLanguage,
    toggleLanguage,
    currentLanguage,
    isEnglish: language === 'en',
    isHindi: language === 'hi',
    availableLanguages: INDIAN_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
