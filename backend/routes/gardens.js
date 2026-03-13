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

router.get('/gardens/user/:user_id', (request, response) => {
    const selectGardens = db.prepare('SELECT * FROM gardens WHERE user_id = ?');
    try{
        const gardens = selectGardens.all(request.params.user_id);
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

router.post('/add', (request, response) => {
    let { user_id, garden_name, image_path, date_created } = request.body;
    if(!user_id || !garden_name){
        return response.status(400).json({
            message: "Missing required fields: user_id and garden_name are required."
        });
    }

    if(user_id <= 0 || typeof user_id !== 'number'){
        return response.status(400).json({
            message: "Invalid user_id. It must be a positive integer."
        });
    }

    if(!image_path){
        image_path = '';
    }

    if(garden_name.length < 2 || garden_name.length > 100){
        return response.status(400).json({
            message: "Invalid garden_name. It must be between 2 and 100 characters."
        });
    }

    if(date_created && isNaN(Date.parse(date_created))){
        return response.status(400).json({
            message: "Invalid date_created. It must be a valid date string."
        });
    }

    const gardenExistsCheck = db.prepare('SELECT * FROM gardens WHERE garden_name = ?');
    try{
        const existingGarden = gardenExistsCheck.get(garden_name);
        if(existingGarden){
            return response.status(400).json({
                message: "A garden with this name already exists. Please choose a different name."
            });
        }
    }
    catch(err){
        return response.status(500).json({
            message: "Error checking for existing garden in the database.",
            error: err.message
        });
    }

    const insertGarden = db.prepare('INSERT INTO gardens (user_id, garden_name, image_path, created_at) VALUES (?, ?, ?, ?)');
    try{
        const result = insertGarden.run(user_id, garden_name, image_path, date_created ? new Date(date_created).toISOString() : new Date().toISOString());
        return response.status(201).json({
            message: "Garden added successfully!",
            garden_id: result.lastInsertRowid
        });
    }
    catch(err){
        return response.status(500).json({
            message: "Error adding garden to the database.",
            error: err.message
        });
    }
});

router.put('/update/:garden_id', (request, response) => {
    const { garden_id } = request.params;
    const { garden_name, image_path } = request.body;
    if(!garden_name && !image_path){
        return response.status(400).json({
            message: "At least one field (garden_name or image_path) must be provided for update."
        });
    }

    const gardenExistsCheck = db.prepare('SELECT * FROM gardens WHERE garden_id = ?');
    try{
        const existingGarden = gardenExistsCheck.get(garden_id);
        if(!existingGarden){
            return response.status(404).json({
                message: "Garden not found with the provided garden_id."
            });
        }
    }
    catch(err){
        return response.status(500).json({
            message: "Error checking for existing garden in the database.",
            error: err.message
        });
    }

    const updateFields = [];
    const updateValues = [];
    if(garden_name){
        if(garden_name.length < 2 || garden_name.length > 100){
            return response.status(400).json({
                message: "Invalid garden_name. It must be between 2 and 100 characters."
            });
        }
        updateFields.push('garden_name = ?');
        updateValues.push(garden_name);
    }
    if(image_path){
        updateFields.push('image_path = ?');
        updateValues.push(image_path);
    }
    updateValues.push(garden_id);

    const updateGarden = db.prepare(`UPDATE gardens SET ${updateFields.join(', ')} WHERE garden_id = ?`);
    try{
        updateGarden.run(...updateValues);
        return response.status(200).json({
            message: "Garden updated successfully!"
        });
    }
    catch(err){
        return response.status(500).json({
            message: "Error updating garden in the database.",
            error: err.message
        });
    }
});

router.delete('/delete/:garden_id', (request, response) => {
    const { garden_id } = request.params;
    const gardenExistsCheck = db.prepare('SELECT * FROM gardens WHERE garden_id = ?');
    try{
        const existingGarden = gardenExistsCheck.get(garden_id);
        if(!existingGarden){
            return response.status(404).json({
                message: "Garden not found with the provided garden_id."
            });
        }
    }
    catch(err){
        return response.status(500).json({
            message: "Error checking for existing garden in the database.",
            error: err.message
        });
    }

    const deleteGarden = db.prepare('DELETE FROM gardens WHERE garden_id = ?');
    try{
        deleteGarden.run(garden_id);
        return response.status(200).json({
            message: "Garden deleted successfully!"
        });
    }
    catch(err){
        return response.status(500).json({
            message: "Error deleting garden from the database.",
            error: err.message
        });
    }
});


module.exports = router;