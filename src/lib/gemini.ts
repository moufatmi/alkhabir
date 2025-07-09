const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY!;

const cleanJsonString = (text: string) => {
  // Remove code block markers and trim
  return text
    .replace(/```json|```/g, '')
    .replace(/^[^[{]*([\[{].*[\]}])[^]}]*$/s, '$1') // Try to extract JSON object/array
    .trim();
};

export async function analyzeWithGemini(summary: string): Promise<any> {
  const result = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
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
  
  const json = await result.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Gemini raw response:', text);

  let parsed = {};
  try {
    const cleaned = cleanJsonString(text);
    parsed = JSON.parse(cleaned);
  } catch (e) {
    parsed = { raw: text };
    }
  return {
    classifications: [],
    keyFactors: [],
    recommendedActions: [],
    precedentCases: [],
    ...parsed
  };
  }
  