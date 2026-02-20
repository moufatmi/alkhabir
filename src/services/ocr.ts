import { functions } from '../lib/appwrite';
import { ExecutionMethod } from 'appwrite';

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID;

/**
 * Compresses an image file before sending it to the server.
 */
const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file); // Fallback to original
                    }
                }, 'image/jpeg', quality);
            };
        };
        reader.onerror = () => resolve(file);
    });
};

/**
 * Converts a File object to a Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result); // Keep the data URL prefix for the API
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Extracts text from an image file using Appwrite Function (OCR).
 * @param file The image file to process.
 * @returns The extracted text.
 */
export async function extractTextFromImage(file: File): Promise<string> {
    if (!FUNCTION_ID) {
        throw new Error("VITE_APPWRITE_AI_FUNCTION_ID is not defined");
    }

    try {
        console.log(`Original image size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await compressImage(file);
        console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        const base64Image = await fileToBase64(compressedFile);

        const execution = await functions.createExecution(
            FUNCTION_ID,
            JSON.stringify({
                type: 'ocr',
                image: base64Image,
                description: "استخرج النص من هذه الصورة."
            }),
            false,
            '/',
            ExecutionMethod.POST
        );

        if (execution.status === 'completed') {
            const response = JSON.parse(execution.responseBody);
            if (response.success) {
                return response.result || response.analysis;
            } else {
                console.error('OCR Function Error Response:', response);
                throw new Error(response.error || "OCR failed");
            }
        } else {
            console.error('OCR Execution Failed. Full Execution Object:', execution);
            throw new Error(`Execution ended with status: ${execution.status}. Error: ${execution.errors || 'Unknown timeout or failure'}`);
        }
    } catch (error: any) {
        console.error('OCR Error:', error);
        throw new Error('فشل استخراج النص من الصورة. يرجى المحاولة مرة أخرى.');
    }
}
