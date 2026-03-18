// Import the Express module
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
// Create an instance of the Express application
const app = express();
const cors = require('cors');
// Port number for the server to listen on, defaulting to 3000 if not specified in environment variables
const PORT = process.env.PORT || 3002;

const corsOptions = {
  origin: "http://127.0.0.1:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.static('pages')); // Serve static files from the 'pages' directory
app.use(express.json()); // Adds middleware to parse JSON request bodies

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: 'data/sessions' }),
    secret: 'not-so-secret-key', // In production, use a secure, random secret and store it safely
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        secure: false, // Set to true if using HTTPS,
        maxAge: 1000 * 60 * 60 * 24 // Random long expiration for testing (1 day)
    }
}))

// Simple test routes
app.get('/', (request, response) => {
    response.status(200).json({
        message: "Gardening Manager 26 backend operational!"
    });
});

// Define routes
const usersRoute = require('./routes/users');
app.use('/users', usersRoute);

const gardenRoute = require('./routes/gardens');
app.use('/gardens', gardenRoute);

const notificationsRoute = require('./routes/notifications');
app.use('/notifications', notificationsRoute);

// 404 handler
app.use((request, response) => {
    response.status(404).json({
        message: "Endpoint not found"
    });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://127.0.0.1:${PORT}`);
});