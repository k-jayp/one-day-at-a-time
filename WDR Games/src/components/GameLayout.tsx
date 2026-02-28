import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, BookOpen, X, ChevronRight, AlertCircle } from 'lucide-react';

interface GameLayoutProps {
    children: React.ReactNode;
    title: string;
    instructions: React.ReactNode;
    referenceTitle: string;
    referenceContent: React.ReactNode;
    showErrorPopup?: boolean;
    onCloseErrorPopup?: () => void;
    errorPopupText?: string;
}

export default function GameLayout({
    children,
    title,
    instructions,
    referenceTitle,
    referenceContent,
    showErrorPopup = false,
    onCloseErrorPopup,
    errorPopupText = "That wasn't quite right. Check the reference material for a hint!"
}: GameLayoutProps) {
    const [showInstructions, setShowInstructions] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // When error popup appears, automatically open the sidebar for reference
    React.useEffect(() => {
        if (showErrorPopup) {
            setIsSidebarOpen(true);
        }
    }, [showErrorPopup]);

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[#f5f5f0]">
            {/* Main Game Area */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:pr-96' : ''}`}>

                {/* Top Action Bar */}
                <div className="p-4 flex justify-between items-center max-w-5xl mx-auto w-full">
                    <button
                        onClick={() => setShowInstructions(true)}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
                    >
                        <Info className="w-4 h-4" />
                        <span className="hidden sm:inline">Instructions</span>
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${isSidebarOpen
                                ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200 shadow-sm'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Reference Text</span>
                    </button>
                </div>

                {/* Game Content Container */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </div>

            {/* Reference Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-neutral-200 z-40 overflow-hidden flex flex-col pt-16 lg:pt-0"
                    >
                        <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                {referenceTitle}
                            </h3>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 prose prose-sm prose-indigo max-w-none text-neutral-600 bg-neutral-50/50">
                            {referenceContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Initial Instructions Modal */}
            <AnimatePresence>
                {showInstructions && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
                        >
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                <Info className="w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">{title}</h2>

                            <div className="text-neutral-600 mb-8 prose prose-indigo">
                                {instructions}
                            </div>

                            <button
                                onClick={() => setShowInstructions(false)}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Start Game
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Error / Hint Popup Overlay */}
            <AnimatePresence>
                {showErrorPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
                    >
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 shadow-xl flex gap-4 items-start relative">
                            <div className="bg-red-100 p-2 rounded-xl shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1 pr-6">
                                <h4 className="font-bold text-red-900 mb-1">Not quite right</h4>
                                <p className="text-red-700 text-sm">{errorPopupText}</p>
                            </div>
                            <button
                                onClick={onCloseErrorPopup}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
