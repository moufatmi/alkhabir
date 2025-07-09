import axios from 'axios';

/**
 * Analyzes emotions in audio recordings.
 * @param audioFile - The audio file to analyze.
 * @returns Detected emotions.
 */
export async function analyzeEmotions(audioFile: File): Promise<string[]> {
  const formData = new FormData();
  formData.append('file', audioFile);

  try {
    const response = await axios.post('https://api.emotion-analysis.com/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.emotions;
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    throw error;
  }
}
