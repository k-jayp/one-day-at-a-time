import React, { useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { ShieldCheck, GripHorizontal, CheckCircle2 } from 'lucide-react';
import GameLayout from '../components/GameLayout';

const CATEGORIES = [
  { id: 'physical', name: 'Physical', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'emotional', name: 'Emotional', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'mental', name: 'Mental', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'sensory', name: 'Sensory', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'social', name: 'Social', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
];

const INITIAL_SKILLS = [
  { id: 's1', text: 'Go for a walk or run', category: 'physical' },
  { id: 's2', text: 'Journal your feelings', category: 'emotional' },
  { id: 's3', text: 'Practice deep breathing', category: 'mental' },
  { id: 's4', text: 'Light a scented candle', category: 'sensory' },
  { id: 's5', text: 'Call a supportive friend', category: 'social' },
  { id: 's6', text: 'Take a warm shower', category: 'physical' },
  { id: 's7', text: 'Listen to matching music', category: 'emotional' },
  { id: 's8', text: 'Do a crossword puzzle', category: 'mental' },
  { id: 's9', text: 'Wrap up in a soft blanket', category: 'sensory' },
  { id: 's10', text: 'Attend a support group', category: 'social' }
];

export default function CopingSkillsBuilder({ onComplete }: { onComplete?: (xp: number) => void }) {
  const [skills, setSkills] = useState(() => [...INITIAL_SKILLS].sort(() => Math.random() - 0.5));
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [lastErrorSkill, setLastErrorSkill] = useState<string>('');

  const handlePlace = (skillId: string, categoryId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    if (skill.category === categoryId) {
      setPlaced(prev => ({ ...prev, [skillId]: categoryId }));
      setScore(s => s + 10);
      setShowErrorPopup(false);
    } else {
      setLastErrorSkill(skill.text);
      setShowErrorPopup(true);
    }
  };

  const finishGame = () => {
    if (onComplete) onComplete(score);
  };

  const isComplete = Object.keys(placed).length === skills.length;

  const instructions = (
    <div className="space-y-4">
      <p>Welcome to the <strong>Coping Skills Builder</strong>.</p>
      <p>
        Building a diverse toolkit of coping skills ensures you have the right strategy for different types of distress.
        In this exercise, you'll categorize various coping strategies to build a balanced "Coping Menu".
      </p>
      <p><strong>How to play:</strong></p>
      <ul className="list-disc pl-5">
        <li>Drag coping skills from the "Available Skills" pool on the left.</li>
        <li>Drop them into the correct category on the right based on the type of soothing they provide.</li>
        <li>If you get stuck, open the <em>Coping Categories</em> reference in the sidebar!</li>
      </ul>
    </div>
  );

  const referenceContent = (
    <div className="space-y-6">
      <p className="text-sm">
        A balanced coping plan includes strategies across multiple domains:
      </p>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-rose-800">Physical Coping</h4>
          <p className="text-sm">Activities that engage your body, release physical tension, or involve movement. (e.g., Walking, stretching, drinking water).</p>
        </div>
        <div>
          <h4 className="font-bold text-blue-800">Emotional Coping</h4>
          <p className="text-sm">Strategies that help you process, express, or release feelings. (e.g., Journaling, crying, listening to expressive music).</p>
        </div>
        <div>
          <h4 className="font-bold text-purple-800">Mental Coping</h4>
          <p className="text-sm">Activities that engage your mind, distract you, or help you reframe thoughts. (e.g., Puzzles, reading, positive self-talk).</p>
        </div>
        <div>
          <h4 className="font-bold text-amber-800">Sensory Coping</h4>
          <p className="text-sm">Using your five senses (sight, sound, touch, taste, smell) to self-soothe. (e.g., Soft blankets, scented candles, warm baths).</p>
        </div>
        <div>
          <h4 className="font-bold text-emerald-800">Social Coping</h4>
          <p className="text-sm">Connecting with others for support, distraction, or shared activities. (e.g., Calling a friend, support groups).</p>
        </div>
      </div>
    </div>
  );

  return (
    <GameLayout
      title="Build Your Coping Menu"
      instructions={instructions}
      referenceTitle="Coping Categories"
      referenceContent={referenceContent}
      showErrorPopup={showErrorPopup}
      onCloseErrorPopup={() => setShowErrorPopup(false)}
      errorPopupText={`"${lastErrorSkill}" belongs in a different category. Check the reference sidebar if you need a hint!`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Sort these coping skills into their correct categories. Having a diverse toolkit helps you respond better to different types of distress.
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
            {Object.keys(placed).length} of {skills.length} Placed
          </div>
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {score} XP
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Unplaced Skills Pool */}
          <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-neutral-500" />
              Available Skills
            </h3>
            <div className="flex flex-col gap-3">
              {skills.filter(s => !placed[s.id]).map(skill => (
                <motion.div
                  key={skill.id}
                  layoutId={skill.id}
                  draggable
                  onDragStart={(e: any) => e.dataTransfer.setData('text/plain', skill.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 cursor-grab active:cursor-grabbing flex items-center gap-3 hover:border-neutral-300 transition-colors"
                >
                  <GripHorizontal className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700">{skill.text}</span>
                </motion.div>
              ))}
              {Object.keys(placed).length === skills.length && (
                <div className="text-center py-8 text-neutral-500 italic">
                  All skills placed!
                </div>
              )}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map(category => {
              const categorySkills = skills.filter(s => placed[s.id] === category.id);

              return (
                <div
                  key={category.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const skillId = e.dataTransfer.getData('text/plain');
                    handlePlace(skillId, category.id);
                  }}
                  className={`p-6 rounded-3xl border-2 border-dashed transition-colors ${categorySkills.length > 0 ? category.color.replace('bg-', 'bg-opacity-10 bg-') : 'border-neutral-200 bg-white'
                    }`}
                >
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${category.color.split(' ')[1]}`}>
                    {category.name}
                  </h4>
                  <div className="flex flex-col gap-2 min-h-[100px]">
                    {categorySkills.map(skill => (
                      <motion.div
                        key={skill.id}
                        layoutId={skill.id}
                        className={`p-3 rounded-lg text-sm font-medium flex items-center justify-between ${category.color}`}
                      >
                        {skill.text}
                        <CheckCircle2 className="w-4 h-4 opacity-50" />
                      </motion.div>
                    ))}
                    {categorySkills.length === 0 && (
                      <div className="h-full flex items-center justify-center text-sm text-neutral-400 italic">
                        Drop {category.name.toLowerCase()} skills here
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
            className="mt-12 p-8 bg-emerald-50 rounded-3xl text-center border border-emerald-100"
          >
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Menu Complete!</h3>
            <p className="text-emerald-700 mb-6">You've successfully categorized all coping skills.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setPlaced({});
                  setScore(0);
                  setSkills([...INITIAL_SKILLS].sort(() => Math.random() - 0.5));
                }}
                className="px-6 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-full font-medium hover:bg-emerald-100 transition-colors"
              >
                Practice Again
              </button>
              <button
                onClick={finishGame}
                className="px-6 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors"
              >
                Claim XP & Finish
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
}
