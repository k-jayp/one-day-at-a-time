import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, ArrowRight, Loader2, Sparkles, ShieldCheck, AlertCircle, BookOpen } from 'lucide-react';
import ReferenceSidebar from '../components/ReferenceSidebar';
import { CognitiveDistortionsReference } from '../content/references';

const WORKER_URL = 'https://recovery-chat.kidell-powellj.workers.dev';

interface DistortionAnalysis {
  name: string;
  explanation: string;
  reframeQuestion: string;
}

interface Props {
  onComplete: (xp: number) => void;
}

type Step = 'input' | 'analyzing' | 'reveal' | 'reframe' | 'complete';

export default function AIReframeStudio({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('input');
  const [thought, setThought] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [analysis, setAnalysis] = useState<DistortionAnalysis[]>([]);
  const [userReframe, setUserReframe] = useState('');
  const [newIntensity, setNewIntensity] = useState(5);
  const [error, setError] = useState<string | null>(null);
  
  const [showReference, setShowReference] = useState(false);

  const analyzeThought = async () => {
    if (!thought.trim()) return;
    
    setStep('analyzing');
    setError(null);

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze-thought',
          thought,
          distressLevel: intensity,
        }),
      });

      const data = await response.json();
      let text = data.content?.[0]?.text || '';
      // Strip markdown fences Claude may wrap around JSON
      text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(text);

      if (parsed.distortions && parsed.distortions.length > 0) {
        // Map worker response fields to component's expected shape
        setAnalysis(parsed.distortions.map((d: any) => ({
          name: d.name,
          explanation: d.explanation,
          reframeQuestion: Array.isArray(d.reframingQuestions) ? d.reframingQuestions[0] : d.reframeQuestion || '',
        })));
        setStep('reveal');
      } else {
        throw new Error("No distortions identified.");
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError("We had trouble analyzing that thought. Please try rewording it slightly.");
      setStep('input');
    }
  };

  const finishSession = () => {
    // Calculate XP: Base 30 + 10 per distortion + bonus for reducing intensity
    let earnedXp = 30 + (analysis.length * 10);
    const intensityDrop = intensity - newIntensity;
    if (intensityDrop > 0) {
      earnedXp += (intensityDrop * 5); // 5 XP per point of intensity dropped
    }
    
    onComplete(earnedXp);
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      <div className="absolute top-0 right-0 z-10">
        <button 
          onClick={() => setShowReference(true)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          Reference Guide
        </button>
      </div>

      <div className="text-center mb-12 pt-4">
        <h2 className="text-3xl font-serif text-neutral-900 mb-4 flex items-center justify-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-600" />
          AI Reframe Studio
        </h2>
        <p className="text-neutral-600">
          Share what's on your mind. Our AI will help you identify cognitive distortions and guide you toward a balanced perspective.
        </p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-neutral-200"
            >
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                What's on your mind?
              </label>
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="e.g., I messed up the presentation today. My boss definitely thinks I'm incompetent and I'm probably going to get fired."
                className="w-full h-40 p-6 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-lg mb-8 transition-all"
              />

              <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                How intense is this feeling? ({intensity}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-12"
              />

              <div className="flex justify-end">
                <button
                  onClick={analyzeThought}
                  disabled={!thought.trim()}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze My Thought
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ANALYZING */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-16 rounded-[2rem] shadow-sm border border-neutral-200 text-center"
            >
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-serif text-neutral-900 mb-2">Analyzing your thought...</h3>
              <p className="text-neutral-500">Looking for cognitive distortions and unhelpful patterns.</p>
            </motion.div>
          )}

          {/* STEP 3: REVEAL */}
          {step === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Your Original Thought</div>
                <p className="text-xl font-serif text-neutral-800 italic border-l-4 border-indigo-200 pl-4 py-2">"{thought}"</p>
              </div>

              <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6" />
                  Identified Distortions
                </h3>
                
                <div className="space-y-6">
                  {analysis.map((dist, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50">
                      <h4 className="font-bold text-lg text-indigo-700 mb-2">{dist.name}</h4>
                      <p className="text-neutral-700 mb-4 leading-relaxed">{dist.explanation}</p>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-sm font-medium text-indigo-900 italic">"{dist.reframeQuestion}"</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep('reframe')}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Reframe This Thought
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REFRAME */}
          {step === 'reframe' && (
            <motion.div
              key="reframe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-neutral-200"
            >
              <div className="mb-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Original Thought</div>
                <p className="text-lg font-serif text-neutral-600 line-through decoration-neutral-300">"{thought}"</p>
              </div>

              <label className="block text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4">
                Write a new, balanced thought
              </label>
              <p className="text-sm text-neutral-500 mb-4">
                Use the insights from the previous step to write a more realistic, compassionate version of your thought.
              </p>
              <textarea
                value={userReframe}
                onChange={(e) => setUserReframe(e.target.value)}
                placeholder="e.g., I made a mistake, but everyone makes mistakes. It doesn't mean I'm incompetent, it just means I need to double-check my work next time."
                className="w-full h-40 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-lg mb-8 transition-all"
              />

              <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                How intense is the feeling now? ({newIntensity}/10)
              </label>
              <p className="text-sm text-neutral-500 mb-4">
                Original intensity was {intensity}/10.
              </p>
              <input
                type="range"
                min="1"
                max="10"
                value={newIntensity}
                onChange={(e) => setNewIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-12"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => setStep('complete')}
                  disabled={!userReframe.trim()}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Finalize Reframe
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: COMPLETE */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[2rem] shadow-sm border border-neutral-200 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Excellent Work!</h2>
              <p className="text-neutral-600 mb-8 text-lg">
                You successfully identified cognitive distortions and reframed your thought. 
                {intensity > newIntensity && ` You also reduced your distress by ${intensity - newIntensity} points!`}
              </p>

              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 mb-8 text-left">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Your New Perspective</div>
                <p className="text-xl font-serif text-emerald-800 italic">"{userReframe}"</p>
              </div>
              
              <button 
                onClick={finishSession}
                className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors"
              >
                Claim XP & Return
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ReferenceSidebar 
        isOpen={showReference} 
        onClose={() => setShowReference(false)} 
        title="Cognitive Distortions"
        content={CognitiveDistortionsReference}
      />
    </div>
  );
}
