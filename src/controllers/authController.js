const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/database');
const { JWT_SECRET } = require('../config/auth');

// Register new user
async function register(req, res) {
    try {
        const { userId, username, email, password, fullName, phoneNumber } = req.body;
        
        if (!userId || !username || !email || !password || !fullName) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if email already exists
        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(409).json({ error: 'Email already in use' });
        }
        
        // Check if username already exists
        const existingUserByUsername = await User.findByUsername(username);
        if (existingUserByUsername) {
            return res.status(409).json({ error: 'Username already taken' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const currentTime = Date.now();
        
        // Create user
        await User.create({
            userId,
            username,
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
            createdAt: currentTime,
            lastSeen: currentTime
        });
        
        // Generate JWT token
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                userId,
                username,
                email,
                fullName,
                phoneNumber,
                createdAt: currentTime
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Login user
async function login(req, res) {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Update last seen
        await User.updateLastSeen(user.id, Date.now());
        
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    register,
    login
};
