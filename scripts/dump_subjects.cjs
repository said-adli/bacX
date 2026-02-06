
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dump() {
    console.log("Dumping subjects table...");
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

dump();
