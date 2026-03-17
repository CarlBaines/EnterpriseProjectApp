const express = require('express');
const router = express.Router();
const db = require('../db');

function routeHealthCheck(routeName){
    return (request, response) => {
        try{
            db.prepare('SELECT 1').get(); // Simple query to check database connection
            return response.status(200).send({
                message: `The notifications/${routeName} route is operational!`
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

router.get('/', (request, response) => {
    response.status(200).json({
        message: "Notifications endpoint is operational!"
    });
});

module.exports = router;