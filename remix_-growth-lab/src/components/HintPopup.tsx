import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, BookOpen, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenReference: () => void;
  message?: string;
}

export default function HintPopup({ isOpen, onClose, onOpenReference, message = "That doesn't seem quite right." }: Props) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl border border-rose-100 p-4 flex items-center gap-4 max-w-md w-[90%]"
        >
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">{message}</p>
            <button 
              onClick={() => { onClose(); onOpenReference(); }}
              className="text-sm text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 mt-1"
            >
              <BookOpen className="w-4 h-4" />
              Open Reference Guide
            </button>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
