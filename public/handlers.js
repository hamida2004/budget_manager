const { ipcMain } = require("electron");
const db = require("./db");

// Utility: Create CRUD handlers for any table
// Utility: Create CRUD handlers for any table
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // this.lastID, this.changes
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

db.createCrudHandlers = (table, fields) => {
  // GET ALL
  ipcMain.handle(`get-${table}`, async () => {
    try {
      const rows = await dbAll(`SELECT * FROM ${table}`);
      return rows;
    } catch (err) {
      throw err;
    }
  });

  // ADD
  ipcMain.handle(`add-${table}`, async (_, data) => {
    try {
      const keys = fields.join(", ");
      const placeholders = fields.map(() => "?").join(", ");
      const values = fields.map((f) => data[f]);

      const result = await dbRun(
        `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`,
        values
      );

      return { id: result.lastID, ...data };
    } catch (err) {
      throw err;
    }
  });

  // DELETE
  ipcMain.handle(`delete-${table}`, async (_, id) => {
    try {
      await dbRun(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return { success: true };
    } catch (err) {
      throw err;
    }
  });

  // UPDATE
  ipcMain.handle(`update-${table}`, async (_, data) => {
    try {
      const updates = fields.map((f) => `${f} = ?`).join(", ");
      const values = fields.map((f) => data[f]);
      values.push(data.id); // for WHERE id = ?

      await dbRun(
        `UPDATE ${table} SET ${updates} WHERE id = ?`,
        values
      );

      return { success: true };
    } catch (err) {
      throw err;
    }
  });
};


// Define handlers for each table
db.createCrudHandlers("users", ["email", "username", "password"]);
db.createCrudHandlers("laboratory", ["name", "wilaya", "univ"]);
db.createCrudHandlers("chapters", ["name"]);
db.createCrudHandlers("articles", ["name", "chapter_id"]);
db.createCrudHandlers("sousarticles", ["name", "article_id"]);
db.createCrudHandlers("budgets", ["year", "type", "total_amount","spent"]);
db.createCrudHandlers("budget_divisions", ["budget_id", "sousarticle_id", "amount"]);
db.createCrudHandlers("total_budget", ["amount", "spent"]);
db.createCrudHandlers("notifications", ["title", "content","amount"]);
