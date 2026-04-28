const express = require("express");
const router = express.Router();

// Import database
const db = require("../db");
// Import bcrypt for password hashing
const bcrypt = require("bcrypt");
// Import crypto for recovery key generation
const crypto = require("crypto");
const requireLogin = require("../middleware/auth");

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

router.get("/me", requireLogin, (request, response) => {
  try {
    const user = db
      .prepare(
        `SELECT user_id, username, profile_image, age_group, gender FROM users WHERE user_id = ?`,
      )
      .get(request.session.userId);

    if (!user) {
      return response.status(404).json({
        loggedIn: false,
        message: "User record not found.",
        userId: null,
        username: null,
      });
    }

    return response.status(200).json({
      loggedIn: true,
      message: "User is logged in.",
      userId: user.user_id,
      username: user.username,
      profileImage: user.profile_image || null,
      ageGroup: user.age_group || null,
      gender: user.gender || null,
    });
  } catch (err) {
    return response.status(500).json({
      loggedIn: false,
      message: "Failed to fetch user details.",
      error: err.message,
    });
  }
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
    if (err) {
      return response.status(500).json({
        exists: false,
        message: "Session Regeneration Error",
        err: err.message
      });
    }

    request.session.userId = user.user_id;
    request.session.username = user.username;
    request.session.save((err) => {
      if (err) {
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

router.post("/mhrating", (request, response) => {
  const { mhrating } = request.body;
  const userId = request.session.userId;
  if (mhrating === undefined || mhrating === null) {
    return response.status(404).json({
      success: false,
      message: "Mental health rating is required!",
    });
  }

  if (typeof mhrating !== "number" || mhrating < 1 || mhrating > 5) {
    return response.status(400).json({
      success: false,
      message: "Mental health rating must be a number between 1 and 5!",
    });
  }

  const updateMHRating = db.prepare(`UPDATE users SET mental_health_rating = ? WHERE user_id = ?`);
  try {
    const updatedUser = updateMHRating.run(mhrating, userId);
    if (updatedUser.changes === 0) {
      return response.status(404).json({
        success: false,
        message: "User not found to update mental health rating for!",
      });
    }
    return response.status(200).json({
      success: true,
      message: "Mental health rating stored successfully!",
    });
  }
  catch (err) {
    return response.status(500).json({
      success: false,
      message: "Error occurred when attempting to store mental health rating in the database.",
      error: err.message
    });
  }
});

router.post("/mhjournalentry", (request, response) => {
  const { mhJournalEntry } = request.body;
  const userId = request.session.userId;

  const updateMHJournalEntry = db.prepare(`UPDATE users SET mh_journal_entry = ? WHERE user_id = ?`);
  try {
    const updatedUser = updateMHJournalEntry.run(mhJournalEntry, userId);
    if (updatedUser.changes === 0) {
      return response.status(404).json({
        success: false,
        message: "User not found to update mental health journal entry for!"
      });
    }
    return response.status(200).json({
      success: true,
      message: "Mental health journal entry stored successfully!"
    });
  }
  catch (err) {
    return response.status(500).json({
      success: false,
      message: "Error occurred when attempting to store mental health journal entry in the database.",
      error: err.message
    });
  }
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

  // Generate a salt and hash the password
  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(13));

  // Generate recovery key and store it hashed in the database.
  const LENGTH = 25;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(LENGTH);
  const recoveryKey = Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");

  const recoveryKeyHash = bcrypt.hashSync(recoveryKey, bcrypt.genSaltSync(13));

  // Hash the password and insert the new user into the database
  const insertRegisteredUser = db.prepare(
    `INSERT INTO users (username, password_hash, recovery_key) VALUES (?, ?, ?)`,
  );
  // Try, catch block to insert new user.
  try {
    insertRegisteredUser.run(username, passwordHash, recoveryKeyHash);
    return response.status(201).json({
      success: true,
      message: "User registered successfully!",
      recoveryKey: recoveryKey, // Return the unhashed recovery key to the frontend to show to the user, but only at the moment of account creation.
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

router.post("/recoverykeycheck", (request, response) => {
  const { username, recoveryKey } = request.body;
  if (!username || !recoveryKey) {
    return response.status(404).json({
      valid: false,
      message: "Username and recovery key are required for recovery key check.",
    });
  }

  const selectRecoveryKey = db.prepare(`
    SELECT recovery_key FROM users WHERE username = ?
  `);

  try {
    const user = selectRecoveryKey.get(username);
    if(!user){
      return response.status(404).json({
        valid: false,
        message: "Invalid recovery key or username!",
      });
    }

    if(!user.recovery_key){
      return response.status(400).json({
        valid: false,
        message: "No recovery key is set for this account!",
      });
    }

    // Hashed key handling + fallback for older plaintext keys.
    const stored = user.recovery_key;
    const bcryptLikeness = typeof stored === "string" && stored.startsWith("$2");
    const isValid = bcryptLikeness
      ? bcrypt.compareSync(recoveryKey, stored)
      : recoveryKey === stored;

    if(!isValid){
      return response.status(404).json({
        valid: false,
        message: "Invalid recovery key or username!",
      });
    }

    return response.status(200).json({
      valid: true,
      message: "Recovery key is valid for the associated username!",
    });

  } catch (err) {
    return response.status(500).json({
      valid: false,
      message: "Error occurred when checking recovery key in the database.",
      error: err.message,
    });
  }
});

router.put("/updateaccountinformation", requireLogin, (request, response) => {
  const userId = request.session.userId;
  const {
    newProfileImage,
    newAgeGroup,
    newGender,
    profileImage,
    ageGroup,
    gender,
  } = request.body;

  const profileImageToSave =
    newProfileImage !== undefined ? newProfileImage : profileImage;
  const ageGroupToSave = newAgeGroup !== undefined ? newAgeGroup : ageGroup;
  const genderToSave = newGender !== undefined ? newGender : gender;

  const fields = [];
  const values = [];

  if (profileImageToSave !== undefined) {
    fields.push("profile_image = ?");
    values.push(profileImageToSave);
  }
  if (ageGroupToSave !== undefined) {
    fields.push("age_group = ?");
    values.push(ageGroupToSave);
  }
  if (genderToSave !== undefined) {
    fields.push("gender = ?");
    values.push(genderToSave);
  }

  if (fields.length === 0) {
    return response.status(400).json({
      success: false,
      message: "No account fields were provided to update.",
    });
  }

  values.push(userId);

  try {
    const updateAccountInformation = db.prepare(
      `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`,
    );

    updateAccountInformation.run(...values);

    const user = db
      .prepare(
        `SELECT user_id, username, profile_image, age_group, gender FROM users WHERE user_id = ?`,
      )
      .get(userId);

    return response.status(200).json({
      success: true,
      message: "Account information updated successfully!",
      user: {
        userId: user.user_id,
        username: user.username,
        profileImage: user.profile_image || null,
        ageGroup: user.age_group || null,
        gender: user.gender || null,
      },
    });
  } catch (err) {
    return response.status(500).json({
      success: false,
      message:
        "Error occurred when attempting to update account information in the database.",
      error: err.message,
    });
  }
});

router.post("/forgotpassword", (request, response) => {
  const { username, recoveryKey, confirmPassword } = request.body;
  if (!username || !recoveryKey || !confirmPassword) {
    return response.status(404).json({
      success: false,
      message: "Username, recovery key and confirm password is required for password reset.",
    });
  }

  if (typeof username !== "string" || typeof recoveryKey !== "string" || typeof confirmPassword !== "string") {
    return response.status(400).json({
      success: false,
      message: "Username, recovery key and confirm password must be strings for password reset.",
    });
  }

  // Check for password length requirements upon password reset
  if(confirmPassword.length < 12 || confirmPassword.length > 64){
    return response.status(400).json({
      success: false,
      message: "Confirm password must be between 12 characters and 64 characters long.",
    });
  }

  // Fetch the current password hash of the user first
  const selectUser = db.prepare(
    `SELECT password_hash, recovery_key FROM users WHERE username = ?`,
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
        "Error occurred when loading user for password reset.",
      error: err.message,
    });
  }

  if(!user.recovery_key){
    return response.status(400).json({
      success: false,
      message: "No recovery key is set for this account, cannot reset password with recovery key.",
    });
  }

  // Hashed key handling + fallback for older plaintext keys.
  const stored = user.recovery_key;
  const looksLikeBcrypt = typeof stored === "string" && stored.startsWith("$2");
  const recoveryOk = looksLikeBcrypt
    ? bcrypt.compareSync(recoveryKey, stored)
    : recoveryKey === stored;

  if (!recoveryOk) {
    return response.status(401).json({
      success: false,
      message: "Invalid recovery key or username.",
    });
  }

  // Check for a matching password hash to prevent password reuse.
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
    `UPDATE users SET password_hash = ?, recovery_key = NULL WHERE username = ?`,
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
