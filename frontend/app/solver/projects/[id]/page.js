'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import Header from '@/components/Layout/Header';
import ProjectLifecycle from '@/components/Projects/ProjectLifecycle';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function SolverProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProjectData();
    }
  }, [params.id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${params.id}`),
        api.get(`/tasks/project/${params.id}`),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error('Failed to load project data');
      router.push('/solver');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await api.post('/tasks', {
        projectId: params.id,
        title: formData.get('title'),
        description: formData.get('description'),
        deadline: formData.get('deadline') || null,
      });
      setShowTaskModal(false);
      await fetchProjectData();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      await fetchProjectData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const uploadSubmission = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!formData.get('file')) {
      alert('Please select a file');
      return;
    }

    try {
      setUploadProgress(10);
      await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
      setUploadProgress(0);
      setShowUploadModal(false);
      setSelectedTask(null);
      await fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload submission');
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['problem_solver']}>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['problem_solver']}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.push('/solver')} className="text-green-400 hover:text-green-300 mb-6">
          ← Back to Dashboard
        </button>

        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <p className="text-gray-400">{project.description}</p>
            </div>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-success ml-4">
              + Add Task
            </button>
          </div>
          <ProjectLifecycle currentStatus={project.status} />
        </div>

        {/* Tasks */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <div className="text-center py-12 glass rounded-xl">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-gray-400 mb-4">Create tasks to organize your work</p>
              <button onClick={() => setShowTaskModal(true)} className="btn btn-success">
                Create First Task
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={updateTaskStatus}
                  onUpload={(task) => {
                    setSelectedTask(task);
                    setShowUploadModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input type="text" name="title" required className="input" placeholder="Enter task title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea name="description" rows={3} className="input" placeholder="Task description" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
                <input type="datetime-local" name="deadline" className="input" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-success flex-1">Create Task</button>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Upload Submission</h2>
            <p className="text-sm text-gray-400 mb-4">Task: {selectedTask.title}</p>
            <form onSubmit={uploadSubmission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ZIP File</label>
                <input type="file" name="file" accept=".zip" required className="input" />
                <input type="hidden" name="taskId" value={selectedTask.id} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea name="notes" rows={3} className="input" placeholder="Add any notes about this submission..." />
              </div>
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={uploadProgress > 0} className="btn btn-success flex-1">
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedTask(null);
                  }}
                  disabled={uploadProgress > 0}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </RoleGuard>
  );
}

function TaskCard({ task, onStatusChange, onUpload }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      submitted: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      completed: 'bg-green-500/20 text-green-400 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[status] || colors.pending;
  };

  const canUpload = task.status === 'in_progress' || task.status === 'rejected';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold mb-2">{task.title}</h4>
          {task.description && <p className="text-sm text-gray-400 mb-2">{task.description}</p>}
          {task.deadline && (
            <p className="text-xs text-gray-500">⏰ {format(new Date(task.deadline), 'PPp')}</p>
          )}
        </div>
        <span className={`badge border ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex gap-2">
        {task.status === 'pending' && (
          <button
            onClick={() => onStatusChange(task.id, 'in_progress')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
          >
            Start Working
          </button>
        )}
        {canUpload && (
          <button
            onClick={() => onUpload(task)}
            className="btn btn-success text-sm py-2"
          >
            📦 Upload Submission
          </button>
        )}
        {task.status === 'submitted' && (
          <span className="text-sm text-purple-400">⏳ Waiting for review...</span>
        )}
        {task.status === 'completed' && (
          <span className="text-sm text-green-400">✅ Completed!</span>
        )}
      </div>
    </motion.div>
  );
}
