'use client';

/**
 * Project Card Component
 * Displays project with status and animations
 */

import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function ProjectCard({ project, onClick }) {
  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
      assigned: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      completed: 'bg-green-500/20 text-green-400 border-green-500/50',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: '🔓',
      assigned: '🔨',
      completed: '✅',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="glass rounded-xl p-6 cursor-pointer card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex-1 pr-4">{project.title}</h3>
        <span className={`badge border ${getStatusColor(project.status)}`}>
          {getStatusIcon(project.status)} {project.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {project.buyer_name && (
            <span>👤 {project.buyer_name}</span>
          )}
          {project.solver_name && (
            <span>🔧 {project.solver_name}</span>
          )}
        </div>
        <span>{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
      </div>
    </motion.div>
  );
}
