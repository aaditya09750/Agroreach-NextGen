const cloudinary = require('../config/cloudinary');

// Cloudinary returns full HTTPS URLs already; pass through as-is.
exports.getImageUrl = (url) => url || '';

// Extract Cloudinary public_id from a secure_url like
// https://res.cloudinary.com/<cloud>/image/upload/v123/agroreach/abc.jpg
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

exports.getPublicIdFromUrl = extractPublicId;

exports.deleteImage = async (imageUrl) => {
  try {
    const publicId = extractPublicId(imageUrl);
    if (!publicId) return false;
    const result = await cloudinary.uploader.destroy(publicId);
    return result?.result === 'ok' || result?.result === 'not found';
  } catch (error) {
    console.error('Cloudinary delete failed:', error?.message || error);
    return false;
  }
};

exports.deleteMultipleImages = async (imageUrls = []) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return [];
  return Promise.all(imageUrls.map((url) => exports.deleteImage(url)));
};

exports.isValidImage = (file) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowed.includes(file.mimetype);
};
