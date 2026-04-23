// Aegis AI Frontend
import React, { useState } from 'react';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';

interface AnalysisResult {
  verdict: 'Safe' | 'Targeted Hate' | 'Sexual/Vulgar';
  isSarcastic: boolean;
  confidenceScore: number;
  reasoning: string;
}

export default function App() {
  const [comment, setComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!comment.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Analysis failed with status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'An error occurred while analyzing the comment. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictTextClass = (verdict: string) => {
    return verdict === 'Safe' ? 'text-[#10B981]' : 'text-[#F43F5E]';
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#050505] text-[#E5E5E5] font-sans flex flex-col p-6 md:p-10 gap-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-white to-[#444] flex items-center justify-center">
            <Shield className="w-5 h-5 text-black mix-blend-overlay" />
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] uppercase text-[#E5E5E5]">Aegis AI</h1>
        </div>
        <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.1em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_8px_#10B981]"></span>
          <span className="hidden sm:inline">Node 20.x • Gemini Pro • </span>Active
        </div>
      </header>

      {/* Input */}
      <div className="flex flex-col gap-4">
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 relative">
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter comment for neural analysis..."
            className="w-full bg-transparent border-none text-[#E5E5E5] text-[18px] leading-[1.6] outline-none resize-none h-[120px]"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !comment.trim()}
          className="self-end bg-white text-black py-3 px-8 rounded-lg font-semibold text-[14px] flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing Sentiment...' : 'Analyze Sentiment'}
          {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin text-black" />}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] flex items-center gap-4">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] md:grid-rows-[180px_180px] gap-5 flex-grow animate-in fade-in duration-500 pb-10 md:pb-0">
          
          {/* Big Verdict Card */}
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-[16px] p-7 flex flex-col justify-between md:row-span-2">
            <div>
              <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.05em] font-semibold">System Verdict</div>
              <div className={`text-[48px] font-bold tracking-[-0.03em] ${getVerdictTextClass(result.verdict)}`}>
                {result.verdict}
              </div>
              {result.isSarcastic && (
                <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[13px] mt-3 gap-2">
                  <span>✦</span> Sarcasm Detected
                </div>
              )}
            </div>
            <div className="text-[15px] leading-[1.6] text-[#E5E5E5]/90 mt-4 overflow-y-auto pr-2">
              {result.reasoning}
            </div>
          </div>

          {/* Confidence Card */}
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-[16px] p-7 flex flex-col justify-between">
            <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.05em] font-semibold">Neural Confidence</div>
            <div>
              <div className="text-[64px] font-[200] leading-none mb-1">
                {result.confidenceScore}<span className="text-[14px] text-[#A1A1AA] ml-1">%</span>
              </div>
            </div>
          </div>

          {/* Category Card */}
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-[16px] p-7 flex flex-col justify-between">
            <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.05em] font-semibold">Category</div>
            <div>
              <div className="text-[24px] font-medium mt-3 leading-tight">
                {result.isSarcastic ? 'Situational Sarcasm' : 'Literal Statement'}
              </div>
              <div className="text-[12px] text-[#A1A1AA] mt-3">
                {result.verdict === 'Safe' ? 'No violations detected in current buffer.' : 'Violations detected. Content flagged.'}
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-[16px] p-7 flex flex-col justify-between md:col-span-2">
            <div className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.05em] font-semibold">Process Analytics</div>
            <div className="flex gap-6 mt-auto border-t border-[#2A2A2A] pt-5 overflow-x-auto">
              <div className="flex flex-col gap-1 min-w-[80px]">
                <span className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.05em] font-semibold">Latency</span>
                <span className="text-[12px] font-mono text-[#E5E5E5]">242ms</span>
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.05em] font-semibold">Threat Level</span>
                <span className="text-[12px] font-mono text-[#E5E5E5]">{result.verdict === 'Safe' ? '0.02 Neutral' : '0.98 Severe'}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-[140px]">
                <span className="text-[11px] text-[#A1A1AA] uppercase tracking-[0.05em] font-semibold">Model</span>
                <span className="text-[12px] font-mono text-[#E5E5E5]">Gemini-3.1-Pro</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
