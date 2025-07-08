// Mock API endpoint for audio transcription
// In production, this would use a proper speech-to-text service

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if audio file is present
  if (!req.files || !req.files.audio) {
    return res.status(400).json({ error: 'Audio file is required' });
  }

  // Simulate transcription processing time
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Mock transcription response
  const mockTranscription = `
    This is a contract dispute case involving ABC Construction Company and XYZ Property Development. 
    The plaintiff alleges that the defendant failed to complete construction work according to the agreed specifications, 
    resulting in damages of approximately $50,000. The contract was signed on January 15th, 2024, 
    with a completion deadline of June 30th, 2024. The defendant claims that delays were caused by 
    unforeseen circumstances beyond their control, including permit delays and weather conditions.
    Key evidence includes the original contract, change orders, correspondence between parties, 
    and expert testimony regarding construction standards.
  `;

  res.status(200).json({ transcription: mockTranscription });
}