import axios from 'axios';

const ASSEMBLY_API_URL = 'https://api.assemblyai.com/v2';
const ASSEMBLY_API_KEY = 'a4679e31e8f34d3ca1dbf1b857f11c30';

/**
 * Converts audio to text using AssemblyAI API.
 * @param audioFile - The audio file to transcribe.
 * @returns Transcribed text.
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    // First, upload the audio file
    const audioData = await audioFile.arrayBuffer();
    const uploadResponse = await axios.post(`${ASSEMBLY_API_URL}/upload`, audioData, {
      headers: {
        authorization: ASSEMBLY_API_KEY,
        'Content-Type': 'application/octet-stream'
      }
    });
    const audioUrl = uploadResponse.data.upload_url;

    // Create transcription request
    const response = await axios.post(
      `${ASSEMBLY_API_URL}/transcript`,
      {
        audio_url: audioUrl,
        language_code: 'ar',
        speech_model: 'universal'
      },
      {
        headers: {
          authorization: ASSEMBLY_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const transcriptId = response.data.id;
    const pollingEndpoint = `${ASSEMBLY_API_URL}/transcript/${transcriptId}`;

    // Poll for results
    while (true) {
      const pollingResponse = await axios.get(pollingEndpoint, {
        headers: { authorization: ASSEMBLY_API_KEY }
      });
      const transcriptionResult = pollingResponse.data;

      if (transcriptionResult.status === 'completed') {
        return transcriptionResult.text;
      } else if (transcriptionResult.status === 'error') {
        throw new Error(`فشل التحويل: ${transcriptionResult.error}`);
      } else {
        // Wait 3 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return 'خطأ في المصادقة. يرجى التحقق من مفتاح API.';
      }
      return `خطأ في تحويل الصوت إلى نص: ${error.response?.data?.error || error.message}`;
    }
    return 'حدث خطأ أثناء تحويل الصوت إلى نص';
  }
}
