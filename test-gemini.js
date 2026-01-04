
import { askLegalQuestion } from './src/services/legalAnalysis';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Mock import.meta.env
// We need to read .env file manually
const envPath = resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// @ts-ignore
global.import = { meta: { env: { VITE_GEMINI_API_KEY: envConfig.VITE_GEMINI_API_KEY } } };

// Mocking fetch since it's used in gemini.ts
// Node 18+ has fetch, but we need to make sure it works or use a polyfill if needed.
// Assuming Node environment has fetch.

async function test() {
  console.log('Testing askLegalQuestion...');
  try {
    const result = await askLegalQuestion('ما هي عقوبة السرقة؟');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result && result.raw) {
        console.log('Test PASSED: Got raw response.');
    } else {
        console.log('Test FAILED: No raw response.');
    }
  } catch (error) {
    console.error('Test FAILED with error:', error);
  }
}

test();
