/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { GoogleGenAI, Part } from '@google/genai';

// Initialize the Google GenAI client once (or lazily)
// We expects GEMINI_API_KEY to be in the environment variables
const apiKey = process.env.GEMINI_API_KEY;

export const analyzePatientData = onCall({ cors: true }, async (request) => {
  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not set in environment variables.');
    throw new HttpsError('internal', 'Server configuration error');
  }

  const { medicalHistory, file, mimeType, model } = request.data;
  const modelName = model || 'gemini-2.5-flash';

  logger.info('Analyzing patient data', { model: modelName, hasFile: !!file });

  try {
    const ai = new GoogleGenAI({ apiKey });

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

    const systemPrompt =
      `
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

    const result = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    const text = result.text;
    const usageMetadata = result.usageMetadata;

    return {
      text: text,
      usageMetadata: usageMetadata,
    };
  } catch (error: unknown) {
    logger.error('Error calling Gemini API', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HttpsError('internal', `Failed to generate assessment: ${errorMessage}`);
  }
});
