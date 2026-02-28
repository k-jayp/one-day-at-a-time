import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import GameLayout from '../components/GameLayout';

const BELIEFS = [
  { id: 'b1', text: "I should get my way", type: 'frustration', reframe: "I prefer to get my way, but I can tolerate it when I don't." },
  { id: 'b2', text: "This thing ought to work", type: 'frustration', reframe: "It's annoying when things break, but machines aren't perfect." },
  { id: 'b3', text: "I shouldn't be frustrated", type: 'frustration', reframe: "Frustration is a normal human emotion. I can feel it and still cope." },
  { id: 'b4', text: "My time is important", type: 'frustration', reframe: "My time is valuable, but delays are an inevitable part of life." },
  { id: 'b5', text: "People should always be courteous to me", type: 'frustration', reframe: "I'd like people to be polite, but I can't control their behavior." },
  { id: 'b6', text: "I can't stand wasting time like this", type: 'frustration', reframe: "I don't like waiting, but I can definitely stand it." },
  { id: 'b7', text: "I deserve everyone's respect", type: 'frustration', reframe: "I respect myself, regardless of how others treat me." },
  { id: 'b8', text: "I should never be inconvenienced", type: 'frustration', reframe: "Inconveniences happen to everyone. I can handle this." }
];

export default function FrustrationTolerance({ onComplete }: { onComplete?: (xp: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showReframe, setShowReframe] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentBelief = BELIEFS[currentIndex];

  const handleReframe = () => {
    setShowReframe(true);
    setScore(s => s + 15);
  };

  const handleNext = () => {
    if (currentIndex < BELIEFS.length - 1) {
      setCurrentIndex(c => c + 1);
      setShowReframe(false);
    } else {
      setGameOver(true);
    }
  };

  const finishGame = () => {
    if (onComplete) onComplete(score);
    resetGame();
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowReframe(false);
    setGameOver(false);
  };

  const instructions = (
    <div className="space-y-4">
      <p>Welcome to <strong>Frustration Tolerance</strong>.</p>
      <p>
        Often, it isn't the situation that causes our frustration, but rather our rigid beliefs about how the situation <em>ought</em> to be.
      </p>
      <p><strong>How to play:</strong></p>
      <ul className="list-disc pl-5">
        <li>Read the common frustration-driving belief presented on the screen.</li>
        <li>Think about how that rigid belief fuels anger and distress.</li>
        <li>Click "Challenge This Thought" to reveal a more flexible, frustration-tolerant reframe.</li>
      </ul>
      <p>Practice applying these reframes the next time you feel stuck in traffic or dealing with a broken machine!</p>
    </div>
  );

  const referenceContent = (
    <div className="space-y-6">
      <p className="text-sm">
        <strong>Low Frustration Tolerance (LFT)</strong> is the belief that discomfort, hassles, or challenges are "unbearable" or "too much to stand."
      </p>
      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
        <h4 className="font-bold text-orange-900 mb-2">The "I Can't Stand It" Error</h4>
        <p className="text-sm text-orange-800">
          When we tell ourselves we <em>can't stand</em> something, we increase our distress exponentially. The reality is, while we may strongly dislike an event, we usually <em>can</em> tolerate it and survive it.
        </p>
      </div>
      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
        <h4 className="font-bold text-emerald-900 mb-2">High Frustration Tolerance (HFT)</h4>
        <p className="text-sm text-emerald-800">
          HFT means accepting that life is filled with hassles and annoyances. It's the belief that while things might be bad, uncomfortable, or unfair, they are rarely catastrophic, and you have the strength to endure them.
        </p>
      </div>
    </div>
  );

  if (gameOver) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-12 bg-white rounded-[2rem] shadow-sm border border-neutral-200 text-center"
      >
        <Target className="w-16 h-16 mx-auto text-orange-500 mb-6" />
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">Tolerance Built!</h2>
        <p className="text-neutral-600 mb-8 text-lg">You scored {score} XP in Frustration Tolerance.</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={resetGame}
            className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-100 text-neutral-700 rounded-full font-medium hover:bg-neutral-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={finishGame}
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Claim XP & Finish
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <GameLayout
      title="Frustration Tolerance"
      instructions={instructions}
      referenceTitle="Tolerance Principles"
      referenceContent={referenceContent}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
            Belief {currentIndex + 1} of {BELIEFS.length}
          </div>
          <div className="text-sm font-medium text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full">
            {score} XP
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + (showReframe ? '-reframe' : '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-neutral-200"
            >
              {!showReframe ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Frustration Driver</h3>
                  <p className="text-2xl md:text-3xl font-serif text-neutral-900 mb-12 leading-tight">
                    "{currentBelief.text}"
                  </p>
                  <button
                    onClick={handleReframe}
                    className="px-8 py-4 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Challenge This Thought
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-6">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Tolerant Reframe</h3>
                  <p className="text-2xl md:text-3xl font-serif text-emerald-900 mb-12 leading-tight">
                    "{currentBelief.reframe}"
                  </p>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Next Belief
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GameLayout>
  );
}
