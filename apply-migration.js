const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
    const connectionString = "postgresql://postgres.tmyajzmkqlbowfinlgpp:qVX92s9xuebDzDTZ@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    const client = new Client({ connectionString });

    try {
        await client.connect();
        const sql = fs.readFileSync('supabase/migrations/20260221145000_add_null_checks_to_rpcs.sql', 'utf8');
        await client.query(sql);
        console.log("Migration executed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

runMigration();
