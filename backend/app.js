// Import the Express module
const express = require('express');
// Create an instance of the Express application
const app = express();
// Port number for the server to listen on, defaulting to 3000 if not specified in environment variables
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Adds middleware to parse JSON request bodies

// Simple test routes
app.get('/', (request, response) => {
    response.status(200).json({
        message: "Gardening Manager 26 backend operational!"
    });
});

// Define routes
const usersRoute = require('./routes/users');
app.use('/users', usersRoute);

// 404 handler
app.use((request, response) => {
    response.status(404).json({
        message: "Endpoint not found"
    });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});