const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('bookings.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
    createTables();
  }
});

function createTables() {

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT,
      email TEXT,
      phone TEXT,
      checkin TEXT,
      checkout TEXT,
      roomtype TEXT,
      guests INTEGER,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const hash = bcrypt.hashSync('admin123', 10);

  db.run(
    `INSERT OR IGNORE INTO users (username,password,role)
     VALUES (?,?,?)`,
    ['admin', hash, 'admin']
  );
}

module.exports = db;