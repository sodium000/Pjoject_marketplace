'use client';

import { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Header from '@/components/Layout/Header';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigningRole, setAssigningRole] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const assignRole = async (userId, role) => {
    try {
      setAssigningRole(userId);
      await api.patch(`/users/${userId}/role`, { role });
      await fetchUsers();
    } catch (err) {
      alert('Failed to assign role');
    } finally {
      setAssigningRole(null);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '👑' },
      buyer: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '💼' },
      problem_solver: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🔧' },
    };
    const badge = badges[role] || badges.problem_solver;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <span>{badge.icon}</span>
        <span>{role.replace('_', ' ')}</span>
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🟢' },
      assigned: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔵' },
      completed: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '✅' },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' },
    };
    const badge = badges[status] || badges.open;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <span>{badge.icon}</span>
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users and view projects</p>
        </div>

        <div className="mb-6">
          <div className="glass rounded-xl p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              👥 Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              📁 Projects ({projects.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'users' ? (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="glass rounded-xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Current Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 text-sm">{getRoleBadge(user.role)}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              {user.role !== 'buyer' && (
                                <button
                                  onClick={() => assignRole(user.id, 'buyer')}
                                  disabled={assigningRole === user.id}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  {assigningRole === user.id ? 'Assigning...' : 'Make Buyer'}
                                </button>
                              )}
                              {user.role !== 'problem_solver' && (
                                <button
                                  onClick={() => assignRole(user.id, 'problem_solver')}
                                  disabled={assigningRole === user.id}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  {assigningRole === user.id ? 'Assigning...' : 'Make Solver'}
                                </button>
                              )}
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => assignRole(user.id, 'admin')}
                                  disabled={assigningRole === user.id}
                                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  {assigningRole === user.id ? 'Assigning...' : 'Make Admin'}
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="glass rounded-xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Buyer</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Assigned Solver</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl">📁</span>
                              <p>No projects yet</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        projects.map((project, index) => (
                          <motion.tr
                            key={project.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">{project.title}</div>
                              <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {project.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {project.buyer_name}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {getStatusBadge(project.status)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {project.solver_name || (
                                <span className="text-gray-500 italic">Not assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {formatDate(project.created_at)}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </RoleGuard>
  );
}
