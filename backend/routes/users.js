const express = require('express');
const router = express.Router();

// Import database
const db = require('../db');
// Import bcrypt for password hashing
const bcrypt = require('bcrypt');

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
router.get('/usernamecheck', routeHealthCheck('usernamecheck'));
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

// router.post('/login', (request, response) => {
//     const { username , password } = request.body;
//     if(!username || !password){
//         return response.status(400).json({
//             success: false,
//             message: "Username and password are required for login."
//         });
//     }
// });

router.post('/signup', (request, response) => {
    const { username, password } = request.body;
    if(!username || !password){
        return response.status(400).json({
            success: false,
            message: "Username and password are required for signup."
        });
    }
    const usernameCheck = db.prepare(`SELECT * FROM users WHERE username = ?`)
    try{
        const existingUser = usernameCheck.get(username);
        if(existingUser){
            return response.status(409).json({
                success: false,
                message: "Username already exists!"
            });
        }
    }
    catch(err){
        return response.status(500).json({
            success: false,
            message: "Error occurred when checking for existing username.",
            error: err.message
        });
    }
    // Hash the password and insert the new user into the database
    const insertRegisteredUser = db.prepare(`INSERT INTO users (username, password_hash) VALUES (?, ?)`);
    // Generate a salt and hash the password
    const salt = bcrypt.genSaltSync(13);
    const passwordHash = bcrypt.hashSync(password, salt);
    // Try, catch block to insert new user.
    try{
        insertRegisteredUser.run(username, passwordHash);
        return response.status(201).json({
            success: true,
            message: "User registered successfully!"
        });
    }
    catch(err){
        return response.status(500).json({
            success: false,
            message: "Error occurred when inserting new user into the database.",
            error: err.message
        });
    }
});

router.post('/usernamecheck', (request, response) => {
    const { username } = request.body;
    if(!username){
        return response.status(404).json({
            success: false,
            message: "Username is required for username check."
        });
    }
    const usernameCheck = db.prepare(`SELECT * FROM users WHERE username = ?`);
    try{
        const existingUser = usernameCheck.get(username);
        if(existingUser){
            return response.status(409).json({
                exists: true,
                message: "Username already exists!"
            })
        }
        return response.status(200).json({
            exists: false,
            message: "Username is available."
        });
    }
    catch(err){
        return response.status(500).json({
            exists: false,
            message: "Error occurred when checking for existing username.",
            error: err.message
        })
    }
});


module.exports = router;