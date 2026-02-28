const Database = require('better-sqlite3');

// Set to users.db for now
// Could have one centralised database or multiple databases for different purposes (e.g. users, plants, etc.)
const db = new Database('users.db');

// Create a users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_hash TEXT NOT NULL,
        recovery_key TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    )   
`);

// Drop users table if needed
// db.exec(`DROP TABLE users`);

const selectUsers = db.prepare(`SELECT * FROM users`).all();
console.log("Current users in the database:", selectUsers);

// db.close();

// Module exports to export the database connection for use elsewhere.
module.exports = db;