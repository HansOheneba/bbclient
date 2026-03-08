/**
 * scripts/test-db.js
 * Run with: node scripts/test-db.js
 * Checks all common Hostinger connection configs and shows which works.
 */

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

// Also try the raw IP in case hostname routing is the issue
const ip = "82.197.82.162";

console.log("─────────────────────────────────────────");
console.log("  Bubble Bliss — DB Connection Check");
console.log("─────────────────────────────────────────");
console.log(`  Host    : ${host}`);
console.log(`  IP      : ${ip}`);
console.log(`  Port    : ${process.env.DB_PORT}`);
console.log(`  User    : ${user}`);
console.log(`  Password: ${'*'.repeat(password ? password.length : 0)} (${password ? password.length : 0} chars)`);
console.log(`  Database: ${database}`);
console.log("─────────────────────────────────────────\n");

if (!password || password.length === 0) {
  console.log("⚠️  DB_PASSWORD is empty — check your .env.local\n");
}

const combos = [
  { label: "hostname, port 3306, no SSL ", host, port: 3306, ssl: undefined },
  { label: "hostname, port 3306, +SSL   ", host, port: 3306, ssl: { rejectUnauthorized: false } },
  { label: "hostname, port 3307, no SSL ", host, port: 3307, ssl: undefined },
  { label: "raw IP,   port 3306, no SSL ", host: ip, port: 3306, ssl: undefined },
  { label: "raw IP,   port 3306, +SSL   ", host: ip, port: 3306, ssl: { rejectUnauthorized: false } },
];

(async () => {
  let succeeded = false;

  for (const c of combos) {
    process.stdout.write(`Testing ${c.label} ... `);
    try {
      const conn = await mysql.createConnection({
        host: c.host,
        port: c.port,
        user,
        password,
        database,
        connectTimeout: 8000,
        ...(c.ssl ? { ssl: c.ssl } : {}),
      });
      const [rows] = await conn.query("SELECT DATABASE() AS db, NOW() AS ts");
      await conn.end();
      console.log(`✓ SUCCESS  (db: ${rows[0].db}, server time: ${rows[0].ts})`);
      console.log(`\n✅ Working config → host: ${c.host}, port ${c.port}${c.ssl ? " + ssl: { rejectUnauthorized: false }" : ""}`);
      succeeded = true;
      break;
    } catch (e) {
      console.log(`✗ FAIL  (${e.code || e.message})`);
    }
  }

  if (!succeeded) {
    console.log(`
❌  All attempts failed.

Checklist:
  1. Hostinger hPanel → Databases → Remote MySQL
     → Make sure u549285479_bb row shows Access host: %
  2. Verify your .env.local credentials match what is in hPanel
  3. Try adding your current IP explicitly instead of % as a test
`);
  }
})();
