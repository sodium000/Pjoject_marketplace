'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import Header from '@/components/Layout/Header';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function BrowseProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

      const openProjects = projectsRes.data.projects.filter(p => p.status === 'open');
      setProjects(openProjects);
      setMyRequests(requestsRes.data.requests);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestToWork = async (projectId) => {
    try {
      setSubmitting(true);
      await api.post('/requests', {
        projectId,
        message: requestMessage,
      });
      setRequestModal(null);
      setRequestMessage('');
      await fetchData();
      alert('Request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const hasRequested = (projectId) => {
    return myRequests.some(r => r.project_id === projectId);
  };

  const getRequestStatus = (projectId) => {
    const request = myRequests.find(r => r.project_id === projectId);
    return request?.status || null;
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '⏳', text: 'Pending' },
      accepted: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅', text: 'Accepted' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌', text: 'Rejected' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  return (
    <RoleGuard allowedRoles={['problem_solver']}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Projects</h1>
          <p className="text-gray-400">Find and request to work on available projects</p>
        </div>


        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="input max-w-md"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try a different search term' : 'No open projects available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:ring-2 hover:ring-green-500/50 transition-all"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                    {project.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    Posted by <span className="text-blue-400">{project.buyer_name}</span>
                  </p>
                </div>

                {hasRequested(project.id) ? (
                  <div className="mt-4">
                    {getStatusBadge(getRequestStatus(project.id))}
                  </div>
                ) : (
                  <button
                    onClick={() => setRequestModal(project)}
                    className="btn btn-primary w-full"
                  >
                    Request to Work
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>


      {requestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Request to Work</h2>
            <p className="text-sm text-gray-400 mb-4">
              Send a request to work on <span className="text-white font-semibold">{requestModal.title}</span>
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you're a good fit for this project..."
              rows={5}
              className="input mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleRequestToWork(requestModal.id)}
                disabled={submitting}
                className="btn btn-primary flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={() => {
                  setRequestModal(null);
                  setRequestMessage('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </RoleGuard>
  );
}
