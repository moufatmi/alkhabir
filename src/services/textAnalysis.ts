import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyBUkILpOwF3DmySUfhGR28e2d5qKyyluZI';

/**
 * Analyzes legal text and extracts key points using Gemini API.
 * @param text - The legal text to analyze.
 * @returns Extracted key points.
 */
export async function analyzeLegalText(text: string): Promise<string[]> {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
      }
    );
    return response.data.contents[0].parts.map((part: any) => part.text);
  } catch (error) {
    console.error('Error analyzing legal text:', error);
    throw error;
  }
}
