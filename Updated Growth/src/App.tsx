import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Shield, Sparkles, ArrowLeft, Activity, Trophy, Medal, Star, Flame, BrainCircuit } from 'lucide-react';

import CognitiveDistortionsGame from './games/DistortedSorted';
import CopingSkillsBuilder from './games/SkillsThatSoothe';
import FrustrationTolerance from './games/ToleranceTilt';
import ThoughtCategorizer from './games/SpotTheThought';
import ReframeBuilder from './games/BalanceBeam';
import AIReframeStudio from './games/TheReframeRoom';

type GameType = 'distortions' | 'coping' | 'frustration' | 'categorizer' | 'reframe' | 'ai-reframe' | 'profile' | null;

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ALL_BADGES: Badge[] = [
  { id: 'first_session', name: 'First Step', description: 'Completed your first reframing session.', icon: <Sparkles className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
  { id: 'master_dichotomous', name: 'Nuance Seeker', description: 'Mastered identifying All-or-Nothing thinking.', icon: <Brain className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600' },
  { id: 'ai_reframe_master', name: 'AI Insight', description: 'Used the AI Reframe Studio to analyze a thought.', icon: <BrainCircuit className="w-6 h-6" />, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'streak_10', name: '10-Day Streak', description: 'Logged in and practiced for 10 days straight.', icon: <Flame className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600' },
  { id: 'xp_100', name: 'Century Club', description: 'Earned 100 total XP.', icon: <Star className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'coping_master', name: 'Toolkit Builder', description: 'Completed the Coping Skills Menu.', icon: <Shield className="w-6 h-6" />, color: 'bg-emerald-100 text-emerald-600' },
];

// postMessage bridge to parent site's Firestore functions
let _msgId = 0;
const _pending = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();

window.addEventListener('message', (e) => {
  if (e.data?.source !== 'wdr-parent') return;
  const { id, result, error } = e.data;
  const p = _pending.get(id);
  if (!p) return;
  _pending.delete(id);
  if (error) p.reject(new Error(error));
  else p.resolve(result);
});

function callParent(method: string, args?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = ++_msgId;
    _pending.set(id, { resolve, reject });
    window.parent.postMessage({ source: 'wdr-challenges', id, method, args }, '*');
    // Timeout after 5s
    setTimeout(() => {
      if (_pending.has(id)) {
        _pending.delete(id);
        reject(new Error('postMessage timeout'));
      }
    }, 5000);
  });
}

const firestoreBridge = {
  async loadGameData(): Promise<{ xp: number; badges: string[] }> {
    try {
      const data = await callParent('getGameData');
      return { xp: data?.reframeXP || 0, badges: data?.gameBadges || [] };
    } catch (e) { console.error('Failed to load game data:', e); }
    return { xp: 0, badges: [] };
  },
  async saveXPAndBadges(xpEarned: number, gameId: string, score: number, maxScore: number) {
    try {
      await callParent('awardXP', { totalXP: xpEarned, breakdown: [{ label: 'Score', xp: xpEarned }] });
      await callParent('saveGameSession', { gameId, xpEarned, score, maxScore });
      // Check badges
      const badgeMap: Record<string, string> = {
        'categorizer': 'master_dichotomous',
        'ai-reframe': 'ai_reframe_master',
        'coping': 'coping_master',
      };
      const badgeId = badgeMap[gameId];
      if (badgeId) {
        const data = await firestoreBridge.loadGameData();
        if (!data.badges.includes(badgeId)) {
          await callParent('saveGameData', { gameBadges: [...data.badges, badgeId] });
        }
      }
    } catch (e) { console.error('Failed to save game data:', e); }
  }
};

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [globalXP, setGlobalXP] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  // Load persisted data from Firestore on mount
  useEffect(() => {
    firestoreBridge.loadGameData().then(({ xp, badges }) => {
      setGlobalXP(xp);
      setEarnedBadges(badges);
    });
  }, []);

  // Notify parent of height changes for iframe auto-resize
  useEffect(() => {
    const sendHeight = () => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ source: 'wdr-challenges', type: 'resize', height: h }, '*');
    };
    const ro = new ResizeObserver(sendHeight);
    ro.observe(document.documentElement);
    sendHeight();
    return () => ro.disconnect();
  }, []);

  // Badge logic checker
  useEffect(() => {
    const newBadges = new Set(earnedBadges);
    if (globalXP >= 100 && !newBadges.has('xp_100')) newBadges.add('xp_100');
    if (globalXP > 0 && !newBadges.has('first_session')) newBadges.add('first_session');

    if (newBadges.size > earnedBadges.length) {
      setEarnedBadges(Array.from(newBadges));
    }
  }, [globalXP, earnedBadges]);

  const handleGameComplete = async (xpEarned: number, gameId: string) => {
    setGlobalXP(prev => prev + xpEarned);

    // Award specific badges based on game
    if (gameId === 'coping' && !earnedBadges.includes('coping_master')) {
      setEarnedBadges(prev => [...prev, 'coping_master']);
    }
    if (gameId === 'categorizer' && !earnedBadges.includes('master_dichotomous')) {
      setEarnedBadges(prev => [...prev, 'master_dichotomous']);
    }
    if (gameId === 'ai-reframe' && !earnedBadges.includes('ai_reframe_master')) {
      setEarnedBadges(prev => [...prev, 'ai_reframe_master']);
    }

    // Persist to Firestore
    await firestoreBridge.saveXPAndBadges(xpEarned, gameId, xpEarned, xpEarned);

    setActiveGame('profile');
  };

  return (
    <div className="font-sans text-neutral-900">
      {/* Inline toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={() => setActiveGame('profile')}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors text-sm"
        >
          <Trophy className="w-4 h-4" />
          <span>{globalXP} XP</span>
        </button>

        {activeGame && (
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
        )}
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-base text-neutral-600">
                Build your resilience, challenge negative thoughts, and earn achievements through interactive exercises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Reframe Studio Card */}
              <button
                onClick={() => setActiveGame('ai-reframe')}
                className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border-2 border-indigo-100 hover:shadow-md hover:border-indigo-400 transition-all duration-300 lg:col-span-2 md:col-span-2"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-200">
                    <BrainCircuit className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-neutral-900">The Reframe Room</h3>
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Powered by Mona</span>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-4 max-w-xl">
                      Type what's on your mind. Our AI will automatically identify cognitive distortions, explain them compassionately, and guide you through reframing your thoughts.
                    </p>
                  </div>
                </div>
              </button>

              {/* Game Card 1 */}
              <button
                onClick={() => setActiveGame('distortions')}
                className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-indigo-300 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Spot the Thought</h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  Test your ability to spot cognitive distortions in everyday thoughts.
                </p>
              </button>

              {/* Game Card 2 */}
              <button
                onClick={() => setActiveGame('categorizer')}
                className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-blue-300 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Distorted Sorted</h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  Drag distorted thoughts into their correct category.
                </p>
              </button>

              {/* Game Card 3 */}
              <button
                onClick={() => setActiveGame('reframe')}
                className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-purple-300 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Balance Beam</h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  Complete balanced reframes by filling in the right words.
                </p>
              </button>

              {/* Game Card 4 */}
              <button
                onClick={() => setActiveGame('coping')}
                className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-emerald-300 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Skills that Soothe</h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  Sort coping strategies into the right wellness categories.
                </p>
              </button>

              {/* Game Card 5 */}
              <button
                onClick={() => setActiveGame('frustration')}
                className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-orange-300 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Tolerance Tilt</h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  Challenge rigid beliefs and build tolerance with balanced reframes.
                </p>
              </button>
            </div>
          </motion.div>
        ) : activeGame === 'profile' ? (
          <motion.div
            key="profile-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-200">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-neutral-100 pb-12">
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Medal className="w-16 h-16 text-indigo-600" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-neutral-900 mb-2">Recovery Profile</h2>
                  <p className="text-neutral-500 mb-4">Tracking your growth and resilience</p>
                  <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                    <span className="font-bold text-indigo-900 text-lg">{globalXP} Total XP</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Achievements & Badges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_BADGES.map(badge => {
                    const isEarned = earnedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-2xl border transition-all ${isEarned ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-50 border-neutral-100 opacity-60 grayscale'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isEarned ? badge.color : 'bg-neutral-200 text-neutral-400'}`}>
                          {badge.icon}
                        </div>
                        <h4 className="font-bold text-neutral-900 mb-1">{badge.name}</h4>
                        <p className="text-xs text-neutral-500">{badge.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="py-6"
          >
            {activeGame === 'distortions' && <CognitiveDistortionsGame onComplete={(xp) => handleGameComplete(xp, 'distortions')} />}
            {activeGame === 'coping' && <CopingSkillsBuilder onComplete={(xp) => handleGameComplete(xp, 'coping')} />}
            {activeGame === 'frustration' && <FrustrationTolerance onComplete={(xp) => handleGameComplete(xp, 'frustration')} />}
            {activeGame === 'categorizer' && <ThoughtCategorizer onComplete={(xp) => handleGameComplete(xp, 'categorizer')} />}
            {activeGame === 'reframe' && <ReframeBuilder onComplete={(xp) => handleGameComplete(xp, 'reframe')} />}
            {activeGame === 'ai-reframe' && <AIReframeStudio onComplete={(xp) => handleGameComplete(xp, 'ai-reframe')} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
