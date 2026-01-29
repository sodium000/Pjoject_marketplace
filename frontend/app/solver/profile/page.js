'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import Header from '@/components/Layout/Header';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function SolverProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    experience: '',
    portfolio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        bio: userData.profile_info?.bio || '',
        skills: userData.profile_info?.skills || '',
        experience: userData.profile_info?.experience || '',
        portfolio: userData.profile_info?.portfolio || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch('/users/me', {
        name: formData.name,
        profile_info: {
          bio: formData.bio,
          skills: formData.skills,
          experience: formData.experience,
          portfolio: formData.portfolio,
        },
      });
      alert('Profile updated successfully!');
      await fetchProfile();
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['problem_solver']}>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['problem_solver']}>
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your professional information</p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="glass rounded-2xl p-8space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input bg-gray-800/50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="input"
              placeholder="Tell buyers about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              rows={3}
              className="input"
              placeholder="e.g., JavaScript, Python, React, Node.js, MongoDB..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              rows={3}
              className="input"
              placeholder="Describe your relevant experience..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Portfolio / Website</label>
            <input
              type="url"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
              className="input"
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/solver')}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </div>
    </RoleGuard>
  );
}
