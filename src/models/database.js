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
    }
};

module.exports = {
    User
};
