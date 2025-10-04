import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  hasNextPage, 
  hasPrevPage 
}) => {
  const { isEnglish } = useLanguage();

  const paginationStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '32px',
    padding: '20px 0'
  };

  const pageButtonStyles = {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '40px',
    textAlign: 'center'
  };

  const activePageButtonStyles = {
    ...pageButtonStyles,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6'
  };

  const disabledButtonStyles = {
    ...pageButtonStyles,
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
    cursor: 'not-allowed',
    borderColor: '#e5e7eb'
  };

  const navButtonStyles = {
    ...pageButtonStyles,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px'
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div style={paginationStyles}>
      <motion.button
        style={hasPrevPage ? navButtonStyles : disabledButtonStyles}
        onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        whileHover={hasPrevPage ? { scale: 1.05 } : {}}
        whileTap={hasPrevPage ? { scale: 0.95 } : {}}
      >
        <ChevronLeft size={16} />
        {isEnglish ? 'Previous' : 'पिछला'}
      </motion.button>

      {generatePageNumbers().map((page, index) => (
        <motion.button
          key={index}
          style={
            page === '...' 
              ? { ...pageButtonStyles, cursor: 'default' }
              : page === currentPage 
                ? activePageButtonStyles 
                : pageButtonStyles
          }
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          whileHover={
            typeof page === 'number' && page !== currentPage 
              ? { scale: 1.05, backgroundColor: '#f3f4f6' } 
              : {}
          }
          whileTap={
            typeof page === 'number' && page !== currentPage 
              ? { scale: 0.95 } 
              : {}
          }
        >
          {page}
        </motion.button>
      ))}

      <motion.button
        style={hasNextPage ? navButtonStyles : disabledButtonStyles}
        onClick={() => hasNextPage && onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        whileHover={hasNextPage ? { scale: 1.05 } : {}}
        whileTap={hasNextPage ? { scale: 0.95 } : {}}
      >
        {isEnglish ? 'Next' : 'अगला'}
        <ChevronRight size={16} />
      </motion.button>
    </div>
  );
};

export default Pagination;






