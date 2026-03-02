import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, RefreshCw, BookOpen, Play } from 'lucide-react';
import ReferenceSidebar from '../components/ReferenceSidebar';
import HintPopup from '../components/HintPopup';
import { CognitiveDistortionsReference } from '../content/references';

const DISTORTIONS = [
  { id: 'all-or-nothing', name: 'All-or-Nothing Thinking', description: 'Thinking in absolutes such as "always", "never", or "every".' },
  { id: 'catastrophizing', name: 'Catastrophizing', description: 'Seeing only the worst possible outcomes of a situation.' },
  { id: 'shoulds', name: '"Should" Statements', description: 'The belief that things should be a certain way.' },
  { id: 'personalization', name: 'Personalization', description: 'The belief that you are responsible for events outside of your control.' },
  { id: 'mind-reading', name: 'Mind Reading', description: 'Interpreting the thoughts and beliefs of others without adequate evidence.' },
  { id: 'emotional-reasoning', name: 'Emotional Reasoning', description: 'The assumption that emotions reflect the way things really are.' },
  { id: 'overgeneralization', name: 'Overgeneralization', description: 'Making broad interpretations from a single or few events.' }
];

const SCENARIOS = [
  { thought: "I ate a piece of cake, my whole diet is ruined. I might as well eat the whole thing.", correct: 'all-or-nothing' },
  { thought: "My boss didn't say hi to me this morning. I'm definitely getting fired.", correct: 'catastrophizing' },
  { thought: "I should always be happy and positive. It's wrong to feel sad.", correct: 'shoulds' },
  { thought: "My friend canceled our plans. It must be because I'm boring to hang out with.", correct: 'personalization' },
  { thought: "She looked at her watch while I was talking. She thinks I'm annoying.", correct: 'mind-reading' },
  { thought: "I feel like a failure, so I must be one.", correct: 'emotional-reasoning' },
  { thought: "I failed this math test. I'm terrible at all subjects and will never succeed.", correct: 'overgeneralization' },
  { thought: "If I don't get this job, my life is completely over.", correct: 'catastrophizing' },
  { thought: "I must never make mistakes at work.", correct: 'shoulds' },
  { thought: "He hasn't texted back in an hour. He must be angry with me.", correct: 'mind-reading' }
];

type GameState = 'intro' | 'playing' | 'complete';

export default function CognitiveDistortionsGame({ onComplete }: { onComplete?: (xp: number) => void }) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [showReference, setShowReference] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Shuffle scenarios on mount
  const [gameScenarios] = useState(() => [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 5));

  const handleSelect = (id: string) => {
    if (selected) return;
    setSelected(id);
    const correct = id === gameScenarios[currentIndex].correct;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 20);
      setShowHint(false);
    } else {
      setShowHint(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < gameScenarios.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      setGameState('complete');
    }
  };

  const finishGame = () => {
    if (onComplete) onComplete(score);
    resetGame();
  };

  const resetGame = () => {
    setGameState('intro');
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setShowHint(false);
  };

  if (gameState === 'intro') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center border-b border-neutral-100">
          <BrainCircuit className="w-16 h-16 mx-auto text-indigo-600 mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Identify Distortions</h2>
          <p className="text-neutral-600 text-lg max-w-xl mx-auto">
            Goal: Learn to identify common thinking errors. Read the reference guide below to familiarize yourself with the distortions, then start the game to test your knowledge.
          </p>
        </div>
        
        <div className="p-8 md:p-12 bg-neutral-50">
          <div className="flex items-center gap-2 mb-6 text-indigo-900">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-xl font-bold">Reference Guide</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-8">
            {CognitiveDistortionsReference}
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setGameState('playing')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Game
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'complete') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-sm border border-neutral-200 text-center"
      >
        <BrainCircuit className="w-16 h-16 mx-auto text-indigo-500 mb-6" />
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">Session Complete!</h2>
        <p className="text-neutral-600 mb-8 text-lg">You scored {score} XP in Cognitive Reframing.</p>
        
        <div className="w-full bg-neutral-100 rounded-full h-4 mb-8 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            className="bg-indigo-500 h-full rounded-full"
          />
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={resetGame}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-full font-medium hover:bg-neutral-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </button>
          <button 
            onClick={finishGame}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
          >
            Claim XP & Finish
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  const currentScenario = gameScenarios[currentIndex];

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Thought {currentIndex + 1} of {gameScenarios.length}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowReference(true)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Reference Guide
          </button>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            {score} XP
          </div>
        </div>
      </div>

      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 mb-8"
      >
        <h3 className="text-2xl font-serif text-neutral-900 mb-2">Identify the Distortion</h3>
        <p className="text-xl text-neutral-700 italic border-l-4 border-indigo-200 pl-4 py-2 my-6">
          "{currentScenario.thought}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
          {DISTORTIONS.map((distortion) => {
            const isSelected = selected === distortion.id;
            const isActuallyCorrect = currentScenario.correct === distortion.id;
            
            let btnClass = "text-left p-4 rounded-xl border-2 transition-all duration-200 ";
            
            if (!selected) {
              btnClass += "border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50";
            } else if (isSelected && isCorrect) {
              btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
            } else if (isSelected && !isCorrect) {
              btnClass += "border-rose-500 bg-rose-50 text-rose-900";
            } else if (isActuallyCorrect) {
              btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900 opacity-50";
            } else {
              btnClass += "border-neutral-200 opacity-50";
            }

            return (
              <button
                key={distortion.id}
                onClick={() => handleSelect(distortion.id)}
                disabled={selected !== null}
                className={btnClass}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{distortion.name}</span>
                  {isSelected && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                </div>
                <p className="text-sm opacity-80">{distortion.description}</p>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 flex justify-end"
            >
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
              >
                Next Thought
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ReferenceSidebar 
        isOpen={showReference} 
        onClose={() => setShowReference(false)} 
        title="Cognitive Distortions"
        content={CognitiveDistortionsReference}
      />

      <HintPopup 
        isOpen={showHint} 
        onClose={() => setShowHint(false)} 
        onOpenReference={() => setShowReference(true)}
        message="That distortion doesn't quite match this thought. Review the guide for hints!"
      />
    </div>
  );
}
