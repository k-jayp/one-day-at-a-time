import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Shield, Sparkles, ArrowLeft, Activity, Trophy, Star, Flame, BrainCircuit } from 'lucide-react';

import CognitiveDistortionsGame from './games/CognitiveDistortionsGame';
import CopingSkillsBuilder from './games/CopingSkillsBuilder';
import FrustrationTolerance from './games/FrustrationTolerance';
import ThoughtCategorizer from './games/ThoughtCategorizer';
import ReframeBuilder from './games/ReframeBuilder';
import AIReframeStudio from './games/AIReframeStudio';
import Profile from './components/Profile';
import { ALL_BADGES, INITIAL_GAME_PROGRESS, GameProgress } from './constants';
import GameTutorial from './components/GameTutorial';
import { isInIframe, fetchGameData, fetchUserInfo, saveGameSession, saveGameData } from './bridge';

type GameType = 'distortions' | 'coping' | 'frustration' | 'categorizer' | 'reframe' | 'ai-reframe' | 'profile' | null;

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [tutorialGame, setTutorialGame] = useState<GameType>(null);
  const [globalXP, setGlobalXP] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [streak, setStreak] = useState(1); // Default to 1 for demo purposes
  const [gameProgress, setGameProgress] = useState<Record<string, GameProgress>>(INITIAL_GAME_PROGRESS);
  const [userName, setUserName] = useState('');

  // Load persisted game data and user info from Firestore via parent bridge
  useEffect(() => {
    if (!isInIframe()) return;
    fetchGameData().then((data) => {
      if (data && data.reframeXP) setGlobalXP(data.reframeXP);
      if (data && data.gameBadges && data.gameBadges.length > 0) setEarnedBadges(data.gameBadges);
      if (data && data.growthLabProgress) setGameProgress(prev => ({ ...prev, ...data.growthLabProgress }));
    }).catch(() => {});
    fetchUserInfo().then((info) => {
      if (info && info.displayName) setUserName(info.displayName);
    }).catch(() => {});
  }, []);

  // Auto-resize iframe to fit content
  useEffect(() => {
    if (!isInIframe()) return;
    const send = () => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ source: 'wdr-challenges', type: 'resize', height: h }, '*');
    };
    send();
    const observer = new MutationObserver(send);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  // Simple badge logic checker
  useEffect(() => {
    const newBadges = new Set(earnedBadges);
    
    // XP Badges
    if (globalXP >= 100 && !newBadges.has('xp_100')) newBadges.add('xp_100');
    if (globalXP >= 500 && !newBadges.has('xp_500')) newBadges.add('xp_500');
    if (globalXP >= 1000 && !newBadges.has('xp_1000')) newBadges.add('xp_1000');
    
    // First Session
    if (globalXP > 0 && !newBadges.has('first_session')) newBadges.add('first_session');
    
    // Streak Badges
    if (streak >= 3 && !newBadges.has('streak_3')) newBadges.add('streak_3');
    if (streak >= 7 && !newBadges.has('streak_7')) newBadges.add('streak_7');
    if (streak >= 30 && !newBadges.has('streak_30')) newBadges.add('streak_30');
    
    if (newBadges.size > earnedBadges.length) {
      setEarnedBadges(Array.from(newBadges));
    }
  }, [globalXP, streak, earnedBadges]);

  const handleGameComplete = (xpEarned: number, gameId: string) => {
    // Compute new XP total
    const newXP = globalXP + xpEarned;
    setGlobalXP(newXP);

    setGameProgress(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        completed: true,
        playCount: prev[gameId].playCount + 1,
        lastCompletedAt: new Date().toISOString()
      }
    }));

    // Collect new badges
    const newBadges = [...earnedBadges];
    const badgeMap: Record<string, string> = {
      'coping': 'coping_master',
      'categorizer': 'master_dichotomous',
      'ai-reframe': 'ai_reframe_master',
      'frustration': 'frustration_pro',
      'reframe': 'reframe_builder',
    };
    const badge = badgeMap[gameId];
    if (badge && !newBadges.includes(badge)) {
      newBadges.push(badge);
    }
    if (!newBadges.includes('first_session')) {
      newBadges.push('first_session');
    }
    setEarnedBadges(newBadges);

    // Build updated progress for this game
    const updatedProgress = {
      ...gameProgress,
      [gameId]: {
        ...gameProgress[gameId],
        completed: true,
        playCount: gameProgress[gameId].playCount + 1,
        lastCompletedAt: new Date().toISOString()
      }
    };

    // Persist to Firestore — single saveGameData call with all fields
    if (isInIframe()) {
      saveGameData({ reframeXP: newXP, gameBadges: newBadges, growthLabProgress: updatedProgress }).catch((err) => {
        console.error('Failed to save game data:', err);
      });
      saveGameSession({ gameId, xpEarned, score: xpEarned, maxScore: xpEarned }).catch(() => {});
    }

    setActiveGame('profile'); // Show profile after game to see rewards
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans text-neutral-900 selection:bg-indigo-200">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setActiveGame(null)}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">We Do Recover</h1>
              <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Growth Lab Games</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setActiveGame('profile'); setTutorialGame(null); }}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Profile & XP:</span> {globalXP}
            </button>

            {(activeGame || tutorialGame) && activeGame !== 'profile' && (
              <button 
                onClick={() => { setActiveGame(null); setTutorialGame(null); }}
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!activeGame && !tutorialGame ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">
                  Interactive Recovery Tools
                </h2>
                <p className="text-lg text-neutral-600">
                  Build your resilience, challenge negative thoughts, and earn achievements through interactive recovery exercises.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI Reframe Studio Card */}
                <button 
                  onClick={() => setTutorialGame('ai-reframe')}
                  className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border-2 border-indigo-100 hover:shadow-md hover:border-indigo-400 transition-all duration-300 lg:col-span-2 md:col-span-2"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-200">
                      <BrainCircuit className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-neutral-900">The Reframe Room</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">New</span>
                        {gameProgress['ai-reframe'].completed && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Completed</span>}
                      </div>
                      <p className="text-neutral-600 text-sm leading-relaxed mb-4 max-w-xl">
                        Type what's on your mind. Our AI will automatically identify cognitive distortions, explain them compassionately, and guide you through reframing your thoughts.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Game Card 1 */}
                <button 
                  onClick={() => setTutorialGame('distortions')}
                  className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-indigo-300 transition-all duration-300 relative overflow-hidden"
                >
                  {gameProgress['distortions'].completed && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 transform rotate-45 translate-x-8 -translate-y-8" />}
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Spot the Thought</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                    Learn to identify common thinking errors like catastrophizing and all-or-nothing thinking.
                  </p>
                </button>

                {/* Game Card 2 */}
                <button 
                  onClick={() => setTutorialGame('categorizer')}
                  className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 relative overflow-hidden"
                >
                  {gameProgress['categorizer'].completed && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 transform rotate-45 translate-x-8 -translate-y-8" />}
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Distorted Sorted</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                    Drag and drop distorted thoughts into their correct cognitive distortion categories.
                  </p>
                </button>

                {/* Game Card 3 */}
                <button 
                  onClick={() => setTutorialGame('reframe')}
                  className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-purple-300 transition-all duration-300 relative overflow-hidden"
                >
                  {gameProgress['reframe'].completed && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 transform rotate-45 translate-x-8 -translate-y-8" />}
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Balance Beam</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                    Fill in the blanks to transform distorted thoughts into balanced, realistic alternatives.
                  </p>
                </button>

                {/* Game Card 4 */}
                <button 
                  onClick={() => setTutorialGame('coping')}
                  className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-emerald-300 transition-all duration-300 relative overflow-hidden"
                >
                  {gameProgress['coping'].completed && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 transform rotate-45 translate-x-8 -translate-y-8" />}
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Skills that Soothe</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                    Build your personalized toolkit by categorizing physical, emotional, and mental coping strategies.
                  </p>
                </button>

                {/* Game Card 5 */}
                <button 
                  onClick={() => setTutorialGame('frustration')}
                  className="group text-left bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200 hover:shadow-md hover:border-orange-300 transition-all duration-300 relative overflow-hidden"
                >
                  {gameProgress['frustration'].completed && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 transform rotate-45 translate-x-8 -translate-y-8" />}
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Flame className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Tolerance Tilt</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                    Practice reframing beliefs that drive frustration into tolerant, accepting thoughts.
                  </p>
                </button>
              </div>
            </motion.div>
          ) : tutorialGame ? (
            <motion.div
              key="tutorial-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="py-6"
            >
              <GameTutorial 
                gameId={tutorialGame} 
                onStart={() => {
                  setActiveGame(tutorialGame);
                  setTutorialGame(null);
                }} 
              />
            </motion.div>
          ) : activeGame === 'profile' ? (
            <Profile globalXP={globalXP} earnedBadges={earnedBadges} streak={streak} gameProgress={gameProgress} userName={userName} />
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
      </main>
    </div>
  );
}

