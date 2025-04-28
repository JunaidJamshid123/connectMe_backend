// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/auth');

// Notification routes
router.post('/send', authenticateToken, notificationController.sendPushNotification);
router.post('/token', authenticateToken, notificationController.updatePushToken);

module.exports = router;