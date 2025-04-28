const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticateToken } = require('../middlewares/auth');

// Story routes
router.post('/', authenticateToken, storyController.createStory);
router.get('/', storyController.getActiveStories);
router.get('/:storyId', storyController.getStoryById);
router.get('/user/:userId', storyController.getStoriesByUserId);
router.delete('/:storyId', authenticateToken, storyController.deleteStory);

// Story viewer routes
router.post('/:storyId/view', authenticateToken, storyController.markStoryViewed);

// Admin route for cleanup (can be called periodically)
router.delete('/cleanup/expired', authenticateToken, storyController.cleanupExpiredStories);

module.exports = router; 