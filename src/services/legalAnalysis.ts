import { functions } from '../lib/appwrite';
import { ExecutionMethod } from 'appwrite';

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID;

async function executeAiFunction(payload: any) {
  if (!FUNCTION_ID) {
    throw new Error("VITE_APPWRITE_AI_FUNCTION_ID is not defined");
  }

  try {
    const execution = await functions.createExecution(
      FUNCTION_ID,
      JSON.stringify(payload),
      false, // async (false = wait for result)
      '/', // path
      ExecutionMethod.POST // method
    );

    if (execution.status === 'completed') {
      const response = JSON.parse(execution.responseBody);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || "AI request failed");
      }
    } else {
      throw new Error("Execution failed or timed out");
    }
  } catch (error: any) {
    console.error("Appwrite Function Error:", error);
    throw error;
  }
}

export async function analyzeLegalCase(caseText: string) {
  const response = await executeAiFunction({
    type: 'analyze',
    description: caseText
  });

  // Parse the analysis string into an object if it's a string
  return typeof response.analysis === 'string'
    ? JSON.parse(response.analysis)
    : response.analysis;
}

export async function askLegalQuestion(question: string) {
  const response = await executeAiFunction({
    type: 'question',
    query: question
  });
  return response.result;
}

export async function suggestClarifyingQuestions(caseText: string) {
  const response = await executeAiFunction({
    type: 'suggest',
    description: caseText
  });

  const resultText = response.result;
  if (typeof resultText === 'string') {
    return resultText.split(/\n|\r/).map((q: string) => q.trim()).filter((q: string) => q.length > 0);
  }
  return [];
}
