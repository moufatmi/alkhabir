import { analyzeImageWithGemini } from '../lib/gemini';

/**
 * Converts a File object to a Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Extracts text from an image file using Gemini API.
 * @param file The image file to process.
 * @returns The extracted text.
 */
export async function extractTextFromImage(file: File): Promise<string> {
    try {
        const base64Image = await fileToBase64(file);
        const prompt = `
    أنت خبير في النسخ الرقمي (OCR). مهمتك هي استخراج النص الموجود في هذه الصورة بدقة متناهية.
    
    التعليمات:
    1. اكتب النص الموجود في الصورة فقط.
    2. لا تضف أي مقدمات (مثل "إليك النص") أو خاتمة.
    3. حافظ على التنسيق والفقرات كما هي في الصورة قدر الإمكان.
    4. إذا كان النص غير واضح، حاول استنتاجه من السياق إذا أمكن، أو تجاهله إذا كان مستحيلاً.
    5. اللغة المتوقعة هي العربية (وربما بعض الفرنسية في المصطلحات القانونية).
    `;

        return await analyzeImageWithGemini(prompt, base64Image, file.type);
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('فشل استخراج النص من الصورة. يرجى المحاولة مرة أخرى.');
    }
}
