import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Brain, FileText, Activity, AlertTriangle, Terminal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Pricing estimates for Gemini 2.5 Flash (Example rates, subject to change)
const COST_PER_1M_INPUT_TOKENS = 0.10;
const COST_PER_1M_OUTPUT_TOKENS = 0.40;
const AI_MODEL = 'gemini-2.5-flash';

const AIScreening: React.FC = () => {
  const [medicalHistory, setMedicalHistory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<{
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const getMimeType = (file: File) => {
    if (file.type) return file.type;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'txt') return 'text/plain';
    if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    return 'application/octet-stream';
  };

  const fileToGenerativePart = async (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64," or "data:application/pdf;base64,")
        const base64Content = base64Data.split(',')[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: getMimeType(file),
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!medicalHistory && !selectedFile) {
      setError("Please provide medical history or upload a file.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis('');
    setUsageStats(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured. Please check your .env file.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const parts: any[] = [];
      
      if (medicalHistory) {
        parts.push({ text: `Patient History/Symptoms: ${medicalHistory}` });
      }

      if (selectedFile) {
        const filePart = await fileToGenerativePart(selectedFile);
        parts.push(filePart);
        parts.push({ text: "I have uploaded a file (image, PDF, DOCX, or TXT) containing my lab results or leg condition. Please analyze it." });
      }

      const systemPrompt = `
        You are an expert vascular specialist assistant for the CHAMPIONS Limb Preservation Network.
        Your goal is to screen for Peripheral Artery Disease (PAD) risks.
        
        Analyze the provided medical notes and/or file uploads (which may be blood work results, medical reports, or photos of legs/feet).
        
        Provide a response in the following structure:
        1. **Risk Assessment**: High, Medium, or Low. Explain why.
        2. **Key Observations**: Bullet points of what you found in the text or file.
        3. **Lifestyle Recommendations**: 3-4 actionable tips.
        4. **Action Plan**: Specifically, should they see a doctor? (Yes/No/Urgent).

        IMPORTANT: If the file is unclear or not medical, politely say so.
        Disclaimer: Start your response with "AI Assessment (Not a Diagnosis):".
      `;

      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: {
          parts: parts
        },
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2, // Low temperature for more factual/consistent medical advice
        }
      });

      setAnalysis(response.text || "No analysis generated.");

      // Calculate usage
      if (response.usageMetadata) {
        const input = response.usageMetadata.promptTokenCount || 0;
        const output = response.usageMetadata.candidatesTokenCount || 0;
        const cost = ((input / 1000000) * COST_PER_1M_INPUT_TOKENS) + ((output / 1000000) * COST_PER_1M_OUTPUT_TOKENS);
        
        setUsageStats({
          inputTokens: input,
          outputTokens: output,
          totalCost: cost
        });
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to generate analysis. Please try again. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2 font-serif flex items-center gap-3">
            <Brain className="h-10 w-10 text-brand-red" />
            AI Health Screening
          </h1>
          <p className="text-lg text-slate-700">
            Upload your lab results or describe your symptoms for an instant AI-powered assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-t-4 border-t-brand-dark shadow-md">
              <CardHeader>
                <CardTitle>Patient Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Symptoms & Medical History
                  </label>
                  <textarea
                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                    placeholder="e.g., I am a 65-year-old male with type 2 diabetes. My calves hurt when I walk more than 2 blocks. I smoke occasionally."
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Lab Results or Photos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-600 font-medium">
                        {selectedFile ? selectedFile.name : "Click to upload file"}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Supports: JPG, PNG, PDF, DOCX, TXT
                      </span>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-4 relative w-full h-40 bg-slate-100 rounded overflow-hidden border border-slate-200 flex items-center justify-center">
                      {selectedFile.type.startsWith('image/') && filePreview ? (
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-500">
                          <FileText className="h-12 w-12 mb-2" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <span className="text-xs uppercase mt-1">{selectedFile.type.split('/')[1] || selectedFile.name.split('.').pop()?.toUpperCase() || 'DOC'}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700 z-10"
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleAnalyze} 
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold bg-brand-red hover:bg-red-800"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Activity className="animate-spin mr-2 h-5 w-5" /> Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" /> Generate Assessment
                    </span>
                  )}
                </Button>

                {/* Token Usage Stats */}
                {usageStats && (
                  <Card className="bg-slate-900 text-slate-300 border-none shadow-lg animate-in slide-in-from-bottom-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-mono uppercase tracking-widest text-brand-red flex items-center justify-between">
                        <span className="flex items-center">
                          <Terminal className="w-4 h-4 mr-2" />
                          API Usage Metrics
                        </span>
                        <span className="text-xs font-normal normal-case tracking-normal text-slate-400">
                          {AI_MODEL}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <div className="text-xs text-slate-500 uppercase mb-1">Input Tokens</div>
                          <div className="text-xl font-mono font-bold text-white">{usageStats.inputTokens.toLocaleString()}</div>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <div className="text-xs text-slate-500 uppercase mb-1">Output Tokens</div>
                          <div className="text-xl font-mono font-bold text-white">{usageStats.outputTokens.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-lg border border-brand-red/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-red/5"></div>
                        <div className="text-xs text-slate-500 uppercase mb-1">Total Cost</div>
                        <div className="text-xl font-mono font-bold text-green-400 relative z-10 break-all text-center">
                          ${usageStats.totalCost.toFixed(6)}
                        </div>
                      </div>
                      <div className="mt-4 text-[10px] text-slate-600 text-center font-mono">
                        Pricing estimated
                      </div>
                    </CardContent>
                  </Card>
                )}

                <p className="text-xs text-slate-500 text-center">
                  By using this tool, you acknowledge that this is an AI simulation and not a substitute for professional medical advice.
                </p>

              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            
            {/* Analysis Result */}
            <Card className={`h-full border-t-4 border-t-brand-red shadow-md transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="flex items-center text-brand-dark">
                  <FileText className="mr-2 h-5 w-5" />
                  AI Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analysis ? (
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-serif font-bold text-brand-dark mb-4 mt-6 first:mt-0" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-serif font-bold text-brand-dark mb-3 mt-5 first:mt-0" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-serif font-bold text-brand-dark mb-2 mt-4 first:mt-0" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-serif font-bold text-brand-dark mb-2 mt-3 first:mt-0" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 text-slate-700 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-700" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal space-y-2 text-slate-700" {...props} />,
                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-brand-dark" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                        a: ({node, ...props}) => <a className="text-brand-red hover:underline" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-brand-red pl-4 my-4 italic text-slate-600" {...props} />,
                        code: ({node, inline, ...props}: any) => 
                          inline ? (
                            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-brand-dark" {...props} />
                          ) : (
                            <code className="block bg-slate-100 p-4 rounded-lg text-sm font-mono text-brand-dark overflow-x-auto mb-4" {...props} />
                          ),
                        pre: ({node, ...props}) => <pre className="mb-4" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-slate-300 rounded-lg" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                        tbody: ({node, ...props}) => <tbody {...props} />,
                        tr: ({node, ...props}) => <tr className="border-b border-slate-200 hover:bg-slate-50" {...props} />,
                        th: ({node, ...props}) => <th className="border border-slate-300 px-4 py-2 text-left font-bold text-brand-dark font-serif" {...props} />,
                        td: ({node, ...props}) => <td className="border border-slate-300 px-4 py-2 text-slate-700" {...props} />,
                        img: ({node, ...props}) => <img className="max-w-full h-auto rounded-lg my-4 shadow-md" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-6 border-slate-300" {...props} />,
                      }}
                    >
                      {analysis}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Activity className="h-16 w-16 mb-4 opacity-20" />
                    <p>Enter your details and click analyze to see results.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AIScreening;