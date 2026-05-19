import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, UserPlus, Trash2, ArrowLeft, Plus } from 'lucide-react';
import api from '../api/axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchProjectAndUsers();
  }, [id]);

  const fetchProjectAndUsers = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);

      if (currentUser?.role === 'admin') {
        const usersRes = await api.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load project details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.post(`/projects/${id}/members`, { user_id: parseInt(selectedUserId) });
      setSelectedUserId('');
      fetchProjectAndUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProjectAndUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to remove member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskBody = {
        title: taskTitle,
        description: taskDesc,
        status: 'todo',
        due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        assigned_to: taskAssigneeId ? parseInt(taskAssigneeId) : null
      };

      await api.post(`/projects/${id}/tasks`, taskBody);
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskAssigneeId('');
      fetchProjectAndUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to update task status');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this project and all its tasks? This action cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      alert('Project deleted successfully');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectAndUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  };


  if (loading) return <div className="page-container" style={{textAlign: 'center', marginTop: '10vh'}}>Loading Project...</div>;
  if (!project) return <div className="page-container">Project not found</div>;

  const availableUsers = allUsers.filter(
    user => !project.members.some(m => m.id === user.id)
  );

  return (
    <div className="page-container">
      <button onClick={() => navigate('/')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="card glass-panel banner-header">
        <div className="banner-title-row">
          <h1 style={{ margin: 0, fontSize: '2.25rem', color: 'var(--text-main)' }}>{project.name}</h1>
          {isAdmin && (
            <button 
              onClick={handleDeleteProject} 
              className="btn" 
              style={{ 
                background: 'var(--danger)', 
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem' 
              }}
            >
              <Trash2 size={16} /> Delete Project
            </button>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <span>Owner: <strong>{project.owner?.name} ({project.owner?.email})</strong></span>
          <span>Role: <strong style={{color: 'var(--primary)'}}>{project.owner?.role}</strong></span>
        </div>
      </div>

      <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem' }}>Project Team Members</h3>
        
        <div className="members-list">
          {project.members?.map(member => (
            <div key={member.id} className="member-tag">
              <span>{member.name} ({member.role})</span>
              {isAdmin && member.id !== project.owner_id && (
                <button className="remove-member-btn" onClick={() => handleRemoveMember(member.id)} title="Remove Member">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {project.members?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No members added to this project yet.</p>}
        </div>

        {isAdmin && (
          <form onSubmit={handleAddMember} className="add-member-form">
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label>Add Team Member</label>
              <select 
                value={selectedUserId} 
                onChange={e => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">Select a user...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn" disabled={!selectedUserId}>
              <UserPlus size={16} /> Add Member
            </button>
          </form>
        )}

      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Project Tasks ({project.tasks?.length || 0})</h3>
          {isAdmin && (
            <button className="btn" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> Create Task
            </button>
          )}
        </div>

        <div className="task-list">
          {project.tasks?.map(task => {
            const taskIsOverdue = isOverdue(task);
            return (
              <div key={task.id} className="card glass-panel task-row">
                <div className="task-info">
                  <div className="task-row-title">
                    {task.title}
                    {taskIsOverdue && <span className="badge overdue">Overdue</span>}
                    <span className={`badge ${task.status}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                  <p className="task-row-desc">{task.description}</p>
                </div>

                <div className="task-meta">
                  {task.due_date && (
                    <div className={`task-date ${taskIsOverdue ? 'overdue' : ''}`}>
                      <Calendar size={14} />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                  {task.assignee && (
                    <div className="task-assignee">
                      Assignee: {task.assignee.name}
                    </div>
                  )}
                  <div>
                    {task.assigned_to === currentUser?.id ? (
                      <select 
                        value={task.status} 
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', background: 'rgba(30,41,59,0.9)', width: 'auto' }}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <span className={`badge ${task.status}`}>{task.status.replace('_', ' ')}</span>
                    )}
                  </div>

                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="remove-member-btn" 
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: 'var(--danger)', 
                        padding: '0.4rem', 
                        borderRadius: '6px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                      title="Delete Task"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                </div>
              </div>
            );
          })}
          {project.tasks?.length === 0 && (
            <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks found for this project. {isAdmin ? 'Create a task to get started!' : ''}
            </div>
          )}
        </div>
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>

            <h3 style={{ marginBottom: '1.5rem' }}>Create Project Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="E.g., Implement login form" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea required value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Detailed description of what needs to be done..." />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select value={taskAssigneeId} onChange={e => setTaskAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {project.members?.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
