'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from '@/services/task.service';
import { getProfile, updateProfile } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { isAuthenticated, isLoading, logoutSession } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '' });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });
  const [profileForm, setProfileForm] = useState({ name: '', password: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchTasks = async () => {
    try {
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await getTasks(params);
      if (res.success) {
        setTasks(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success && res.user) {
        setUserProfile(res.user);
        setProfileForm({ name: res.user.name || '', password: '' });
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, page, search, statusFilter]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskForm);
      } else {
        await createTask(taskForm);
      }
      setTaskForm({ title: '', description: '' });
      setIsTaskModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditTask = (task: any) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, description: task.description || '' });
    setIsTaskModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTask(id);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    try {
      const updatePayload: any = {};
      if (profileForm.name && profileForm.name !== userProfile.name) updatePayload.name = profileForm.name;
      if (profileForm.password) updatePayload.password = profileForm.password;

      if (Object.keys(updatePayload).length === 0) {
        setProfileMessage({ type: 'info', text: 'No changes made.' });
        return;
      }

      const res = await updateProfile(updatePayload);
      if (res.success) {
        setUserProfile(res.user);
        setProfileForm({ name: res.user.name, password: '' });
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1400px', margin: '0 auto', overflowX: 'hidden' }}>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 700 }}>TaskFlow</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Welcome, <span style={{ color: 'var(--text-primary)' }}>{userProfile.name || 'User'}</span></span>
          <button onClick={() => { setIsProfileModalOpen(true); setProfileMessage({ type: '', text: '' }); }} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Profile</button>
          <button onClick={logoutSession} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Log Out</button>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          placeholder="Search tasks by title..."
          className="input-field"
          style={{ flex: 1, minWidth: '250px' }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        <select
          className="input-field"
          style={{ width: 'auto', minWidth: '150px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
        >
          <option value="all">All Tasks</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </select>

        <button className="btn-primary" onClick={() => { setEditingTask(null); setTaskForm({ title: '', description: '' }); setIsTaskModalOpen(true); }}>
          + New Task
        </button>
      </motion.div>

      <main>
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}
          >
            <svg style={{ width: '4rem', height: '4rem', margin: '0 auto 1.5rem', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <p style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No tasks found</p>
            <p>Create a new task to get started on your goals!</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}
          >
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-panel glass-panel-hoverable"
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ paddingTop: '0.25rem' }}>
                      <input
                        type="checkbox"
                        checked={task.status}
                        onChange={() => handleToggle(task.id)}
                        style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, flex: 1, textDecoration: task.status ? 'line-through' : 'none', color: task.status ? 'var(--text-secondary)' : 'var(--text-primary)', transition: 'all 0.3s' }}>
                      {task.title}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>{task.description}</p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem', gap: '0.5rem' }}>
                    <button onClick={() => openEditTask(task)} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(task.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', transition: 'var(--transition)' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}
          >
            <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Page <span style={{ color: 'var(--text-primary)' }}>{page}</span> of {totalPages}</span>
            <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', border: '1px solid var(--border-focus)' }}
            >
              <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 700 }}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Task Title (e.g., Update Marketing Deck)"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <textarea
                    className="input-field"
                    placeholder="Task Details and Context..."
                    rows={5}
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingTask ? 'Update Task' : 'Create Task'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', border: '1px solid var(--border-focus)' }}
            >
              <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Edit Profile</h2>

              {profileMessage.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.75rem', borderRadius: '8px',
                    background: profileMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: profileMessage.type === 'error' ? '#ef4444' : '#10b981',
                    border: `1px solid ${profileMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem'
                  }}
                >
                  {profileMessage.text}
                </motion.div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email (Uneditable)</label>
                  <input type="email" className="input-field" value={userProfile.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Change Password (optional)</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Leave blank to keep same"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsProfileModalOpen(false)}>Close</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
