'use client';

/**
 * Problem Solver Dashboard
 * Browse available projects and manage assigned projects
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import Header from '@/components/Layout/Header';
import ProjectCard from '@/components/Projects/ProjectCard';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function SolverDashboard() {
  const [projects, setProjects] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, requestsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/requests/my-requests'),
      ]);
      setProjects(projectsRes.data.projects);
      setMyRequests(requestsRes.data.requests);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const requestProject = async (projectId) => {
    const message = prompt('Enter a message (optional):');
    if (message === null) return; // Cancelled
    
    try {
      await api.post('/requests', { projectId, message });
      await fetchData();
      alert('Request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const availableProjects = projects.filter(p => p.status === 'open');
  const assignedProjects = projects.filter(p => p.status === 'assigned');

  return (
    <RoleGuard allowedRoles={['problem_solver']}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Problem Solver Dashboard</h1>
          <p className="text-gray-400">Browse projects and manage your work</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Available Projects', value: availableProjects.length, color: 'from-cyan-500 to-blue-600', icon: '🔓' },
            { label: 'My Requests', value: myRequests.length, color: 'from-purple-500 to-pink-600', icon: '📤' },
            { label: 'Assigned to Me', value: assignedProjects.length, color: 'from-green-500 to-emerald-600', icon: '🔨' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-xl p-6 bg-gradient-to-br ${stat.color} bg-opacity-10`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['available', 'my-requests', 'assigned'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'available' ? 'Available Projects' : tab === 'my-requests' ? 'My Requests' : 'Assigned to Me'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'available' && (
              <div>
                {availableProjects.length === 0 ? (
                  <div className="text-center py-12 glass rounded-xl">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No Available Projects</h3>
                    <p className="text-gray-400">Check back later for new opportunities</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableProjects.map((project) => (
                      <div key={project.id} className="relative">
                        <ProjectCard
                          project={project}
                          onClick={() => {}}
                        />
                        <button
                          onClick={() => requestProject(project.id)}
                          className="absolute bottom-6 right-6 btn btn-success text-sm"
                        >
                          Request to Work
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-requests' && (
              <div className="space-y-4">
                {myRequests.length === 0 ? (
                  <div className="text-center py-12 glass rounded-xl">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-400">You haven't requested any projects yet</p>
                  </div>
                ) : (
                  myRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold mb-2">{request.project_title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{request.project_description}</p>
                          <p className="text-xs text-gray-500">Buyer: {request.buyer_name}</p>
                        </div>
                        <span className={`badge ml-4 ${
                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          request.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'assigned' && (
              <div>
                {assignedProjects.length === 0 ? (
                  <div className="text-center py-12 glass rounded-xl">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">No Assigned Projects</h3>
                    <p className="text-gray-400">Request available projects to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => router.push(`/solver/projects/${project.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}
