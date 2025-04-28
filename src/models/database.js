const { db } = require('../config/database');

// User model operations
const User = {
    // Find user by email
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    // Find user by username
    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    // Find user by ID
    findById: (userId) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    // Create new user
    create: (user) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (
                    id, username, email, password, fullName, phoneNumber, 
                    createdAt, lastSeen
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.userId,
                    user.username,
                    user.email,
                    user.password,
                    user.fullName,
                    user.phoneNumber,
                    user.createdAt,
                    user.lastSeen
                ],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });
    },

    // Update user
    update: (userId, fields, values) => {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE users SET ';
            
            fields.forEach((field, index) => {
                sql += `${field} = ?`;
                if (index < fields.length - 1) sql += ', ';
            });
            
            sql += ' WHERE id = ?';
            values.push(userId);
            
            db.run(sql, values, function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    },

    // Update last seen
    updateLastSeen: (userId, timestamp) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE users SET lastSeen = ? WHERE id = ?', [timestamp, userId], function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    },

    // Get followers count
    getFollowersCount: (userId) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM followers WHERE userId = ?', [userId], (err, row) => {
                if (err) reject(err);
                resolve(row.count);
            });
        });
    },

    // Get following count
    getFollowingCount: (userId) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM following WHERE userId = ?', [userId], (err, row) => {
                if (err) reject(err);
                resolve(row.count);
            });
        });
    },

    // Search users by username
    searchByUsername: (searchTerm) => {
    return new Promise((resolve, reject) => {
        const likePattern = `%${searchTerm}%`;
        db.all(
            `SELECT id as userId, username, email, fullName, phoneNumber, profilePicture, 
            coverPhoto, bio, onlineStatus, createdAt, lastSeen 
            FROM users 
            WHERE username LIKE ?`,
            [likePattern],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            }
        );
    });
},

// Get user's followers
    getFollowers: (userId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT u.id as userId, u.username, u.email, u.fullName, u.phoneNumber, 
            u.profilePicture, u.coverPhoto, u.bio, u.onlineStatus, u.createdAt, u.lastSeen
            FROM users u
            JOIN followers f ON u.id = f.followerId
            WHERE f.userId = ?`,
            [userId],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            }
        );
    });
},

// Get users being followed by this user
getFollowing: (userId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT u.id as userId, u.username, u.email, u.fullName, u.phoneNumber, 
            u.profilePicture, u.coverPhoto, u.bio, u.onlineStatus, u.createdAt, u.lastSeen
            FROM users u
            JOIN following f ON u.id = f.followingId
            WHERE f.userId = ?`,
            [userId],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            }
        );
    });
},
    updatePushToken: (userId, token) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE users SET pushToken = ? WHERE id = ?', [token, userId], function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    },



};

// Post model operations
const Post = {
    // Create new post
    create: (post) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO posts (
                    id, userId, username, userProfileImage, postImageUrl, 
                    caption, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    post.postId,
                    post.userId,
                    post.username,
                    post.userProfileImage,
                    post.postImageUrl,
                    post.caption,
                    post.timestamp
                ],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });
    },

    // Find post by ID
    findById: (postId) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    // Get all posts
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
                (SELECT COUNT(*) FROM likes WHERE postId = p.id) as likesCount,
                (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentsCount
                FROM posts p
                ORDER BY p.timestamp DESC`,
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Get posts by user ID
    getByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
                (SELECT COUNT(*) FROM likes WHERE postId = p.id) as likesCount,
                (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentsCount
                FROM posts p
                WHERE p.userId = ?
                ORDER BY p.timestamp DESC`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Update post
    update: (postId, fields, values) => {
        return new Promise((resolve, reject) => {
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const query = `UPDATE posts SET ${setClause} WHERE id = ?`;
            
            db.run(query, [...values, postId], function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    },

    // Delete post
    delete: (postId) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    },

    // Get post likes
    getLikes: (postId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT l.userId, u.username, u.profilePicture
                FROM likes l
                JOIN users u ON l.userId = u.id
                WHERE l.postId = ?`,
                [postId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Get post comments
    getComments: (postId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT c.*, u.username, u.profilePicture
                FROM comments c
                JOIN users u ON c.userId = u.id
                WHERE c.postId = ?
                ORDER BY c.timestamp ASC`,
                [postId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Add like to post
    addLike: (postId, userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO likes (postId, userId) VALUES (?, ?)',
                [postId, userId],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });
    },

    // Remove like from post
    removeLike: (postId, userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM likes WHERE postId = ? AND userId = ?',
                [postId, userId],
                function(err) {
                    if (err) reject(err);
                    resolve({ changes: this.changes });
                }
            );
        });
    },

    // Add comment to post
    addComment: (comment) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO comments (
                    id, postId, userId, username, userProfileImage, 
                    text, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    comment.commentId,
                    comment.postId,
                    comment.userId,
                    comment.username,
                    comment.userProfileImage,
                    comment.text,
                    comment.timestamp
                ],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });
    },

    // Delete comment
    deleteComment: (commentId) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    }
};

// Story model operations
const Story = {
    // Create new story
    create: (story) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO stories (
                    id, userId, username, userProfileImage, storyImageUrl, 
                    caption, timestamp, expiryTimestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    story.storyId,
                    story.userId,
                    story.username,
                    story.userProfileImage,
                    story.storyImageUrl,
                    story.caption,
                    story.timestamp,
                    story.expiryTimestamp
                ],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });
    },

    // Find story by ID
    findById: (storyId) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM stories WHERE id = ?', [storyId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    // Get all active stories (not expired)
    getActiveStories: () => {
        return new Promise((resolve, reject) => {
            const currentTime = Date.now();
            db.all(
                `SELECT s.*, 
                (SELECT COUNT(*) FROM story_viewers WHERE storyId = s.id) as viewersCount
                FROM stories s
                WHERE s.expiryTimestamp > ?
                ORDER BY s.timestamp DESC`,
                [currentTime],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Get stories by user ID
    getByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const currentTime = Date.now();
            db.all(
                `SELECT s.*, 
                (SELECT COUNT(*) FROM story_viewers WHERE storyId = s.id) as viewersCount
                FROM stories s
                WHERE s.userId = ? AND s.expiryTimestamp > ?
                ORDER BY s.timestamp DESC`,
                [userId, currentTime],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Delete story
    delete: (storyId) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM stories WHERE id = ?', [storyId], function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    },

    // Add viewer to story
    addViewer: (storyId, userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO story_viewers (storyId, userId, timestamp) VALUES (?, ?, ?)',
                [storyId, userId, Date.now()],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });
    },

    // Get story viewers
    getViewers: (storyId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT sv.userId, u.username, u.profilePicture, sv.timestamp
                FROM story_viewers sv
                JOIN users u ON sv.userId = u.id
                WHERE sv.storyId = ?
                ORDER BY sv.timestamp ASC`,
                [storyId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Clean up expired stories
    cleanupExpiredStories: () => {
        return new Promise((resolve, reject) => {
            const currentTime = Date.now();
            db.run(
                'DELETE FROM stories WHERE expiryTimestamp <= ?',
                [currentTime],
                function(err) {
                    if (err) reject(err);
                    resolve({ changes: this.changes });
                }
            );
        });
    }
};

module.exports = {
    User,
    Post,
    Story
};
