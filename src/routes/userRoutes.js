const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', userController.getAllUsers);
router.get('/search', authenticateToken, userController.searchUsers); // Search users by username
router.get('/:userId', authenticateToken, userController.getUserProfile);
router.get('/:userId/followers', authenticateToken, userController.getUserFollowers); // Get user's followers
router.get('/:userId/following', authenticateToken, userController.getUserFollowing); // Get user's following
router.put('/:userId', authenticateToken, userController.updateUserProfile);
router.post('/sync', authenticateToken, userController.syncUserData);
module.exports = router;
