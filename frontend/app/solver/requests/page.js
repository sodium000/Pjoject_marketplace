'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import Header from '@/components/Layout/Header';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function MyRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests/my-requests');
      setRequests(response.data.requests);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '⏳' },
      accepted: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' },
    };
    const badge = badges[status] || badges.pending;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  };

  const stats = getStats();

  return (
    <RoleGuard allowedRoles={['problem_solver']}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Requests</h1>
          <p className="text-gray-400">Track your project requests and their status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold mb-1">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Requests</div>
          </div>
          <div className="glass rounded-xl p-4 bg-yellow-500/10">
            <div className="text-2xl font-bold mb-1 text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="glass rounded-xl p-4 bg-green-500/10">
            <div className="text-2xl font-bold mb-1 text-green-400">{stats.accepted}</div>
            <div className="text-sm text-gray-400">Accepted</div>
          </div>
          <div className="glass rounded-xl p-4 bg-red-500/10">
            <div className="text-2xl font-bold mb-1 text-red-400">{stats.rejected}</div>
            <div className="text-sm text-gray-400">Rejected</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="glass rounded-xl p-1 inline-flex gap-1">
            {['all', 'pending', 'accepted', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
                  filter === f
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">
              {filter === 'all' ? 'No Requests Yet' : `No ${filter} requests`}
            </h3>
            <p className="text-gray-400 mb-4">
              {filter === 'all' && 'Browse available projects to get started'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => router.push('/solver/browse')}
                className="btn btn-primary"
              >
                Browse Projects
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{request.project_title}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{request.project_description}</p>
                    <p className="text-xs text-gray-500">
                      Buyer: <span className="text-blue-400">{request.buyer_name}</span>
                    </p>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-semibold mb-1">Your Message:</p>
                    <p className="text-sm text-gray-300">{request.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500">
                    Submitted {formatDate(request.created_at)}
                  </p>
                  
                  {request.status === 'accepted' && (
                    <button
                      onClick={() => router.push(`/solver/projects/${request.project_id}`)}
                      className="btn btn-primary btn-sm"
                    >
                      View Project →
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
