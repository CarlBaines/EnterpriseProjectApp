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
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    )   
`);

// Drop users table if needed
// db.exec(`DROP TABLE users`);

// Inserts a test user
// const insertTestUser = db.prepare(`INSERT INTO users
//     (username, password_hash, email)
//     VALUES
//     ('testuser', 'hashedpassword123', 'test@gmail.com')    
// `);
// insertTestUser.run();


const selectUsers = db.prepare(`SELECT * FROM users`).all();
console.log("Current users in the database:", selectUsers);

// db.close();

// Module exports to export the database connection for use elsewhere.
module.exports = db;