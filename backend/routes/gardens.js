const express = require('express');
const router = express.Router();
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

router.get('/', routeHealthCheck('gardens'));

router.get('/all', (request, response) => {
    const selectGardens = db.prepare('SELECT * FROM gardens');
    try{
        const gardens = selectGardens.all();
        if(gardens.length === 0){
            return response.status(200).json({
                message: "No gardens found for the user.",
                gardens: []
            });
        }
        return response.status(200).json({
            message: "Gardens retrieved successfully!",
            gardens: gardens
        });
    }
    catch(err){
        return response.status(500).json({
            message: "Error retrieving gardens from the database.",
            error: err.message
        });
    }
})

module.exports = router;