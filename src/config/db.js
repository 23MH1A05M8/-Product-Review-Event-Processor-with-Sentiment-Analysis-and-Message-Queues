const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "db",
  user: process.env.POSTGRES_USER || "user",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "review_db",
  port: 5432,
});

module.exports = pool;
