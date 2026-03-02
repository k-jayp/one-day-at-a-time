import React from 'react';
import { Brain, Shield, Sparkles, Activity, Trophy, Star, Flame, BrainCircuit, Target, Heart, Zap } from 'lucide-react';

export interface GameLevel {
  level: number;
  name: string;
  minXP: number;
  color: string;
}

export const GAME_LEVELS: GameLevel[] = [
  { level: 0, name: 'Seedling', minXP: 0, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { level: 1, name: 'Sprout', minXP: 50, color: 'text-green-500 bg-green-50 border-green-200' },
  { level: 2, name: 'Sapling', minXP: 150, color: 'text-teal-500 bg-teal-50 border-teal-200' },
  { level: 3, name: 'Growing Tree', minXP: 350, color: 'text-cyan-500 bg-cyan-50 border-cyan-200' },
  { level: 4, name: 'Mighty Oak', minXP: 700, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { level: 5, name: 'Ancient Redwood', minXP: 1200, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  { level: 6, name: 'Recovery Master', minXP: 2500, color: 'text-purple-500 bg-purple-50 border-purple-200' },
];

export const getLevelForXP = (xp: number): GameLevel => {
  for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= GAME_LEVELS[i].minXP) {
      return GAME_LEVELS[i];
    }
  }
  return GAME_LEVELS[0];
};

export const getNextLevel = (currentLevel: number): GameLevel | null => {
  if (currentLevel < GAME_LEVELS.length - 1) {
    return GAME_LEVELS[currentLevel + 1];
  }
  return null;
};

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // We'll map this to a Lucide component in the UI
  color: string;
}

export interface GameProgress {
  id: string;
  name: string;
  completed: boolean;
  playCount: number;
  lastCompletedAt?: string;
}

export const INITIAL_GAME_PROGRESS: Record<string, GameProgress> = {
  'ai-reframe': { id: 'ai-reframe', name: 'AI Reframe Studio', completed: false, playCount: 0 },
  'distortions': { id: 'distortions', name: 'Identify Distortions', completed: false, playCount: 0 },
  'categorizer': { id: 'categorizer', name: 'Thought Categorizer', completed: false, playCount: 0 },
  'reframe': { id: 'reframe', name: 'Reframe Builder', completed: false, playCount: 0 },
  'coping': { id: 'coping', name: 'Coping Skills Menu', completed: false, playCount: 0 },
  'frustration': { id: 'frustration', name: 'Frustration Tolerance', completed: false, playCount: 0 },
};

export const ALL_BADGES: Badge[] = [
  { id: 'first_session', name: 'First Step', description: 'Completed your first reframing session.', iconName: 'Sparkles', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 'master_dichotomous', name: 'Nuance Seeker', description: 'Mastered identifying All-or-Nothing thinking.', iconName: 'Brain', color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { id: 'ai_reframe_master', name: 'AI Insight', description: 'Used the AI Reframe Studio to analyze a thought.', iconName: 'BrainCircuit', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  { id: 'streak_3', name: '3-Day Streak', description: 'Logged in and practiced for 3 days straight.', iconName: 'Flame', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'streak_7', name: '7-Day Streak', description: 'Logged in and practiced for a full week.', iconName: 'Flame', color: 'bg-red-100 text-red-600 border-red-200' },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintained a 30-day practice streak.', iconName: 'Target', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { id: 'xp_100', name: 'Century Club', description: 'Earned 100 total XP.', iconName: 'Star', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  { id: 'xp_500', name: 'Half Millennium', description: 'Earned 500 total XP.', iconName: 'Star', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 'xp_1000', name: '1K Club', description: 'Earned 1000 total XP.', iconName: 'Trophy', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'coping_master', name: 'Toolkit Builder', description: 'Completed the Coping Skills Menu.', iconName: 'Shield', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { id: 'frustration_pro', name: 'Zen Master', description: 'Completed the Frustration Tolerance exercise.', iconName: 'Heart', color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { id: 'reframe_builder', name: 'Perspective Shifter', description: 'Completed the Reframe Builder exercise.', iconName: 'Zap', color: 'bg-sky-100 text-sky-600 border-sky-200' },
];
