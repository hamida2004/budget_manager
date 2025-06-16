const { ipcMain } = require("electron");
const db = require("./db");

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
      else resolve(this);
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
  ipcMain.handle(`get-${table}`, async () => {
    try {
      const rows = await dbAll(`SELECT * FROM ${table}`);
      return rows;
    } catch (err) {
      throw err;
    }
  });

  ipcMain.handle(`add-${table}`, async (_, data) => {
    try {
      const keys = fields.filter(f => data[f] !== undefined).join(", ");
      const placeholders = fields.filter(f => data[f] !== undefined).map(() => "?").join(", ");
      const values = fields.filter(f => data[f] !== undefined).map((f) => data[f]);

      const result = await dbRun(
        `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`,
        values
      );

      return { id: result.lastID, ...data };
    } catch (err) {
      throw err;
    }
  });

  ipcMain.handle(`delete-${table}`, async (_, id) => {
    try {
      await dbRun(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return { success: true };
    } catch (err) {
      throw err;
    }
  });

  ipcMain.handle(`update-${table}`, async (_, data) => {
    try {
      const updates = fields.filter(f => data[f] !== undefined).map((f) => `${f} = ?`).join(", ");
      const values = fields.filter(f => data[f] !== undefined).map((f) => data[f]);
      values.push(data.id);

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

db.createCrudHandlers("users", ["email", "username", "password"]);
db.createCrudHandlers("laboratory", ["name", "wilaya", "univ"]);
db.createCrudHandlers("chapters", ["name"]);
db.createCrudHandlers("articles", ["name", "chapter_id"]);
db.createCrudHandlers("sousarticles", ["name", "article_id"]);
db.createCrudHandlers("budgets", ["year", "type", "total_amount", "spent", "created_at"]);
db.createCrudHandlers("budget_divisions", ["budget_id", "sousarticle_id", "amount", "created_at"]);
db.createCrudHandlers("total_budget", ["amount", "spent"]);
db.createCrudHandlers("notifications", ["title", "content", "amount", "created_at"]);