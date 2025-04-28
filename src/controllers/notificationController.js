// controllers/notificationController.js
const axios = require('axios');
const { User } = require('../models/database');

// Send push notification function
async function sendPushNotification(req, res) {
    try {
        const { receiverId, title, message, data } = req.body;
        
        if (!receiverId || !title || !message) {
            return res.status(400).json({ error: 'receiverId, title, and message are required' });
        }
        
        // Find receiver's OneSignal ID from the database
        const receiver = await User.findById(receiverId);
        if (!receiver || !receiver.pushToken) {
            return res.status(404).json({ error: 'Receiver not found or has no push token' });
        }
        
        // Send notification through OneSignal API
        const response = await axios.post('https://onesignal.com/api/v1/notifications', {
            app_id: process.env.ONESIGNAL_APP_ID || '5b6e61d3-d918-43cc-9e42-f535c877813c',
            include_external_user_ids: [receiverId],
            headings: { en: title },
            contents: { en: message },
            data: data || {},
            channel_for_external_user_ids: 'push'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY || 'YOUR_ONESIGNAL_REST_API_KEY'}`
            }
        });
        
        res.status(200).json({ 
            success: true, 
            data: response.data 
        });
    } catch (error) {
        console.error('Failed to send push notification:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update user's OneSignal ID
async function updatePushToken(req, res) {
    try {
        const userId = req.user.userId; // From auth middleware
        const { pushToken } = req.body;
        
        if (!pushToken) {
            return res.status(400).json({ error: 'Push token is required' });
        }
        
        // Update the user's push token in the database
        await User.update(userId, ['pushToken'], [pushToken]);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to update push token:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    sendPushNotification,
    updatePushToken
};