const { db } = require('../config/database');
const { User } = require('../models/database');

// Get user profile
async function getUserProfile(req, res) {
    try {
        const userId = req.params.userId;
        
        // Get user basic information
        db.get(
            'SELECT id as userId, username, email, fullName, phoneNumber, profilePicture, coverPhoto, bio, onlineStatus, createdAt, lastSeen FROM users WHERE id = ?', 
            [userId],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                try {
                    // Get followers count
                    const followersCount = await User.getFollowersCount(userId);
                    
                    // Get following count
                    const followingCount = await User.getFollowingCount(userId);
                    
                    user.followersCount = followersCount;
                    user.followingCount = followingCount;
                    
                    res.status(200).json(user);
                } catch (error) {
                    console.error('Error fetching followers/following counts:', error);
                    res.status(500).json({ error: error.message });
                }
            }
        );
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update user profile
async function updateUserProfile(req, res) {
    try {
        // Ensure the user can only update their own profile
        if (req.user.userId !== req.params.userId) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }
        
        const { fullName, username, phoneNumber, bio, profilePicture, coverPhoto } = req.body;
        
        // Prepare fields and values for update
        const fields = [];
        const values = [];
        
        if (fullName !== undefined) {
            fields.push('fullName');
            values.push(fullName);
        }
        
        if (username !== undefined) {
            fields.push('username');
            values.push(username);
        }
        
        if (phoneNumber !== undefined) {
            fields.push('phoneNumber');
            values.push(phoneNumber);
        }
        
        if (bio !== undefined) {
            fields.push('bio');
            values.push(bio);
        }
        
        if (profilePicture !== undefined) {
            fields.push('profilePicture');
            values.push(profilePicture);
        }
        
        if (coverPhoto !== undefined) {
            fields.push('coverPhoto');
            values.push(coverPhoto);
        }
        
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        // Update user
        const result = await User.update(req.params.userId, fields, values);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: error.message });
    }
}

// Sync user data (for offline support)
async function syncUserData(req, res) {
    try {
        const { userData } = req.body;
        
        // Basic validation
        if (!userData || !userData.userId) {
            return res.status(400).json({ error: 'Invalid user data' });
        }
        
        // Ensure the user can only sync their own data
        if (req.user.userId !== userData.userId) {
            return res.status(403).json({ error: 'You can only sync your own data' });
        }
        
        // Check if user exists
        const user = await User.findById(userData.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update user data
        db.run(
            `UPDATE users SET 
            username = ?, fullName = ?, phoneNumber = ?, profilePicture = ?, 
            coverPhoto = ?, bio = ?, onlineStatus = ?, pushToken = ?, 
            lastSeen = ?, vanishModeEnabled = ?
            WHERE id = ?`,
            [
                userData.username,
                userData.fullName,
                userData.phoneNumber,
                userData.profilePicture,
                userData.coverPhoto,
                userData.bio,
                userData.onlineStatus ? 1 : 0,
                userData.pushToken,
                userData.lastSeen,
                userData.vanishModeEnabled ? 1 : 0,
                userData.userId
            ],
            function(err) {
                if (err) {
                    console.error('Error syncing user data:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                res.status(200).json({ message: 'User data synced successfully' });
            }
        );
    } catch (error) {
        console.error('Error syncing user data:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get all users
async function getAllUsers(req, res) {
    try {
        db.all(
            'SELECT id as userId, username, email, fullName, phoneNumber, profilePicture, coverPhoto, bio, onlineStatus, createdAt, lastSeen FROM users',
            async (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(200).json(rows);
            }
        );
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ error: error.message });
    }
}

// Search users by username
async function searchUsers(req, res) {
    try {
        const { username } = req.query;
        
        if (!username || username.trim() === '') {
            return res.status(400).json({ error: 'Search term is required' });
        }
        
        const users = await User.searchByUsername(username);
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get user's followers
async function getUserFollowers(req, res) {
    try {
        const { userId } = req.params;
        
        const followers = await User.getFollowers(userId);
        
        res.status(200).json(followers);
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get users being followed by a user
async function getUserFollowing(req, res) {
    try {
        const { userId } = req.params;
        
        const following = await User.getFollowing(userId);
        
        res.status(200).json(following);
    } catch (error) {
        console.error('Error fetching following:', error);
        res.status(500).json({ error: error.message });
    }
}

// Export these new functions
module.exports = {
    getUserProfile,
    updateUserProfile,
    syncUserData,
    getAllUsers,
    searchUsers,
    getUserFollowers,
    getUserFollowing
};