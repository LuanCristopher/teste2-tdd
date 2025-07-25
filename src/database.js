const Database = require('better-sqlite3');
const db = new Database('database.db', { verbose: console.log });

function setupDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      checked_in_at TEXT,
      FOREIGN KEY (participant_id) REFERENCES participants (id),
      FOREIGN KEY (event_id) REFERENCES events (id)
    );
  `);
}

setupDatabase();

module.exports = db;
