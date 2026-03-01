import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GripHorizontal, CheckCircle2, ShieldAlert, BookOpen, Play, Activity } from 'lucide-react';
import ReferenceSidebar from '../components/ReferenceSidebar';
import HintPopup from '../components/HintPopup';
import { CognitiveDistortionsReference } from '../content/references';

const CATEGORIES = [
  { id: 'all-or-nothing', name: 'All-or-Nothing', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'catastrophizing', name: 'Catastrophizing', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'mind-reading', name: 'Mind Reading', color: 'bg-blue-100 text-blue-800 border-blue-200' },
];

const THOUGHTS = [
  { id: 't1', text: 'If I don\'t get an A, I\'m a total failure.', category: 'all-or-nothing' },
  { id: 't2', text: 'My chest hurts, I must be having a heart attack.', category: 'catastrophizing' },
  { id: 't3', text: 'She didn\'t say hi, she must hate me.', category: 'mind-reading' },
  { id: 't4', text: 'I ruined my diet with one cookie, might as well eat the box.', category: 'all-or-nothing' },
  { id: 't5', text: 'If I fail this test, I\'ll never get a job and be homeless.', category: 'catastrophizing' },
  { id: 't6', text: 'They are whispering, they must be talking about me.', category: 'mind-reading' },
];

interface Props {
  onComplete: (xp: number) => void;
}

type GameState = 'intro' | 'playing';

export default function ThoughtCategorizer({ onComplete }: Props) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [thoughts, setThoughts] = useState(() => [...THOUGHTS].sort(() => Math.random() - 0.5));
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  
  const [showReference, setShowReference] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handlePlace = (thoughtId: string, categoryId: string) => {
    const thought = thoughts.find(t => t.id === thoughtId);
    if (!thought) return;

    if (thought.category === categoryId) {
      setPlaced(prev => ({ ...prev, [thoughtId]: categoryId }));
      setScore(s => s + 15);
      setShowHint(false);
    } else {
      setShowHint(true);
    }
  };

  const isComplete = Object.keys(placed).length === thoughts.length;

  if (gameState === 'intro') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center border-b border-neutral-100">
          <Activity className="w-16 h-16 mx-auto text-blue-600 mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Thought Categorizer</h2>
          <p className="text-neutral-600 text-lg max-w-xl mx-auto">
            Goal: Practice sorting distorted thoughts into their correct categories. Review the reference guide below to understand the different types of distortions before you begin.
          </p>
        </div>
        
        <div className="p-8 md:p-12 bg-neutral-50">
          <div className="flex items-center gap-2 mb-6 text-blue-900">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-xl font-bold">Reference Guide</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-8">
            {CognitiveDistortionsReference}
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setGameState('playing')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Game
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-neutral-900 mb-4">Categorize the Distortion</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Drag and drop each distorted thought into the correct category.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          {Object.keys(placed).length} of {thoughts.length} Placed
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowReference(true)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Reference Guide
          </button>
          <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            {score} XP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Unplaced Thoughts */}
        <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-neutral-500" />
            Thoughts
          </h3>
          <div className="flex flex-col gap-3">
            {thoughts.filter(t => !placed[t.id]).map(thought => (
              <motion.div
                key={thought.id}
                layoutId={thought.id}
                draggable
                onDragStart={(e: any) => e.dataTransfer.setData('text/plain', thought.id)}
                className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 cursor-grab active:cursor-grabbing flex items-start gap-3 hover:border-neutral-300 transition-colors"
              >
                <GripHorizontal className="w-4 h-4 text-neutral-400 mt-1 shrink-0" />
                <span className="text-sm font-medium text-neutral-700">{thought.text}</span>
              </motion.div>
            ))}
            {Object.keys(placed).length === thoughts.length && (
              <div className="text-center py-8 text-neutral-500 italic">
                All thoughts categorized!
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map(category => {
            const categoryThoughts = thoughts.filter(t => placed[t.id] === category.id);
            
            return (
              <div
                key={category.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const thoughtId = e.dataTransfer.getData('text/plain');
                  handlePlace(thoughtId, category.id);
                }}
                className={`p-4 rounded-3xl border-2 border-dashed transition-colors ${
                  categoryThoughts.length > 0 ? category.color.replace('bg-', 'bg-opacity-10 bg-') : 'border-neutral-200 bg-white'
                }`}
              >
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${category.color.split(' ')[1]}`}>
                  {category.name}
                </h4>
                <div className="flex flex-col gap-2 min-h-[150px]">
                  {categoryThoughts.map(thought => (
                    <motion.div
                      key={thought.id}
                      layoutId={thought.id}
                      className={`p-3 rounded-lg text-sm font-medium flex items-start justify-between gap-2 ${category.color}`}
                    >
                      <span>{thought.text}</span>
                      <CheckCircle2 className="w-4 h-4 opacity-50 shrink-0 mt-0.5" />
                    </motion.div>
                  ))}
                  {categoryThoughts.length === 0 && (
                    <div className="h-full flex items-center justify-center text-sm text-neutral-400 italic text-center p-4">
                      Drop {category.name} thoughts here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-8 bg-blue-50 rounded-3xl text-center border border-blue-100"
        >
          <h3 className="text-2xl font-bold text-blue-900 mb-2">Great Job!</h3>
          <p className="text-blue-700 mb-6">You successfully categorized all the distorted thoughts.</p>
          <button 
            onClick={() => onComplete(score)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            Claim XP & Finish
          </button>
        </motion.div>
      )}

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
        message="That thought doesn't belong in that category. Check the reference guide for a refresher!"
      />
    </div>
  );
}
