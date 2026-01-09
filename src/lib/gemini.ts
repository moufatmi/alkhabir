import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const cleanJsonString = (text: string) => {
  let cleaned = text;
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json|```/g, '');
  // Find the first '{' and the last '}'
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned.trim();
};

export async function generateRawText(prompt: string, modelName: string = 'gemini-1.5-flash'): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Text API Error:', error);
    throw error;
  }
}

export async function analyzeWithGemini(summary: string): Promise<any> {
  try {
    const text = await generateRawText(summary);
    console.log('Gemini raw response:', text);

    let parsed = {};
    try {
      const cleaned = cleanJsonString(text);
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      try {
        const fixed = cleanJsonString(text)
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        parsed = JSON.parse(fixed);
      } catch (e2) {
        console.error('JSON Fix Failed:', e2);
        parsed = { raw: text };
      }
    }

    return {
      classifications: [],
      keyFactors: [],
      recommendedActions: [],
      precedentCases: [],
      ...parsed
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export async function analyzeImageWithGemini(prompt: string, base64Image: string, mimeType: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Image API Error:', error);
    throw error;
  }
}
