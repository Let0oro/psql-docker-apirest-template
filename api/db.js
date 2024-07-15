const { Pool } = require("pg");
const { database } = require("pg/lib/defaults");

const pool = new Pool({
  host: "db",
  port: 5432,
  user: "user123",
  password: "password123",
  database: "db123",
});

module.exports = pool;