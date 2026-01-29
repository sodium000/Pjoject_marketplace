'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Header() {
  const { user, logout, isAdmin, isBuyer, isSolver } = useAuth();

  const getRoleColor = () => {
    if (isAdmin) return 'from-purple-500 to-pink-600';
    if (isBuyer) return 'from-blue-500 to-cyan-600';
    if (isSolver) return 'from-green-500 to-emerald-600';
    return 'from-gray-500 to-gray-600';
  };

  const getRoleBadge = () => {
    if (isAdmin) return '👑 Admin';
    if (isBuyer) return '💼 Buyer';
    if (isSolver) return '🔧 Problem Solver';
    return '';
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={isAdmin ? '/admin' : isBuyer ? '/buyer' : '/solver'}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold gradient-text cursor-pointer"
            >
              Project Marketplace
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className={`text-xs bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent font-semibold`}>
                {getRoleBadge()}
              </p>
            </div>
            
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
