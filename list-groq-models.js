
import Groq from 'groq-sdk';

import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
// We need to parse .env manually or use dotenv because we are outside of Vite context
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        envConfig[key] = value;
    }
});

const groq = new Groq({
    apiKey: envConfig['VITE_GROQ_API_KEY']
});

async function main() {
    const models = await groq.models.list();
    console.log("Available Groq Models:");
    models.data.forEach((m) => {
        console.log(`- ${m.id}`);
    });
}

main().catch(console.error);
