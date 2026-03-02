import React from 'react';
import { motion } from 'motion/react';
import { Play, BookOpen, Brain, Shield, Sparkles, Activity, BrainCircuit, Flame, ArrowRight } from 'lucide-react';

interface GameTutorialProps {
  gameId: string;
  onStart: () => void;
}

const tutorialData: Record<string, {
  title: string;
  icon: React.FC<any>;
  color: string;
  concept: string;
  howToPlay: string[];
  example: { distorted: string; reframed: string };
}> = {
  'ai-reframe': {
    title: 'AI Reframe Studio',
    icon: BrainCircuit,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    concept: 'Sometimes we get stuck in negative thought loops. The AI Reframe Studio uses artificial intelligence to help you identify cognitive distortions in your own words and guides you through reframing them into healthier perspectives.',
    howToPlay: [
      'Type a negative or distressing thought you are currently having.',
      'The AI will analyze your thought and identify any cognitive distortions.',
      'Read the explanation to understand why the thought is distorted.',
      "Follow the AI's guidance to rewrite the thought in a more balanced way."
    ],
    example: {
      distorted: "I messed up that presentation, I'm a total failure.",
      reframed: "I made a mistake during the presentation, but I also did some parts well. One mistake doesn't define my entire worth."
    }
  },
  'distortions': {
    title: 'Identify Distortions',
    icon: Brain,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    concept: 'Cognitive distortions are irrational thought patterns that can negatively influence our emotions. Learning to recognize them is the first step to changing them.',
    howToPlay: [
      'Read the scenario and the thought provided.',
      'Review the definitions of the different cognitive distortions.',
      'Select the distortion that best matches the thought.',
      'Earn XP for correct identifications!'
    ],
    example: {
      distorted: "If I don't get this job, I'll never be successful.",
      reframed: "Catastrophizing (assuming the worst possible outcome)"
    }
  },
  'categorizer': {
    title: 'Thought Categorizer',
    icon: Activity,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    concept: 'Categorizing thoughts helps create distance from them. By sorting thoughts into categories, you practice observing them objectively rather than accepting them as absolute truth.',
    howToPlay: [
      'You will see a series of thoughts appear on screen.',
      'Drag and drop each thought into the correct distortion category.',
      'Try to categorize as many as you can to build your pattern recognition skills.'
    ],
    example: {
      distorted: "He didn't say hi, he must hate me.",
      reframed: "Mind Reading (assuming you know what others are thinking)"
    }
  },
  'reframe': {
    title: 'Reframe Builder',
    icon: Sparkles,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    concept: 'Reframing is the core skill of Cognitive Behavioral Therapy (CBT). It involves taking a distorted, negative thought and restructuring it into a balanced, realistic, and helpful alternative.',
    howToPlay: [
      'Read the distorted thought presented.',
      'Use the provided input fields to build a more balanced alternative.',
      'Focus on facts, alternative explanations, and self-compassion.',
      'Submit your reframe to see how it compares to a clinical example.'
    ],
    example: {
      distorted: "I should have known better, I'm so stupid.",
      reframed: "I made a decision based on the information I had at the time. I can learn from this and do differently next time."
    }
  },
  'coping': {
    title: 'Coping Skills Menu',
    icon: Shield,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    concept: 'A robust coping toolbox is essential for managing distress. Categorizing skills helps you quickly identify the right tool for the right situation (e.g., physical grounding vs. emotional soothing).',
    howToPlay: [
      'Review the list of coping strategies.',
      'Sort them into categories: Physical, Emotional, Mental, or Social.',
      'Build your personalized menu of strategies to use when you feel overwhelmed.'
    ],
    example: {
      distorted: "Taking a cold shower",
      reframed: "Physical Coping Strategy (helps reset the nervous system)"
    }
  },
  'frustration': {
    title: 'Frustration Tolerance',
    icon: Flame,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    concept: 'Low frustration tolerance (LFT) is the belief that discomfort is unbearable. Building frustration tolerance involves accepting that while things may be difficult, you can survive and cope with them.',
    howToPlay: [
      'Read the frustrating scenario.',
      'Identify the "LFT" (Low Frustration Tolerance) belief.',
      'Choose or construct a "HFT" (High Frustration Tolerance) alternative.',
      'Practice accepting discomfort without catastrophizing.'
    ],
    example: {
      distorted: "I can't stand being stuck in this traffic!",
      reframed: "I don't like being stuck in traffic, but I can tolerate it. It's an inconvenience, not a catastrophe."
    }
  }
};

export default function GameTutorial({ gameId, onStart }: GameTutorialProps) {
  const data = tutorialData[gameId];
  
  if (!data) return null;
  
  const Icon = data.icon;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${data.color}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">{data.title}</h2>
            <p className="text-neutral-500 font-medium">Interactive Tutorial</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Concept Section */}
          <section>
            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Therapeutic Concept
            </h3>
            <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-5 rounded-xl border border-neutral-100">
              {data.concept}
            </p>
          </section>

          {/* Example Section */}
          <section>
            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Example
            </h3>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Distorted Thought</p>
                <p className="text-neutral-700 italic">"{data.example.distorted}"</p>
              </div>
              <div className="pl-4 border-l-2 border-amber-200">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Reframed / Categorized</p>
                <p className="text-neutral-700 font-medium">{data.example.reframed}</p>
              </div>
            </div>
          </section>

          {/* How to Play Section */}
          <section>
            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              How to Play
            </h3>
            <ul className="space-y-3">
              {data.howToPlay.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-neutral-600">{step}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onStart}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Play className="w-5 h-5" />
            Start Exercise
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
