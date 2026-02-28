import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GripHorizontal, CheckCircle2, ShieldAlert } from 'lucide-react';
import GameLayout from '../components/GameLayout';

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

export default function ThoughtCategorizer({ onComplete }: Props) {
  const [thoughts, setThoughts] = useState(() => [...THOUGHTS].sort(() => Math.random() - 0.5));
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [lastErrorThought, setLastErrorThought] = useState('');

  const handlePlace = (thoughtId: string, categoryId: string) => {
    const thought = thoughts.find(t => t.id === thoughtId);
    if (!thought) return;

    if (thought.category === categoryId) {
      setPlaced(prev => ({ ...prev, [thoughtId]: categoryId }));
      setScore(s => s + 15);
      setShowErrorPopup(false);
    } else {
      setLastErrorThought(thought.text);
      setShowErrorPopup(true);
    }
  };

  const isComplete = Object.keys(placed).length === thoughts.length;

  const instructions = (
    <div className="space-y-4">
      <p>Welcome to the <strong>Thought Categorizer</strong>.</p>
      <p>
        The first step in challenging negative thinking is learning to identify the specific <em>cognitive distortion</em> at play.
        Once you can name the error, it loses some of its power over you.
      </p>
      <p><strong>How to play:</strong></p>
      <ul className="list-disc pl-5">
        <li>Read the distorted thought from the list on the left.</li>
        <li>Drag and drop it into the correct category bowl on the right.</li>
        <li>If you get stuck or make a mistake, check the <em>Distortion Glossary</em> in the sidebar!</li>
      </ul>
    </div>
  );

  const referenceContent = (
    <div className="space-y-6">
      <p className="text-sm">
        Review these common thinking errors. Can you spot them in your own daily thoughts?
      </p>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-rose-800">1. All-or-Nothing Thinking</h4>
          <p className="text-sm">Also called "Black and White Thinking." Viewing situations in only two extreme categories (e.g., perfect or a total failure, always or never) without seeing the gray areas in between.</p>
        </div>
        <div>
          <h4 className="font-bold text-purple-800">2. Catastrophizing</h4>
          <p className="text-sm">Also called "Magnification." Expecting the absolute worst possible outcome to happen, or blowing things way out of proportion. (e.g., "I failed this quiz, so I'll be homeless.")</p>
        </div>
        <div>
          <h4 className="font-bold text-blue-800">3. Mind Reading</h4>
          <p className="text-sm">Assuming you know what someone else is thinking or feeling, usually negative, without having any actual evidence to support your guess. (e.g., "He looked away, he must think I'm boring.")</p>
        </div>
      </div>
    </div>
  );

  return (
    <GameLayout
      title="Categorize the Distortion"
      instructions={instructions}
      referenceTitle="Distortion Glossary"
      referenceContent={referenceContent}
      showErrorPopup={showErrorPopup}
      onCloseErrorPopup={() => setShowErrorPopup(false)}
      errorPopupText={`"${lastErrorThought}" isn't quite that type of distortion. Check the Glossary in the sidebar for definitions!`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Drag and drop each distorted thought into the correct category.
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
            {Object.keys(placed).length} of {thoughts.length} Placed
          </div>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {score} XP
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
                  className={`p-4 rounded-3xl border-2 border-dashed transition-colors ${categoryThoughts.length > 0 ? category.color.replace('bg-', 'bg-opacity-10 bg-') : 'border-neutral-200 bg-white'
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
            className="mt-12 p-8 bg-indigo-50 rounded-3xl text-center border border-indigo-100"
          >
            <h3 className="text-2xl font-bold text-indigo-900 mb-2">Great Job!</h3>
            <p className="text-indigo-700 mb-6">You successfully categorized all the distorted thoughts.</p>
            <button
              onClick={() => onComplete(score)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
            >
              Claim XP & Finish
            </button>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
}
