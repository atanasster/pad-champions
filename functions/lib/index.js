"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePatientData = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const genai_1 = require("./services/genai");
// Initialize the Google GenAI client once (or lazily)
// We expects GEMINI_API_KEY to be in the environment variables
const apiKey = process.env.GEMINI_API_KEY;
exports.analyzePatientData = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    var _a, e_1, _b, _c;
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
        const service = new genai_1.GenAIService(apiKey, modelName);
        const result = await service.generateStream(medicalHistory, file, mimeType);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        try {
            for (var _d = true, result_1 = __asyncValues(result), result_1_1; result_1_1 = await result_1.next(), _a = result_1_1.done, !_a; _d = true) {
                _c = result_1_1.value;
                _d = false;
                const chunk = _c;
                const chunkText = chunk.text;
                if (chunkText) {
                    res.write(chunkText);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = result_1.return)) await _b.call(result_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        res.end();
    }
    catch (error) {
        logger.error('Error calling Gemini API', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // If headers already sent, we can't send status 500
        if (!res.headersSent) {
            res.status(500).send(`Failed to generate assessment: ${errorMessage}`);
        }
        else {
            res.end();
        }
    }
});
//# sourceMappingURL=index.js.map