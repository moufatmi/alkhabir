
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
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

const apiKey = envConfig.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error('No API key found in .env');
    process.exit(1);
}

console.log('Found API Key (starts with):', apiKey.substring(0, 5) + '...');

async function testGemini() {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    const payload = {
        contents: [{
            parts: [{
                text: "Hello, answer with 'OK'."
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('API Request Failed:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
            process.exit(1);
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            console.log('SUCCESS: API key works and model responded.');
        } else {
            console.log('WARNING: API worked but response was unexpected:', text);
        }

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testGemini();
