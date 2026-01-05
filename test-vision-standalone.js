
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
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

async function testVision() {
    console.log("Testing model: meta-llama/llama-4-scout-17b-16e-instruct");

    // A simple 1x1 white pixel JPEG base64
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: "What color is this image?" },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.1,
            max_tokens: 1024,
        });

        console.log("Success! Response:", chatCompletion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Error testing vision:", error);
    }
}

testVision();
