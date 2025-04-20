// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../smd.db'), (err) => {
    if (err) {
        console.error('❌ Failed to connect to SQLite DB:', err.message);
    } else {
        console.log('✅ Connected to SQLite successfully!');
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullName TEXT NOT NULL,
            phoneNumber TEXT,
            profilePicture TEXT,
            coverPhoto TEXT,
            bio TEXT,
            onlineStatus INTEGER DEFAULT 0,
            pushToken TEXT,
            createdAt INTEGER,
            lastSeen INTEGER,
            vanishModeEnabled INTEGER DEFAULT 0,
            storyExpiryTimestamp INTEGER
        )`);

        // Followers table
        db.run(`CREATE TABLE IF NOT EXISTS followers (
            userId TEXT,
            followerId TEXT,
            createdAt INTEGER,
            PRIMARY KEY (userId, followerId),
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (followerId) REFERENCES users(id)
        )`);

        // Following table
        db.run(`CREATE TABLE IF NOT EXISTS following (
            userId TEXT,
            followingId TEXT,
            createdAt INTEGER,
            PRIMARY KEY (userId, followingId),
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (followingId) REFERENCES users(id)
        )`);

        // Blocked users table
        db.run(`CREATE TABLE IF NOT EXISTS blocked_users (
            userId TEXT,
            blockedId TEXT,
            createdAt INTEGER,
            PRIMARY KEY (userId, blockedId),
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (blockedId) REFERENCES users(id)
        )`);

        console.log('✅ Database tables initialized');
    });
}

module.exports = {
    db,
    initializeDatabase
};