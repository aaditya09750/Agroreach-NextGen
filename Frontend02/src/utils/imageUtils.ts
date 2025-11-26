const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_BASE_URL.replace('/api', '');

export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /uploads, prepend the base URL
  if (imagePath.startsWith('/uploads')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Otherwise, return as is (might be a data URL)
  return imagePath;
};
