const { Post } = require('../models/database');

// Create new post
async function createPost(req, res) {
    try {
        const { postId, userId, username, userProfileImage, postImageUrl, caption } = req.body;
        
        if (!postId || !userId || !username || !caption) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        const timestamp = Date.now();
        
        const post = {
            postId,
            userId,
            username,
            userProfileImage,
            postImageUrl,
            caption,
            timestamp
        };
        
        await Post.create(post);
        
        res.status(201).json({
            message: 'Post created successfully',
            post
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get all posts
async function getAllPosts(req, res) {
    try {
        const posts = await Post.getAll();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get post by ID
async function getPostById(req, res) {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Get likes and comments
        const [likes, comments] = await Promise.all([
            Post.getLikes(postId),
            Post.getComments(postId)
        ]);
        
        post.likes = likes;
        post.comments = comments;
        
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get posts by user ID
async function getPostsByUserId(req, res) {
    try {
        const { userId } = req.params;
        
        const posts = await Post.getByUserId(userId);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update post
async function updatePost(req, res) {
    try {
        const { postId } = req.params;
        const { caption, postImageUrl } = req.body;
        
        // Ensure the user can only update their own post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.userId !== req.user.userId) {
            return res.status(403).json({ error: 'You can only update your own posts' });
        }
        
        const fields = [];
        const values = [];
        
        if (caption !== undefined) {
            fields.push('caption');
            values.push(caption);
        }
        
        if (postImageUrl !== undefined) {
            fields.push('postImageUrl');
            values.push(postImageUrl);
        }
        
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        const result = await Post.update(postId, fields, values);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete post
async function deletePost(req, res) {
    try {
        const { postId } = req.params;
        
        // Ensure the user can only delete their own post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.userId !== req.user.userId) {
            return res.status(403).json({ error: 'You can only delete your own posts' });
        }
        
        const result = await Post.delete(postId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: error.message });
    }
}

// Like post
async function likePost(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        
        await Post.addLike(postId, userId);
        
        res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: error.message });
    }
}

// Unlike post
async function unlikePost(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        
        const result = await Post.removeLike(postId, userId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }
        
        res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ error: error.message });
    }
}

// Add comment
async function addComment(req, res) {
    try {
        const { postId } = req.params;
        const { commentId, text } = req.body;
        const userId = req.user.userId;
        const username = req.user.username;
        const userProfileImage = req.user.profilePicture;
        
        if (!commentId || !text) {
            return res.status(400).json({ error: 'Comment ID and text are required' });
        }
        
        const comment = {
            commentId,
            postId,
            userId,
            username,
            userProfileImage,
            text,
            timestamp: Date.now()
        };
        
        await Post.addComment(comment);
        
        res.status(201).json({
            message: 'Comment added successfully',
            comment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete comment
async function deleteComment(req, res) {
    try {
        const { commentId } = req.params;
        
        // Ensure the user can only delete their own comment
        const comment = await Post.getComments(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        if (comment.userId !== req.user.userId) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }
        
        const result = await Post.deleteComment(commentId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getPostsByUserId,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    deleteComment
}; 