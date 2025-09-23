import React from 'react';
import { useLocation } from '../contexts/LocationContext';

const DynamicContent = ({ 
  children, 
  fallback = null, 
  contentKey, 
  className = '',
  tag = 'span'
}) => {
  const { getLocationContent, currentLocation } = useLocation();
  const content = getLocationContent();

  if (!currentLocation) {
    return fallback || children;
  }

  const dynamicText = content[contentKey];
  if (!dynamicText) {
    return fallback || children;
  }

  const Tag = tag;
  return <Tag className={className}>{dynamicText}</Tag>;
};

export default DynamicContent;
