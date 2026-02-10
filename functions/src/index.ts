/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { GenAIService } from './services/genai';

// Initialize the Google GenAI client once (or lazily)
// We expects GEMINI_API_KEY to be in the environment variables
const apiKey = process.env.GEMINI_API_KEY;

export const analyzePatientData = onRequest({ cors: true }, async (req, res) => {
  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not set in environment variables.');
    res.status(500).send('Server configuration error');
    return;
  }

  // Handle preflight if cors option doesn't catch it strictly (usually v2 handles it)
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { medicalHistory, file, mimeType, model } = req.body.data || req.body; // Support both callable-style ({data: ...}) and raw JSON
  const modelName = model || 'gemini-2.5-flash';

  logger.info('Analyzing patient data (streaming)', { model: modelName, hasFile: !!file });

  try {
    const service = new GenAIService(apiKey, modelName);
    const result = await service.generateStream(medicalHistory, file, mimeType);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(chunkText);
      }
    }

    res.end();
  } catch (error: unknown) {
    logger.error('Error calling Gemini API', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // If headers already sent, we can't send status 500
    if (!res.headersSent) {
      res.status(500).send(`Failed to generate assessment: ${errorMessage}`);
    } else {
      res.end();
    }
  }
});

// User Management Exports
export { onUserCreated } from './userTriggers';
export { listUsers, setUserRole, setAdvisoryBoardStatus, getAdvisoryBoardMembers } from './userManagement';

// Event Management Exports
export { getEvents, manageEvent, seedEvents } from './events';

// Forum Exports
export { createPost, createReply, deleteForumItem } from './forum';
export { onReplyCreated } from './forumTriggers';

// Profile Exports
export { uploadProfilePhoto } from './profile';

// Resource Exports
export { 
  getResources, 
  createResourceFolder, 
  renameResource, 
  deleteResource,
  uploadResourceFile 
} from './resources';
