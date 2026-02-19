import { functions } from '../lib/appwrite';
import { ExecutionMethod } from 'appwrite';

const AI_FUNCTION_ID = import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID;

interface AIRequestPayload {
    caseId: string;
    queryText: string;
}

class AIService {
    /**
     * Trigger the AI analysis cloud function.
     * This bridges the request to the secure backend (Appwrite Function -> Vertex AI).
     * 
     * @param caseId - The ID of the case to analyze
     * @param queryText - The legal question or description
     * @returns The execution ID (async processing) or result
     */
    async triggerAIAnalysis(caseId: string, queryText: string): Promise<any> {
        try {
            if (!AI_FUNCTION_ID) {
                throw new Error('AI Cloud Function ID is not configured');
            }

            const payload: AIRequestPayload = {
                caseId,
                queryText,
            };

            // Create an execution for the function
            // Assuming 'analyze-case' function is deployed on Appwrite
            const execution = await functions.createExecution(
                AI_FUNCTION_ID,
                JSON.stringify(payload),
                false, // Async execution (false = synchronous, true = async) - adjust based on your function's timeout/mode
                '/',
                ExecutionMethod.POST
            );

            if (execution.status === 'failed') {
                throw new Error(`AI Analysis failed: ${execution.responseBody}`);
            }

            // If function returns JSON, parse it
            try {
                return JSON.parse(execution.responseBody);
            } catch {
                return execution.responseBody;
            }

        } catch (error) {
            console.error('Appwrite service :: triggerAIAnalysis :: error', error);
            throw error;
        }
    }
}

export const aiService = new AIService();
export default aiService;
