const express = require("express");
const router = express.Router();

// Import database
const db = require("../db");
// Import bcrypt for password hashing
const bcrypt = require("bcrypt");
// Import crypto for recovery key generation
const crypto = require("crypto");

function routeHealthCheck(routeName) {
  return (request, response) => {
    try {
      db.prepare("SELECT 1").get(); // Simple query to check database connection
      return response.status(200).send({
        message: `The users/${routeName} route is operational!`,
      });
    } catch (err) {
      return response.status(500).json({
        message: "Database is not operational!",
        error: err.message,
      });
    }
  };
}

// GET routes for testing
router.get("/login", routeHealthCheck("login"));
router.get("/usernamecheck", routeHealthCheck("usernamecheck"));
router.get(
  "/forgotpasswordusernamecheck",
  routeHealthCheck("forgotpasswordusernamecheck"),
);
router.get("/signup", routeHealthCheck("signup"));
// router.get("/me", routeHealthCheck("me"));
router.get("/recoverykey", routeHealthCheck("recoverykey"));
router.get("/forgotpassword", routeHealthCheck("forgotpassword"));
router.get("/logout", routeHealthCheck("logout"));

router.get("/", (request, response) => {
  response.status(200).json({
    message: "Users endpoint is operational!",
  });
});

// /all route to retrieve all users in the database (for testing purposes, not for production use)
router.get("/all", (request, response) => {
  const selectSql = db.prepare(`SELECT * FROM users`);
  try {
    const users = selectSql.all();
    if (!users || users.length === 0) {
      return response.status(404).json({
        message: "No users found in the database.",
      });
    }
    return response.status(200).json({
      count: users.count,
      users: users,
    });
  } catch (err) {
    return response.status(500).json({
      message:
        "Error occurred when attempting to retrieve users from the database.",
      error: err.message,
    });
  }
});

router.get("/me", (request, response) => {
  if(!request.session.userId){
    return response.status(401).json({
      loggedIn: false,
      message: "User is not logged in.",
      userId: null
    });
  }
  return response.status(200).json({
    loggedIn: true,
    message: "User is logged in.",
    userId: request.session.userId
  });
});



/*
    POST routes for login, signup, username check, forgot password, logout
*/

router.post("/login", (request, response) => {
  let { username, password } = request.body;
  username = username.trim();

  if (!username || !password) {
    return response.status(400).json({
      success: false,
      message: "Username and password are required for login.",
    });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return response.status(400).json({
      success: false,
      message: "Username and password must be strings.",
    });
  }

  if (username.length < 3 || username.length > 32) {
    return response.status(400).json({
      success: false,
      message: "Username must be between 3 characters and 32 characters long.",
    });
  }

  if (password.length < 12 || password.length > 64) {
    return response.status(400).json({
      success: false,
      message: "Password must be between 12 characters and 64 characters long.",
    });
  }

  // Check if the user exists in the database
  const selectUser = db.prepare(`SELECT * FROM users WHERE username = ?`);
  try {
    const user = selectUser.get(username);
    if (!user) {
      return response.status(401).json({
        exists: false,
        message: "Username not found!",
      });
    }
  } catch (err) {
    return response.status(500).json({
      exists: false,
      message: "Error occurred when checking for existing username.",
      error: err.message,
    });
  }

  // If user exists, compare the provided password with the stored password hash
  const user = selectUser.get(username);
  const hashedPassword = user.password_hash;
  const passwordMatch = bcrypt.compareSync(password, hashedPassword);

  if (!passwordMatch) {
    return response.status(401).json({
      exists: false,
      message: "Invalid password!",
    });
  }

  request.session.regenerate((err) => {
    if(err){
      return response.status(500).json({
        exists: false,
        message: "Session Regeneration Error",
        err: err.message
      });
    }

    request.session.userId = user.user_id;
    request.session.username = user.username;
    request.session.save((err) => {
      if(err){
        return response.status(500).json({
          exists: false,
          message: "Session Save Error",
          err: err.message
        })
      }

      return response.status(200).json({
        exists: true,
        message: "User Login Successful!",
      })
    });

    console.log("Session after login:", request.session);
  });
});

router.post("/signup", (request, response) => {
  let { username, password } = request.body;
  username = username.trim();

  if (!username || !password) {
    return response.status(400).json({
      success: false,
      message: "Username and password are required for signup.",
    });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return response.status(400).json({
      success: false,
      message: "Username and password must be strings.",
    });
  }

  if (username.length < 3 || username.length > 32) {
    return response.status(400).json({
      success: false,
      message: "Username must be between 3 characters and 32 characters long.",
    });
  }

  if (password.length < 12 || password.length > 64) {
    return response.status(400).json({
      success: false,
      message: "Password must be between 12 characters and 64 characters long.",
    });
  }

  const usernameCheck = db.prepare(`SELECT * FROM users WHERE username = ?`);
  try {
    const existingUser = usernameCheck.get(username);
    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: "Username already exists!",
      });
    }
  } catch (err) {
    return response.status(500).json({
      success: false,
      message: "Error occurred when checking for existing username.",
      error: err.message,
    });
  }
  // Hash the password and insert the new user into the database
  const insertRegisteredUser = db.prepare(
    `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
  );
  // Generate a salt and hash the password
  const salt = bcrypt.genSaltSync(13);
  const passwordHash = bcrypt.hashSync(password, salt);
  // Try, catch block to insert new user.
  try {
    insertRegisteredUser.run(username, passwordHash);
    return response.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (err) {
    return response.status(500).json({
      success: false,
      message: "Error occurred when inserting new user into the database.",
      error: err.message,
    });
  }
});

router.post("/usernamecheck", (request, response) => {
  const { username } = request.body;
  if (!username) {
    return response.status(404).json({
      exists: false,
      message: "Username is required for username check.",
    });
  }
  const usernameCheck = db.prepare(`SELECT * FROM users WHERE username = ?`);
  try {
    const existingUser = usernameCheck.get(username);
    if (existingUser) {
      return response.status(409).json({
        exists: true,
        message: "Username already exists!",
      });
    }
    return response.status(200).json({
      exists: false,
      message: "Username is available.",
    });
  } catch (err) {
    return response.status(500).json({
      exists: false,
      message: "Error occurred when checking for existing username.",
      error: err.message,
    });
  }
});

router.post("/forgotpasswordusernamecheck", (request, response) => {
  let { username } = request.body;
  username = username.trim();
  if (!username) {
    return response.status(404).json({
      exists: false,
      message: "Username is required for forgot password username check.",
    });
  }

  if (typeof username !== "string") {
    return response.status(400).json({
      exists: false,
      message: "Username must be a string for forgot password username check.",
    });
  }

  if (username.length < 3 || username.length > 32) {
    return response.status(400).json({
      exists: false,
      message:
        "Username must be between 3 characters and 32 characters long for forgot password username check.",
    });
  }

  const fpUsernameCheck = db.prepare(`SELECT * FROM users WHERE username = ?`);
  try {
    const existingUser = fpUsernameCheck.get(username);
    if (existingUser) {
      return response.status(200).json({
        exists: true,
        message: "Username is valid for forgot password!",
      });
    } else {
      return response.status(404).json({
        exists: false,
        message: "Username not found for forgot password.",
      });
    }
  } catch (err) {
    return response.status(500).json({
      exists: false,
      message:
        "Error occurred when checking for existing username for forgot password.",
      error: err.message,
    });
  }
});

// Route which posts a recovery key to the database for a user
router.post("/recoverykey", (request, response) => {
  const { username } = request.body;
  if (!username) {
    return response.status(404).json({
      success: false,
      message: "Username is required to generate and store recovery key.",
    });
  }

  // Generate a 25-character random recovery key
  const LENGTH = 25;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const bytes = crypto.randomBytes(LENGTH);
  const recoveryKey = Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");
  // REMOVE THIS IN PRODUCTION FOR SECURITY PURPOSES
  // console.log("Generated recovery key:", recoveryKey);

  const postRecoveryKey = db.prepare(
    `UPDATE users SET recovery_key = ? WHERE username = ?`,
  );
  try {
    const updatedUser = postRecoveryKey.run(recoveryKey, username);
    // If changes is 0, then no user was found with the provided username to update the recovery key for.
    if (updatedUser.changes === 0) {
      return response.status(404).json({
        success: false,
        message: "Username not found to store recovery key.",
      });
    }
    return response.status(200).json({
      success: true,
      message: "Recovery key generated and stored successfully!",
      recoveryKey: recoveryKey,
    });
  } catch (err) {
    return response.status(500).json({
      success: false,
      message:
        "Error occurred when attempting to store recovery key in the database.",
      error: err.message,
    });
  }
});

router.post("/recoverykeycheck", (request, response) => {
  const { username, recoveryKey } = request.body;
  if (!username || !recoveryKey) {
    return response.status(404).json({
      valid: false,
      message: "Username and recovery key are required for recovery key check.",
    });
  }

  const recoveryKeyCheck = db.prepare(
    `SELECT * FROM users WHERE username = ? AND recovery_key = ?`,
  );
  try {
    const recoveryKeyValid = recoveryKeyCheck.get(username, recoveryKey);
    if (recoveryKeyValid) {
      return response.status(200).json({
        valid: true,
        message: "Recovery key is valid!",
      });
    } else {
      return response.status(404).json({
        valid: false,
        message: "Invalid recovery key or username.",
      });
    }
  } catch (err) {
    return response.status(500).json({
      valid: false,
      message: "Error occurred when checking recovery key in the database.",
      error: err.message,
    });
  }
});

router.post("/forgotpassword", (request, response) => {
  const { username, confirmPassword } = request.body;
  if (!username || !confirmPassword) {
    return response.status(404).json({
      success: false,
      message: "Confirmed new password is required to reset password.",
    });
  }

  // Fetch the current password hash of the user first
  const selectUser = db.prepare(
    `SELECT password_hash FROM users WHERE username = ?`,
  );
  let user;
  try {
    user = selectUser.get(username);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "Username not found to reset password for.",
      });
    }
  } catch (err) {
    return response.status(500).json({
      success: false,
      message:
        "Error occurred when checking for existing username to reset password for.",
      error: err.message,
    });
  }

  const passwordMatch = bcrypt.compareSync(confirmPassword, user.password_hash);
  if (passwordMatch) {
    return response.status(400).json({
      success: false,
      message:
        "New password cannot be the same as the old password. Please enter a different new password.",
    });
  }

  const salt = bcrypt.genSaltSync(13);
  const passwordHash = bcrypt.hashSync(confirmPassword, salt);

  // recovery_key = NULL
  const updatePassword = db.prepare(
    `UPDATE users SET password_hash = ? WHERE username = ?`,
  );
  try {
    const updatedUser = updatePassword.run(passwordHash, username);
    if (updatedUser.changes === 0) {
      return response.status(404).json({
        success: false,
        message: "Username not found to reset password for.",
      });
    }
    return response.status(200).json({
      success: true,
      message: "Password reset successful!",
    });
  } catch (err) {
    return response.status(500).json({
      success: false,
      message:
        "Error occurred when attempting to reset password in the database.",
      error: err.message,
    });
  }
});

module.exports = router;
