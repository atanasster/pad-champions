import { GoogleGenAI, Part } from '@google/genai';
import * as logger from 'firebase-functions/logger';

export class GenAIService {
  private ai: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.5-flash') {
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  async generateStream(medicalHistory: string, file?: string, mimeType?: string) {
    const parts: Part[] = [];

    if (medicalHistory) {
      parts.push({ text: `Patient History/Symptoms: ${medicalHistory}` });
    }

    if (file && mimeType) {
      parts.push({
        inlineData: {
          data: file, // Expecting base64 string without prefix
          mimeType: mimeType,
        },
      });
      parts.push({
        text:
          'I have uploaded a file (image, PDF, DOCX, or TXT) containing my lab results or leg condition. ' +
          'Please analyze it.',
      });
    }

    const systemPrompt = `
      You are an expert vascular specialist assistant for the CHAMPIONS Limb Preservation Network.
      Your goal is to screen for Peripheral Artery Disease (PAD) risks.
      
      Analyze the provided medical notes and/or file uploads ` +
      `(which may be blood work results, medical reports, or photos of legs/feet).
      
      Provide a response in the following structure:
      1. **Risk Assessment**: High, Medium, or Low. Explain why.
      2. **Key Observations**: Bullet points of what you found in the text or file.
      3. **Lifestyle Recommendations**: 3-4 actionable tips.
      4. **Action Plan**: Specifically, should they see a doctor? (Yes/No/Urgent).

      IMPORTANT: If the file is unclear or not medical, politely say so.
      Disclaimer: Start your response with "AI Assessment (Not a Diagnosis):".
    `;

    logger.info('Generating stream', { model: this.modelName });

    return this.ai.models.generateContentStream({
      model: this.modelName,
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });
  }
}
