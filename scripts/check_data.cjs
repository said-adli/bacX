
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Minimal .env loader
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) env[k.trim()] = v.trim();
    });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking subjects...");
    const { data, error } = await supabase.from('subjects').select('id, name');

    if (error) {
        console.error("Error fetching subjects:", error);
        return;
    }

    const subjects = data || [];
    console.log(`Found ${subjects.length} subjects.`);
    console.table(subjects);

    let hasErrors = false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    subjects.forEach((s) => {
        if (!uuidRegex.test(s.id)) {
            console.error(`❌ INVALID UUID: [${s.name}] has id '${s.id}'`);
            hasErrors = true;
        } else {
            console.log(`✅ Valid: [${s.name}] -> ${s.id}`);
        }
    });

    if (!hasErrors) {
        console.log("All subject IDs are valid UUIDs.");
    }
}

check();
