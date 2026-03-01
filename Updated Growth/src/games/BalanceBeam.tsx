import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, ArrowRight, CheckCircle2, BookOpen, Play, RefreshCw, Layers } from 'lucide-react';
import ReferenceSidebar from '../components/ReferenceSidebar';
import HintPopup from '../components/HintPopup';
import { CognitiveDistortionsReference } from '../content/references';

const SCENARIOS = [
  {
    id: 'r1',
    distorted: "I made a mistake on the presentation. I'm completely incompetent.",
    distortion: "All-or-Nothing Thinking",
    parts: [
      "I made a mistake on the presentation, but ",
      { type: 'blank', id: 'b1', options: ["I am completely incompetent", "everyone makes mistakes", "I should quit my job"], correct: "everyone makes mistakes" },
      ". I can ",
      { type: 'blank', id: 'b2', options: ["never show my face again", "learn from this and improve", "blame someone else"], correct: "learn from this and improve" },
      "."
    ]
  },
  {
    id: 'r2',
    distorted: "They haven't replied to my text. They must be mad at me.",
    distortion: "Mind Reading",
    parts: [
      "They haven't replied yet, which could mean ",
      { type: 'blank', id: 'b1', options: ["they hate me", "they are busy right now", "they are ignoring me on purpose"], correct: "they are busy right now" },
      ". I don't have evidence that ",
      { type: 'blank', id: 'b2', options: ["they are mad at me", "they will never speak to me again", "they are talking about me"], correct: "they are mad at me" },
      "."
    ]
  }
];

interface Props {
  onComplete: (xp: number) => void;
}

type GameState = 'intro' | 'playing' | 'complete';

export default function ReframeBuilder({ onComplete }: Props) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const [showReference, setShowReference] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const scenario = SCENARIOS[currentIndex];

  const handleSelect = (blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = () => {
    let allCorrect = true;
    let earned = 0;
    
    scenario.parts.forEach(part => {
      if (typeof part === 'object' && part.type === 'blank') {
        if (answers[part.id] === part.correct) {
          earned += 20;
        } else {
          allCorrect = false;
        }
      }
    });

    if (allCorrect) {
      setScore(s => s + earned);
      setShowFeedback(true);
      setShowHint(false);
    } else {
      setShowHint(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < SCENARIOS.length - 1) {
      setCurrentIndex(c => c + 1);
      setAnswers({});
      setShowFeedback(false);
      setShowHint(false);
    } else {
      setGameState('complete');
    }
  };

  const finishGame = () => {
    onComplete(score);
  };

  const isCurrentComplete = scenario.parts
    .filter(p => typeof p === 'object' && p.type === 'blank')
    .every((p: any) => answers[p.id]);

  if (gameState === 'intro') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center border-b border-neutral-100">
          <Layers className="w-16 h-16 mx-auto text-indigo-600 mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Reframe Builder</h2>
          <p className="text-neutral-600 text-lg max-w-xl mx-auto">
            Goal: Practice transforming distorted thoughts into balanced, realistic ones. Review the reference guide below, then start the game to fill in the blanks.
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-12 bg-white rounded-[2rem] shadow-sm border border-neutral-200 text-center"
      >
        <Layers className="w-16 h-16 mx-auto text-indigo-500 mb-6" />
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">Reframing Mastered!</h2>
        <p className="text-neutral-600 mb-8 text-lg">You scored {score} XP in Reframe Builder.</p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => {
              setGameState('intro');
              setCurrentIndex(0);
              setScore(0);
              setAnswers({});
              setShowFeedback(false);
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-100 text-neutral-700 rounded-full font-medium hover:bg-neutral-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </button>
          <button 
            onClick={finishGame}
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
          >
            Claim XP & Finish
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto relative">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-neutral-900 mb-4">Reframe Builder</h2>
        <p className="text-neutral-600">
          Fill in the blanks to transform the distorted thought into a balanced, realistic one.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Scenario {currentIndex + 1} of {SCENARIOS.length}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowReference(true)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Reference Guide
          </button>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
            {score} XP
          </div>
        </div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-neutral-200"
      >
        <div className="mb-8 p-6 bg-rose-50 rounded-2xl border border-rose-100">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">Original Thought ({scenario.distortion})</div>
          <p className="text-xl font-serif text-rose-900">"{scenario.distorted}"</p>
        </div>

        <div className="mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">Balanced Reframe</div>
          <div className="text-lg md:text-xl leading-loose text-neutral-800 flex flex-wrap items-center gap-y-4">
            {scenario.parts.map((part, i) => {
              if (typeof part === 'string') {
                return <span key={i} className="mr-1">{part}</span>;
              }

              const isAnswered = !!answers[part.id];
              const isCorrect = showFeedback && answers[part.id] === part.correct;
              const isWrong = showFeedback && answers[part.id] !== part.correct;

              return (
                <div key={part.id} className="relative inline-block mx-1">
                  <select
                    value={answers[part.id] || ''}
                    onChange={(e) => handleSelect(part.id, e.target.value)}
                    disabled={showFeedback}
                    className={`appearance-none bg-neutral-100 border-b-2 px-4 py-1 pr-8 rounded-t-md font-medium outline-none transition-colors cursor-pointer
                      ${!isAnswered ? 'border-neutral-300 text-neutral-500' : 'border-indigo-500 text-indigo-700'}
                      ${isCorrect ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''}
                      ${isWrong ? 'border-rose-500 text-rose-700 bg-rose-50' : ''}
                    `}
                  >
                    <option value="" disabled>Select...</option>
                    {part.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          {!showFeedback ? (
            <button
              onClick={checkAnswers}
              disabled={!isCurrentComplete}
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PenTool className="w-5 h-5" />
              Check Reframe
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors"
            >
              {currentIndex < SCENARIOS.length - 1 ? 'Next Scenario' : 'Finish Exercise'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
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
        message="One or more of your selections isn't quite right. Try again!"
      />
    </div>
  );
}
