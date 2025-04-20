const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

// User routes
router.get('/:userId', authenticateToken, userController.getUserProfile);
router.put('/:userId', authenticateToken, userController.updateUserProfile);
router.post('/sync', authenticateToken, userController.syncUserData);

module.exports = router;
