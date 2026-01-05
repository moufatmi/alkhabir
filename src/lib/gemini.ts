import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

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

export async function generateRawText(prompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: model,
      temperature: 0.3,
    });
    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq Text API Error:', error);
    throw error;
  }
}

export async function analyzeWithGemini(summary: string): Promise<any> {
  try {
    const text = await generateRawText(summary);
    console.log('Groq raw response:', text);

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
    console.error('Groq API Error:', error);
    throw error;
  }
}

export async function analyzeImageWithGemini(prompt: string, base64Image: string, mimeType: string): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq Image API Error:', error);
    throw error;
  }
}
