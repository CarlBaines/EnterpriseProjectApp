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

db.exec(`
    CREATE TABLE IF NOT EXISTS gardens (
        garden_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        garden_name TEXT NOT NULL COLLATE NOCASE UNIQUE,
        image_path TEXT NOT NULL,
        has_image bool NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )   
`);

const selectUsers = db.prepare(`SELECT * FROM users`).all();
console.log("Current users in the database:", selectUsers);

const selectGardens = db.prepare(`SELECT * FROM gardens`).all();
console.log("Current gardens in the database:", selectGardens);

// db.close();

// Module exports to export the database connection for use elsewhere.
module.exports = db;