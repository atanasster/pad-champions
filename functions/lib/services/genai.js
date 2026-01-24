"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenAIService = void 0;
const genai_1 = require("@google/genai");
const logger = __importStar(require("firebase-functions/logger"));
class GenAIService {
    constructor(apiKey, modelName = 'gemini-2.5-flash') {
        this.ai = new genai_1.GoogleGenAI({ apiKey });
        this.modelName = modelName;
    }
    async generateStream(medicalHistory, file, mimeType) {
        const parts = [];
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
                text: 'I have uploaded a file (image, PDF, DOCX, or TXT) containing my lab results or leg condition. ' +
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
exports.GenAIService = GenAIService;
//# sourceMappingURL=genai.js.map