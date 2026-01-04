const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY!;

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

export async function analyzeWithGemini(summary: string): Promise<any> {
  try {
    const result = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: summary
          }]
        }]
      })
    });

    if (!result.ok) {
      const errorText = await result.text();
      throw new Error(`API Error: ${result.status} ${result.statusText} - ${errorText}`);
    }

    const json = await result.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini raw response:', text);

    let parsed = {};
    try {
      const cleaned = cleanJsonString(text);
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      // Try to fix common JSON errors (very basic)
      try {
        const fixed = cleanJsonString(text)
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']');
        parsed = JSON.parse(fixed);
      } catch (e2) {
        console.error('JSON Fix Failed:', e2);
        parsed = { raw: text };
      }
    }

    // Ensure we return the raw text if parsing failed completely or if it's just a raw string
    if (Object.keys(parsed).length === 1 && (parsed as any).raw) {
      return {
        classifications: [],
        keyFactors: [],
        recommendedActions: [],
        precedentCases: [],
        ...parsed
      };
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
    const result = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    if (!result.ok) {
      const errorText = await result.text();
      throw new Error(`API Error: ${result.status} ${result.statusText} - ${errorText}`);
    }

    const json = await result.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
  } catch (error) {
    console.error('Gemini Image API Error:', error);
    throw error;
  }
}
