import axios from 'axios';

/**
 * Converts audio to text using a speech-to-text API.
 * @param audioFile - The audio file to transcribe.
 * @returns Transcribed text.
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioFile);

  try {
    // For now, we'll return a mock response since we don't have a real API endpoint yet
    return "تم تحويل الصوت إلى نص بنجاح";
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
