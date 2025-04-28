const { Story } = require('../models/database');

// Create new story
async function createStory(req, res) {
    try {
        const { storyId, userId, username, userProfileImage, storyImageUrl, caption } = req.body;
        
        if (!storyId || !userId || !username || !storyImageUrl) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        const timestamp = Date.now();
        const expiryTimestamp = timestamp + (24 * 60 * 60 * 1000); // 24 hours from now
        
        const story = {
            storyId,
            userId,
            username,
            userProfileImage,
            storyImageUrl,
            caption,
            timestamp,
            expiryTimestamp
        };
        
        await Story.create(story);
        
        res.status(201).json({
            message: 'Story created successfully',
            story
        });
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get all active stories
async function getActiveStories(req, res) {
    try {
        const stories = await Story.getActiveStories();
        res.status(200).json(stories);
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get story by ID
async function getStoryById(req, res) {
    try {
        const { storyId } = req.params;
        
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        // Check if story is expired
        if (story.expiryTimestamp <= Date.now()) {
            return res.status(404).json({ error: 'Story has expired' });
        }
        
        // Get viewers
        const viewers = await Story.getViewers(storyId);
        story.viewers = viewers;
        
        res.status(200).json(story);
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get stories by user ID
async function getStoriesByUserId(req, res) {
    try {
        const { userId } = req.params;
        
        const stories = await Story.getByUserId(userId);
        res.status(200).json(stories);
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete story
async function deleteStory(req, res) {
    try {
        const { storyId } = req.params;
        
        // Ensure the user can only delete their own story
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        if (story.userId !== req.user.userId) {
            return res.status(403).json({ error: 'You can only delete your own stories' });
        }
        
        const result = await Story.delete(storyId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({ error: error.message });
    }
}

// Mark story as viewed
async function markStoryViewed(req, res) {
    try {
        const { storyId } = req.params;
        const userId = req.user.userId;
        
        // Check if story exists and is not expired
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        
        if (story.expiryTimestamp <= Date.now()) {
            return res.status(404).json({ error: 'Story has expired' });
        }
        
        await Story.addViewer(storyId, userId);
        
        res.status(200).json({ message: 'Story marked as viewed' });
    } catch (error) {
        console.error('Error marking story as viewed:', error);
        res.status(500).json({ error: error.message });
    }
}

// Clean up expired stories (can be called periodically)
async function cleanupExpiredStories(req, res) {
    try {
        const result = await Story.cleanupExpiredStories();
        res.status(200).json({
            message: 'Expired stories cleaned up',
            deletedCount: result.changes
        });
    } catch (error) {
        console.error('Error cleaning up expired stories:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createStory,
    getActiveStories,
    getStoryById,
    getStoriesByUserId,
    deleteStory,
    markStoryViewed,
    cleanupExpiredStories
}; 