const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middlewares/auth');

// Post routes
router.post('/', authenticateToken, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:postId', postController.getPostById);
router.get('/user/:userId', postController.getPostsByUserId);
router.put('/:postId', authenticateToken, postController.updatePost);
router.delete('/:postId', authenticateToken, postController.deletePost);

// Like routes
router.post('/:postId/like', authenticateToken, postController.likePost);
router.delete('/:postId/like', authenticateToken, postController.unlikePost);

// Comment routes
router.post('/:postId/comments', authenticateToken, postController.addComment);
router.delete('/comments/:commentId', authenticateToken, postController.deleteComment);

module.exports = router; 