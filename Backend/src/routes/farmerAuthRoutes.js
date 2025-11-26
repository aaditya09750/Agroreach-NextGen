const express = require('express');
const router = express.Router();
const farmerAuthController = require('../controllers/farmerAuthController');
const { farmerAuth } = require('../middleware/farmerAuth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', farmerAuthController.register);
router.post('/login', farmerAuthController.login);

// Protected routes
router.get('/profile', farmerAuth, farmerAuthController.getProfile);
router.put('/profile', farmerAuth, upload.single('photo'), farmerAuthController.updateProfile);

module.exports = router;
