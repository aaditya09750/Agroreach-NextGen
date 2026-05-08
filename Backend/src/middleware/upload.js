const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'agroreach',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1600, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  if (allowedTypes.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
