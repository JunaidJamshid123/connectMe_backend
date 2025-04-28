module.exports = function(db) {
    // Create stories table
    db.run(`
        CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            username TEXT NOT NULL,
            userProfileImage TEXT,
            storyImageUrl TEXT,
            caption TEXT,
            timestamp INTEGER NOT NULL,
            expiryTimestamp INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create story viewers table
    db.run(`
        CREATE TABLE IF NOT EXISTS story_viewers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            storyId TEXT NOT NULL,
            userId TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (storyId) REFERENCES stories(id) ON DELETE CASCADE,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(storyId, userId)
        )
    `);

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_stories_userId ON stories(userId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_stories_timestamp ON stories(timestamp)');
    db.run('CREATE INDEX IF NOT EXISTS idx_stories_expiry ON stories(expiryTimestamp)');
    db.run('CREATE INDEX IF NOT EXISTS idx_story_viewers_storyId ON story_viewers(storyId)');
    db.run('CREATE INDEX IF NOT EXISTS idx_story_viewers_userId ON story_viewers(userId)');

    console.log('Stories tables created successfully');
}; 