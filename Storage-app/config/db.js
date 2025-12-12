const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Republic_C207",
  database: "storage_store"
});

// Connect and handle error explicitly instead of throwing to avoid "Unhandled 'error' event".
db.connect(err => {
  if (err) {
    // Do not throw here — mysql2 will emit an 'error' event on the connection
    // and throwing would cause the process to crash without a listener.
    console.error('Database connection failed:', err.message || err);
    // If you want to terminate the app when DB is not available, exit explicitly:
    // process.exit(1);
    return;
  }
  console.log("Database connected ✅");
});

// Attach an 'error' listener to avoid emitting an unhandled 'error' event from the connection
// and to allow controlled logging or reconnection logic.
db.on('error', (err) => {
  console.error('Database error event:', err && err.message ? err.message : err);
  // Example: try reconnecting for common, recoverable errors (optional)
  // if (err.code === 'PROTOCOL_CONNECTION_LOST') connectAgain();
  // For fatal/unhandled cases, you might want to exit the process to restart with supervisor.
  // process.exit(1);
});

module.exports = db;
