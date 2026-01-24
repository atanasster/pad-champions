import React, { useState } from 'react';

import {
  Upload,
  Brain,
  FileText,
  Activity,
  AlertTriangle,
  Terminal,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Pricing estimates per 1M tokens
const MODEL_CONFIG: Record<
  string,
  { label: string; inputCost: number; outputCost: number; description: string }
> = {
  'gemini-2.5-flash': {
    label: 'Gemini 2.5 Flash',
    inputCost: 0.1,
    outputCost: 0.4,
    description: 'Fast, cost-effective model for standard screenings.',
  },
  'gemini-3-pro-preview': {
    label: 'Gemini 3.0 Pro (Preview)',
    inputCost: 2.0,
    outputCost: 8.0,
    description: 'Advanced reasoning for complex medical histories.',
  },
};

const AIScreening: React.FC = () => {
  const [medicalHistory, setMedicalHistory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [usageStats, setUsageStats] = useState<{
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset error state on new interaction
    setError(null);
    setAnalysis('');

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 1. Validate File Size (Max 20MB)
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB
      if (file.size > MAX_SIZE) {
        setError('File is too large. Please upload a file smaller than 20MB.');
        setSelectedFile(null);
        setFilePreview(null);
        e.target.value = ''; // Reset input
        return;
      }

      // 2. Validate File Extension
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'txt', 'docx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setError('Unsupported file type. Please upload JPG, PNG, PDF, DOCX, or TXT.');
        setSelectedFile(null);
        setFilePreview(null);
        e.target.value = ''; // Reset input
        return;
      }

      // File is valid
      setSelectedFile(file);

      // Create preview if it's an image
      if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(fileExtension)) {
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
    if (ext === 'docx')
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
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
      setError('Please provide medical history or upload a file.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis('');
    setUsageStats(null);

    // const currentModelConfig = MODEL_CONFIG[selectedModel];
    
    // Clear previous analysis
    setAnalysis('');

    try {
      // Determine URL based on environment
      // In production, you might need to update this URL to your deployed function URL
      const FUNCTION_URL = import.meta.env.DEV
        ? 'http://localhost:5001/pad-champions/us-central1/analyzePatientData'
        : 'https://us-central1-pad-champions.cloudfunctions.net/analyzePatientData';

      // Convert file to base64 if needed
      let fileData = null;
      let mimeType = null;

      if (selectedFile) {
        const filePart = await fileToGenerativePart(selectedFile);
        fileData = filePart.inlineData.data;
        mimeType = filePart.inlineData.mimeType;
      }

      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            medicalHistory,
            file: fileData,
            mimeType,
            model: selectedModel,
          },
        }),
      });

      if (!response.body) {
        throw new Error('Response body is unavailable');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        setAnalysis((prev) => prev + chunkValue);
      }
      
      // We don't have usage stats in streaming mode easily unless we send it as a final chunk or header
      // For now, we'll skip setting precise usage stats or estimate them
      
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError('Failed to generate analysis. Please try again. ' + errorMessage);
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
                {/* Model Selection */}
                <div>
                  <Label className="block text-slate-700 mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Zap className="w-4 h-4 mr-1 text-slate-500" /> AI Model
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      Pricing varies by model
                    </span>
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="font-medium text-brand-dark border-slate-300">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODEL_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label} (${config.inputCost.toFixed(2)}/1M in, $
                          {config.outputCost.toFixed(2)}/1M out)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    {MODEL_CONFIG[selectedModel].description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <Label htmlFor="medical-history" className="block text-slate-700 mb-2">
                    Symptoms & Medical History
                  </Label>
                  <Textarea
                    id="medical-history"
                    className="min-h-[150px] focus-visible:ring-brand-red"
                    placeholder="e.g., I am a 65-year-old male with type 2 diabetes. My calves hurt when I walk more than 2 blocks. I smoke occasionally."
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="file-upload" className="block text-slate-700 mb-2">
                    Upload Lab Results or Photos (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-600 font-medium">
                        {selectedFile ? 'Change file' : 'Click to upload file'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        JPG, PNG, PDF, DOCX, TXT (Max 20MB)
                      </span>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-4 relative w-full h-40 bg-slate-100 rounded overflow-hidden border border-slate-200 flex items-center justify-center">
                      <Badge
                        variant="outline"
                        className="absolute top-2 left-2 bg-green-100 text-green-700 border-green-200 shadow-xs z-10"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Ready for Analysis
                      </Badge>

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
                          <span className="text-xs uppercase mt-1">
                            {selectedFile.type.split('/')[1] ||
                              selectedFile.name.split('.').pop()?.toUpperCase() ||
                              'DOC'}
                          </span>
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                          setError(null);
                        }}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full p-0 shadow-xs z-10"
                        title="Remove file"
                        variant="destructive"
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-100">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
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
                          {MODEL_CONFIG[selectedModel].label}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <div className="text-xs text-slate-500 uppercase mb-1">Input Tokens</div>
                          <div className="text-xl font-mono font-bold text-white">
                            {usageStats.inputTokens.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <div className="text-xs text-slate-500 uppercase mb-1">Output Tokens</div>
                          <div className="text-xl font-mono font-bold text-white">
                            {usageStats.outputTokens.toLocaleString()}
                          </div>
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
                        Estimated based on {selectedModel} pricing
                      </div>
                    </CardContent>
                  </Card>
                )}

                <p className="text-xs text-slate-500 text-center">
                  By using this tool, you acknowledge that this is an AI simulation and not a
                  substitute for professional medical advice.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Analysis Result */}
            <Card
              className={`h-full border-t-4 border-t-brand-red shadow-md transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}
            >
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
                        h1: ({ ...props }) => (
                          <h1
                            className="text-2xl font-serif font-bold text-brand-dark mb-4 mt-6 first:mt-0"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-xl font-serif font-bold text-brand-dark mb-3 mt-5 first:mt-0"
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3
                            className="text-lg font-serif font-bold text-brand-dark mb-2 mt-4 first:mt-0"
                            {...props}
                          />
                        ),
                        h4: ({ ...props }) => (
                          <h4
                            className="text-base font-serif font-bold text-brand-dark mb-2 mt-3 first:mt-0"
                            {...props}
                          />
                        ),
                        p: ({ ...props }) => (
                          <p className="mb-3 text-slate-700 leading-relaxed" {...props} />
                        ),
                        ul: ({ ...props }) => (
                          <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-700" {...props} />
                        ),
                        ol: ({ ...props }) => (
                          <ol
                            className="mb-4 ml-6 list-decimal space-y-2 text-slate-700"
                            {...props}
                          />
                        ),
                        li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                        strong: ({ ...props }) => (
                          <strong className="font-bold text-brand-dark" {...props} />
                        ),
                        em: ({ ...props }) => <em className="italic" {...props} />,
                        a: ({ ...props }) => (
                          <a className="text-brand-red hover:underline" {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote
                            className="border-l-4 border-brand-red pl-4 my-4 italic text-slate-600"
                            {...props}
                          />
                        ),
                        code: ({
                          inline,
                          ...props
                        }: {
                          inline?: boolean;
                          className?: string;
                          children?: React.ReactNode;
                        }) =>
                          inline ? (
                            <code
                              className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-brand-dark"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-slate-100 p-4 rounded-lg text-sm font-mono text-brand-dark overflow-x-auto mb-4"
                              {...props}
                            />
                          ),
                        pre: ({ ...props }) => <pre className="mb-4" {...props} />,
                        table: ({ ...props }) => (
                          <div className="overflow-x-auto my-4">
                            <table
                              className="min-w-full border-collapse border border-slate-300 rounded-lg"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ ...props }) => <thead className="bg-slate-100" {...props} />,
                        tbody: ({ ...props }) => <tbody {...props} />,
                        tr: ({ ...props }) => (
                          <tr className="border-b border-slate-200 hover:bg-slate-50" {...props} />
                        ),
                        th: ({ ...props }) => (
                          <th
                            className="border border-slate-300 px-4 py-2 text-left font-bold text-brand-dark font-serif"
                            {...props}
                          />
                        ),
                        td: ({ ...props }) => (
                          <td
                            className="border border-slate-300 px-4 py-2 text-slate-700"
                            {...props}
                          />
                        ),
                        img: ({ ...props }) => (
                          <img className="max-w-full h-auto rounded-lg my-4 shadow-md" {...props} />
                        ),
                        hr: ({ ...props }) => <hr className="my-6 border-slate-300" {...props} />,
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
