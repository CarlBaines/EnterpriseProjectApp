const express = require('express');
const router = express.Router();
const db = require('../db');
const requireLogin = require('../middleware/auth');

function routeHealthCheck(routeName) {
    return (request, response) => {
        try {
            db.prepare('SELECT 1').get(); // Simple query to check database connection
            return response.status(200).send({
                message: `The notifications/${routeName} route is operational!`
            });
        }
        catch (err) {
            return response.status(500).json({
                message: "Database is not operational!",
                error: err.message
            });
        }
    }
}

router.get('/new', routeHealthCheck('new'));

router.get('/', (request, response) => {
    response.status(200).json({
        message: "Notifications endpoint is operational!"
    });
});

router.get('/all', requireLogin, (request, response) => {
    // Retrieve all notifications associated with the user
    const userId = request.session.userId;
    console.log("Fetching notifications for user_id:", userId);

    if(!userId){
        return response.status(401).json({
            message: "Unauthorised: No user session found. Please log in."
        });
    }

    const userExists = db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(userId);
    if (!userExists) {
        return response.status(404).json({
            message: `No user found with user_id=${userId}`
        });
    }

    const selectNotifications = db.prepare(`
        SELECT notification_id, garden_id, title, description, priority, time, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `);
    const notifications = selectNotifications.all(userId);

    return response.status(200).json({
        message: "Notifications retrieved successfully",
        count: notifications.length,
        notifications: notifications
    })
});

// Mark notifications as read for the user
router.put("/markread", requireLogin, (request, response) => {
    const userId = request.session.userId;

    const userExists = db.prepare(`SELECT 1 FROM users WHERE user_id = ?`).get(userId);
    if(!userExists){
        return response.status(404).json({
            message: `No user found with user_id=${userId}`
        });
    }

    const updateNotifications = db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`)
    
    try{
        const result = updateNotifications.run(userId);
        return response.status(200).json({
            message: "All notifications marked as read successfully",
            updatedCount: result.changes,
        });
    }
    catch(err){
        return response.status(500).json({
            message: "Error marking notifications as read",
            error: err.message
        });
    }
});

// Claer all notifications for the user
router.delete("/clearall", requireLogin, (request, response) => {
    const userId = request.session.userId;

    const userExists = db.prepare(`SELECT 1 FROM users WHERE user_id = ?`).get(userId);
    if(!userExists){
        return response.status(404).json({
            message: `No user found with user_id=${userId}`
        });
    }

    const deleteNotifications = db.prepare(`DELETE FROM notifications WHERE user_id = ?`);
    try{
        const result = deleteNotifications.run(userId);
        return response.status(200).json({
            message: "All notifications cleared successfully",
            deletedCount: result.changes,
        });
    }
    catch(err){
        return response.status(500).json({
            message: "Error clearing notifications",
            error: err.message
        });
    }
});


module.exports = router;