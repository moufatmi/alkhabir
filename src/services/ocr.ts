import { functions } from '../lib/appwrite';
import { ExecutionMethod } from 'appwrite';

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID;

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
        const base64Image = await fileToBase64(file);

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
                throw new Error(response.error || "OCR failed");
            }
        } else {
            throw new Error("Execution failed or timed out");
        }
    } catch (error: any) {
        console.error('OCR Error:', error);
        throw new Error('فشل استخراج النص من الصورة. يرجى المحاولة مرة أخرى.');
    }
}
