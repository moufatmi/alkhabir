import { analyzeWithGemini } from '../lib/gemini';

export async function analyzeLegalCase(caseText: string) {
  const prompt = `
You are a legal expert AI. Always answer in Modern Standard Arabic (formal legal language).
Base your analysis and recommendations strictly on Moroccan law and legal codes. Do not reference any non-Moroccan laws or international principles.
Respond ONLY in valid JSON with the following keys:
- classifications: array of strings
- keyFactors: array of strings
- recommendedActions: array of strings
- precedentCases: array of strings

Analyze the following case and fill in each section appropriately. Do not include any text outside the JSON object.

Case Details:
${caseText}
  `;
  return await analyzeWithGemini(prompt);
}