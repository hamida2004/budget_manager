const bcrypt = require("bcrypt");
const db = require("./db");
const { ipcMain } = require("electron");

// Helper: Promisify db.all/get/run
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // for lastID and changes
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// Check if users exist
ipcMain.handle("has-users", async () => {
  try {
    const row = await dbGet("SELECT COUNT(*) as count FROM users");
    return row.count > 0;
  } catch (err) {
    throw err;
  }
});

// Register a new user
ipcMain.handle("register", async (event, userData) => {
  try {
    const { email, username, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbRun(
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
      [email, username, hashedPassword]
    );

    return { id: result.lastID, email, username };
  } catch (err) {
    throw err;
  }
});

// Authenticate a user
ipcMain.handle("login", async (event, credentials) => {
  try {
    const { email, password } = credentials;
    const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) throw new Error("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Incorrect password");

    return { id: user.id, username: user.username };
  } catch (err) {
    throw err;
  }
});
