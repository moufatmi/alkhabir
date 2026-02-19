import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.resolve(__dirname, 'dist', 'index.html');
const dest = path.resolve(__dirname, 'dist', '404.html');

try {
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('Successfully copied index.html to 404.html');
    } else {
        console.warn('Warning: dist/index.html does not exist. Skipping copy.');
    }
} catch (error) {
    console.error('Error copying file:', error);
    process.exit(1);
}
