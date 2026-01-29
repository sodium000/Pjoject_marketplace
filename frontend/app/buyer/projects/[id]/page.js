'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import Header from '@/components/Layout/Header';
import ProjectLifecycle from '@/components/Projects/ProjectLifecycle';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function BuyerProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchProjectData();
    }
  }, [params.id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, requestsRes, tasksRes] = await Promise.all([
        api.get(`/projects/${params.id}`),
        api.get(`/requests/project/${params.id}`),
        api.get(`/tasks/project/${params.id}`),
      ]);
      setProject(projectRes.data.project);
      setRequests(requestsRes.data.requests);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error('Failed to load project data', err);
      router.push('/buyer');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    if (!confirm('Accept this request? This will assign the project to this solver.')) return;
    
    try {
      await api.patch(`/requests/${requestId}/accept`);
      await fetchProjectData();
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const reviewSubmission = async (submissionId, accept, notes = '') => {
    try {
      const endpoint = accept ? 'accept' : 'reject';
      await api.patch(`/submissions/${submissionId}/${endpoint}`, { reviewNotes: notes });
      await fetchProjectData();
    } catch (err) {
      alert(`Failed to ${accept ? 'accept' : 'reject'} submission`);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['buyer']}>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['buyer']}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.push('/buyer')} className="text-blue-400 hover:text-blue-300 mb-6">
          ← Back to Dashboard
        </button>

        <div className="glass rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <p className="text-gray-400 mb-6">{project.description}</p>
          <ProjectLifecycle currentStatus={project.status} />
        </div>

        <div className="flex gap-2 mb-6">
          {['overview', 'requests', 'tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Project Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-400">Status</dt>
                <dd className="text-lg font-semibold">{project.status}</dd>
              </div>
              {project.solver_name && (
                <div>
                  <dt className="text-sm text-gray-400">Assigned Solver</dt>
                  <dd className="text-lg font-semibold">🔧 {project.solver_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-400">Created</dt>
                <dd className="text-lg">{format(new Date(project.created_at), 'PPP')}</dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-400">No requests yet</p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-2">🔧 {request.solver_name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{request.solver_email}</p>
                      {request.message && (
                        <p className="text-sm bg-gray-800/50 p-3 rounded-lg">{request.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(request.created_at), 'PPp')}
                      </p>
                    </div>
                    {request.status === 'pending' && project.status === 'open' && (
                      <button
                        onClick={() => acceptRequest(request.id)}
                        className="btn btn-success ml-4"
                      >
                        Accept
                      </button>
                    )}
                    {request.status !== 'pending' && (
                      <span className={`badge ${request.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {request.status}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-400">No tasks created yet</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} onReview={reviewSubmission} />
              ))
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

function TaskCard({ task, onReview }) {
  const [submissions, setSubmissions] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [task.id]);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(`/submissions/task/${task.id}`);
      setSubmissions(response.data.submissions);
    } catch (err) {
      console.error('Failed to load submissions');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-500/20 text-gray-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      submitted: 'bg-purple-500/20 text-purple-400',
      completed: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const latestSubmission = submissions[0];

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold mb-2">{task.title}</h4>
          <p className="text-sm text-gray-400 mb-3">{task.description}</p>
          {task.deadline && (
            <p className="text-xs text-gray-500">
              ⏰ Deadline: {format(new Date(task.deadline), 'PPp')}
            </p>
          )}
        </div>
        <span className={`badge ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>

      {latestSubmission && latestSubmission.status === 'pending_review' && (
        <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg">
          <p className="text-sm font-semibold mb-2">📦 Submission ready for review</p>
          <p className="text-xs text-gray-400 mb-3">File: {latestSubmission.original_filename}</p>
          {latestSubmission.notes && (
            <p className="text-sm bg-gray-800/50 p-2 rounded mb-3">{latestSubmission.notes}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReview(latestSubmission.id, true, '');
              }}
              className="btn btn-success text-sm py-2"
            >
              ✅ Accept
            </button>
            <button
              onClick={() => setShowReview(true)}
              className="btn btn-danger text-sm py-2"
            >
              ❌ Reject
            </button>
          </div>

          {showReview && (
            <div className="mt-3">
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter feedback for rejection..."
                className="input mb-2"
                rows={3}
              />
              <button
                onClick={() => {
                  if (reviewNotes.trim()) {
                    onReview(latestSubmission.id, false, reviewNotes);
                    setShowReview(false);
                    setReviewNotes('');
                  }
                }}
                className="btn btn-danger text-sm py-2"
              >
                Submit Rejection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
