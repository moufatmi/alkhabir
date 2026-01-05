import { generateRawText } from '../lib/gemini';

/**
 * Analyzes legal text and extracts key points using Groq API (via the adapter).
 * @param text - The legal text to analyze.
 * @returns Extracted key points (as an array containing the response text).
 */
export async function analyzeLegalText(text: string): Promise<string[]> {
  try {
    const responseText = await generateRawText(text);
    return [responseText];
  } catch (error) {
    console.error('Error analyzing legal text:', error);
    throw error;
  }
}
