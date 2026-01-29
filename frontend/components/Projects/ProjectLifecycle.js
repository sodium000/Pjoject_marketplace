'use client';

/**
 * Project Lifecycle Visualization
 * Shows project state transitions with animation
 */

import { motion } from 'framer-motion';

export default function ProjectLifecycle({ currentStatus }) {
  const stages = [
    { key: 'open', label: 'Open', icon: '🔓' },
    { key: 'assigned', label: 'Assigned', icon: '🔨' },
    { key: 'completed', label: 'Completed', icon: '✅' },
  ];

  const getStageIndex = (status) => {
    if (status === 'open') return 0;
    if (status === 'assigned') return 1;
    if (status === 'completed') return 2;
    return 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>

        {/* Stages */}
        {stages.map((stage, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-700'
                }`}
              >
                {stage.icon}
              </motion.div>
              
              <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {stage.label}
              </span>
              
              {isCurrent && (
                <motion.div
                  className="absolute -bottom-2 px-3 py-1 bg-blue-500 rounded-full text-xs"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Current
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
