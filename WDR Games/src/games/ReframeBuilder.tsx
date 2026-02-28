import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, ArrowRight, CheckCircle2 } from 'lucide-react';
import GameLayout from '../components/GameLayout';

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

export default function ReframeBuilder({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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
      setShowErrorPopup(false);
    } else {
      setShowErrorPopup(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < SCENARIOS.length - 1) {
      setCurrentIndex(c => c + 1);
      setAnswers({});
      setShowFeedback(false);
      setShowErrorPopup(false);
    } else {
      onComplete(score);
    }
  };

  const isCurrentComplete = scenario.parts
    .filter(p => typeof p === 'object' && p.type === 'blank')
    .every((p: any) => answers[p.id]);

  const instructions = (
    <div className="space-y-4">
      <p>Welcome to the <strong>Reframe Builder</strong>.</p>
      <p>
        Reframing is a core skill in Cognitive Behavioral Therapy. It involves taking a distorted, emotionally charged thought and rewriting it into something balanced, factual, and helpful.
      </p>
      <p><strong>How to play:</strong></p>
      <ul className="list-disc pl-5">
        <li>Read the original distorted thought in the red box.</li>
        <li>Use the dropdown menus to select the best phrases to build a balanced, realistic response.</li>
        <li>Click "Check Reframe" to see if your new perspective holds up.</li>
      </ul>
      <p>If you're unsure which phrase to choose, check the <em>Keys to a Good Reframe</em> reference in the sidebar!</p>
    </div>
  );

  const referenceContent = (
    <div className="space-y-6">
      <h3 className="font-bold text-indigo-900 text-lg">Keys to a Good Reframe</h3>
      <div className="space-y-4 text-sm text-neutral-700">
        <p>A successful cognitive reframe isn't about ignoring the negative or pretending everything is perfect. A good reframe is:</p>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <h4 className="font-bold text-emerald-800 mb-1">1. Factual and Evidence-Based</h4>
          <p>Does it rely on what you actually know, rather than what you fear or assume? (e.g., "They are busy" vs "They hate me")</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <h4 className="font-bold text-emerald-800 mb-1">2. Compassionate</h4>
          <p>Would you say it to a friend in the same situation? (e.g., "Everyone makes mistakes" vs "I am incompetent")</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <h4 className="font-bold text-emerald-800 mb-1">3. Action-Oriented (When Possible)</h4>
          <p>Does it point toward a solution or a way to cope, rather than leaving you helpless? (e.g., "I can learn from this")</p>
        </div>
      </div>
    </div>
  );

  return (
    <GameLayout
      title="Reframe Builder"
      instructions={instructions}
      referenceTitle="How to Reframe"
      referenceContent={referenceContent}
      showErrorPopup={showErrorPopup}
      onCloseErrorPopup={() => setShowErrorPopup(false)}
      errorPopupText={`One or more of your choices doesn't quite fit a balanced perspective. Check the "Keys to a Good Reframe" in the sidebar for a hint!`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-neutral-600">
            Fill in the blanks to transform the distorted thought into a balanced, realistic one.
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
            Scenario {currentIndex + 1} of {SCENARIOS.length}
          </div>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
            {score} XP
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
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
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
      </div>
    </GameLayout>
  );
}
