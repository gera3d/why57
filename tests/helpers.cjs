const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const migrationSource = fs.readFileSync(
  path.join(__dirname, "..", "cloudflare", "why57-roi-intake", "migrations", "0001_intake_idempotency.sql"),
  "utf8"
);

function createD1() {
  const database = new DatabaseSync(":memory:");
  database.exec(migrationSource);

  return {
    database,
    prepare(sql) {
      let parameters = [];
      return {
        bind(...values) {
          parameters = values;
          return this;
        },
        async first(columnName) {
          const row = database.prepare(sql).get(...parameters) || null;
          return row && columnName ? row[columnName] : row;
        },
        async run() {
          const result = database.prepare(sql).run(...parameters);
          return {
            success: true,
            results: [],
            meta: {
              changes: Number(result.changes || 0),
              last_row_id: Number(result.lastInsertRowid || 0)
            }
          };
        }
      };
    }
  };
}

module.exports = { createD1, migrationSource };
