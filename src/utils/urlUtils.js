// Utility functions for URL handling

export const createCitySlug = (cityName) => {
  if (!cityName) return '';
  return cityName
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove special characters except hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
};

export const parseCitySlug = (slug) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getCitySlugFromUrl = (pathname) => {
  const match = pathname.match(/\/location\/(.+)/);
  return match ? match[1] : null;
};
