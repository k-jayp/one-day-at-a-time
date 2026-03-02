import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Flame, Brain, Shield, Sparkles, Activity, BrainCircuit, Target, Heart, Zap, Lock, CheckCircle2, Clock } from 'lucide-react';
import { GAME_LEVELS, getLevelForXP, getNextLevel, ALL_BADGES, GameProgress } from '../constants';

interface ProfileProps {
  globalXP: number;
  earnedBadges: string[];
  streak: number;
  gameProgress: Record<string, GameProgress>;
}

const iconMap: Record<string, React.FC<any>> = {
  Brain, Shield, Sparkles, Activity, Trophy, Star, Flame, BrainCircuit, Target, Heart, Zap
};

export default function Profile({ globalXP, earnedBadges, streak, gameProgress }: ProfileProps) {
  const currentLevel = getLevelForXP(globalXP);
  const nextLevel = getNextLevel(currentLevel.level);
  
  const xpProgress = nextLevel 
    ? ((globalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 
    : 100;

  const completedGamesCount = Object.values(gameProgress).filter(g => g.completed).length;
  const totalGamesCount = Object.keys(gameProgress).length;
  const overallProgress = (completedGamesCount / totalGamesCount) * 100;

  return (
    <motion.div
      key="profile-view"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-200 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg shrink-0">
            <Medal className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Recovery Profile</h2>
            <p className="text-neutral-500 mb-4">Tracking your growth and resilience</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                <Star className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                <span className="font-bold text-indigo-900 text-lg">{globalXP} XP</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                <Flame className="w-5 h-5 text-orange-600 fill-orange-600" />
                <span className="font-bold text-orange-900 text-lg">{streak} Day Streak</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${currentLevel.color}`}>
                <span className="font-bold text-lg">Level {currentLevel.level}: {currentLevel.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-10 bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-1">Current Progress</p>
              <p className="font-bold text-neutral-900">
                {globalXP} <span className="text-neutral-400 font-normal">/ {nextLevel ? nextLevel.minXP : globalXP} XP</span>
              </p>
            </div>
            {nextLevel && (
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-1">Next Level</p>
                <p className="font-bold text-indigo-600">{nextLevel.name}</p>
              </div>
            )}
          </div>
          <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, xpProgress))}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
          {nextLevel && (
            <p className="text-sm text-neutral-500 mt-3 text-center">
              Earn <span className="font-bold text-neutral-700">{nextLevel.minXP - globalXP} more XP</span> to reach Level {nextLevel.level}!
            </p>
          )}
        </div>
      </div>

      {/* Game Progress Section */}
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <Target className="w-7 h-7 text-emerald-500" />
            Journey Progress
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-neutral-500">
              {completedGamesCount} of {totalGamesCount} Exercises Completed
            </div>
            <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(gameProgress).map((game) => (
            <div 
              key={game.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                game.completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-neutral-50 border-neutral-100'
              }`}
            >
              <div>
                <h4 className={`font-bold ${game.completed ? 'text-emerald-900' : 'text-neutral-700'}`}>
                  {game.name}
                </h4>
                {game.completed && game.lastCompletedAt ? (
                  <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
                    <Clock className="w-3 h-3" />
                    Last played: {new Date(game.lastCompletedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-400 mt-1">Not started yet</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {game.playCount > 0 && (
                  <span className="text-xs font-bold text-neutral-500 bg-white px-2 py-1 rounded-md border border-neutral-200">
                    {game.playCount} plays
                  </span>
                )}
                {game.completed ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-neutral-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Achievements & Badges
          </h3>
          <div className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
            {earnedBadges.length} / {ALL_BADGES.length} Unlocked
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map(badge => {
            const isEarned = earnedBadges.includes(badge.id);
            const IconComponent = iconMap[badge.iconName] || Star;
            
            return (
              <div 
                key={badge.id} 
                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group
                  ${isEarned 
                    ? `bg-white border-neutral-200 shadow-sm hover:shadow-md hover:border-indigo-200` 
                    : 'bg-neutral-50 border-neutral-100 opacity-70 grayscale'
                  }`}
              >
                {!isEarned && (
                  <div className="absolute top-3 right-3 text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                  ${isEarned ? badge.color : 'bg-neutral-200 text-neutral-400'}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1">{badge.name}</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
