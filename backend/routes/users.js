const express = require('express');
const router = express.Router();

// Import database
const db = require('../db');

function routeHealthCheck(routeName){
    return (request, response) => {
        try{
            db.prepare('SELECT 1').get(); // Simple query to check database connection
            return response.status(200).send({
                message: `The users/${routeName} route is operational!`
            });
        }
        catch(err){
            return response.status(500).json({
                message: "Database is not operational!",
                error: err.message
            });
        }
    }
}

// GET routes for testing
router.get('/login', routeHealthCheck('login'));
router.get('/signup', routeHealthCheck('signup'));
router.get('/forgotpassword', routeHealthCheck('forgotpassword'));
router.get('/logout', routeHealthCheck('logout'));

router.get('/', (request, response) => {
    response.status(200).json({
        message: "Users endpoint is operational!"
    })
});

router.get('/all', (request, response) => {
    const selectSql = db.prepare(`SELECT * FROM users`);
    try{
        const users = selectSql.all();
        if(!users || users.length === 0){
            return response.status(404).json({
                message: "No users found in the database."
            });
        }
        return response.status(200).json({
            count: users.count,
            users: users
        });
    }
    catch(err){
        return response.status(500).json({
            message: "Error occurred when attempting to retrieve users from the database.",
            error: err.message
        });
    }
});


module.exports = router;