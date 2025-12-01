const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

function runSqlFile(filename) {
  const fullPath = path.join(__dirname, filename);
  const sql = fs.readFileSync(fullPath, 'utf-8');
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function main() {
  try {
    await runSqlFile('init-db.sql');
    await runSqlFile('seed-db.sql');
    console.log('Database initialized and seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize DB', err);
    process.exit(1);
  }
}

main();
