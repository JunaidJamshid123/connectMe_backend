module.exports = function(db) {
    // Create posts table
    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            username TEXT NOT NULL,
            userProfileImage TEXT,
            postImageUrl TEXT,
            caption TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create likes table
    db.run(`
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            postId TEXT NOT NULL,
            userId TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(postId, userId)
        )
    `);

    // Create comments table
    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            postId TEXT NOT NULL,
            userId TEXT NOT NULL,
            username TEXT NOT NULL,
            userProfileImage TEXT,
            text TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp)');
    db.run('CREATE INDEX IF NOT EXISTS idx_likes_postId ON likes(postId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_likes_userId ON likes(userId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments(postId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_comments_userId ON comments(userId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp)');

    console.log('Posts tables created successfully');
}; 