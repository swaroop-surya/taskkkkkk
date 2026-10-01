import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/axios';
import { TaskItem, User, EventItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserAvatar } from '../../components/common/UserAvatar';

export const TasksManagement: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [detailsTask, setDetailsTask] = useState<TaskItem | null>(null);
  const [deleteTask, setDeleteTask] = useState<TaskItem | null>(null);

  // Form
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: 2,
    event: null as number | null,
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `/tasks/?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      if (assigneeFilter) url += `&assigned_to=${assigneeFilter}`;

      const [tasksRes, usersRes, eventsRes] = await Promise.all([
        api.get(url),
        api.get('/auth/users/'),
        api.get('/events/'),
      ]);
      setTasks(tasksRes.data.results);
      setUsers(usersRes.data.results);
      setEvents(eventsRes.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, assigneeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks/', form);
      setAddModalOpen(false);
      resetForm();
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create task.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    try {
      await api.patch(`/tasks/${editTask.id}/`, form);
      setEditTask(null);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update task.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      await api.delete(`/tasks/${deleteTask.id}/`);
      setDeleteTask(null);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete task.');
    }
  };

  const openEdit = (task: TaskItem) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      event: task.event,
      deadline: task.deadline.slice(0, 16),
      priority: task.priority,
      status: task.status,
    });
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      assigned_to: users[0]?.id || 2,
      event: null,
      deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
      priority: 'medium',
      status: 'pending',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E252B]">Tasks Management</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Assign operations tasks, set deadlines, link to events, and monitor member execution.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#FDFDFE] p-4 rounded-2xl border border-[#D6D9DF] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8F9192]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks by title or details..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] focus:ring-2 focus:ring-[#3D766D] outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D6D9DF] bg-[#FDFDFE] text-xs text-[#1E252B] outline-hidden"
          >
            <option value="">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.full_name || u.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F3F5] text-[#8F9192] border-b border-[#D6D9DF]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Task Title</th>
                <th className="px-5 py-3.5 font-semibold">Assignee</th>
                <th className="px-5 py-3.5 font-semibold">Associated Event</th>
                <th className="px-5 py-3.5 font-semibold">Priority</th>
                <th className="px-5 py-3.5 font-semibold">Deadline</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D9DF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8F9192]">
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8F9192]">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map(t => (
                  <tr key={t.id} className="hover:bg-[#F0F3F5]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#1E252B] max-w-xs truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-[#8F9192] line-clamp-1 max-w-xs">
                        {t.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={t.assigned_to_details?.full_name || t.assigned_to_details?.username}
                          username={t.assigned_to_details?.username}
                          isStaff={t.assigned_to_details?.is_staff}
                          size="xs"
                        />
                        <span className="font-medium text-[#1E252B]">
                          {t.assigned_to_details?.full_name || t.assigned_to_details?.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#1E252B]">
                      {t.event_details ? (
                        <span className="truncate max-w-[150px] inline-block font-medium text-[#3D766D]">
                          {t.event_details.title}
                        </span>
                      ) : (
                        <span className="text-[#8F9192] italic">Independent</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.priority} type="priority" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-[#1E252B]">
                        <Clock className={`w-3.5 h-3.5 ${t.is_overdue ? 'text-rose-500' : 'text-[#8F9192]'}`} />
                        <span className={t.is_overdue ? 'text-rose-600 font-bold' : ''}>
                          {new Date(t.deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => setDetailsTask(t)}
                        className="p-1.5 text-[#8F9192] hover:text-[#3D766D] rounded-lg hover:bg-[#F0F3F5]"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 text-[#8F9192] hover:text-[#3D766D] rounded-lg hover:bg-[#F0F3F5]"
                        title="Edit Task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTask(t)}
                        className="p-1.5 text-[#8F9192] hover:text-rose-600 rounded-lg hover:bg-[#F0F3F5]"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      {(addModalOpen || editTask) && (
        <Modal
          isOpen={addModalOpen || !!editTask}
          onClose={() => {
            setAddModalOpen(false);
            setEditTask(null);
          }}
          title={editTask ? `Edit Task: ${editTask.title}` : 'Assign New Task'}
          maxWidth="md"
        >
          <form onSubmit={editTask ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Set up audio system for keynote"
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Specific instructions or requirements..."
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Assign To User *</label>
                <select
                  required
                  value={form.assigned_to}
                  onChange={e => setForm({ ...form, assigned_to: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.username} ({u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Associated Event</label>
                <select
                  value={form.event || ''}
                  onChange={e =>
                    setForm({ ...form, event: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
                >
                  <option value="">None (Independent Task)</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Priority *</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Status *</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs cursor-pointer"
              >
                {editTask ? 'Save Changes' : 'Assign Task'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  setEditTask(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Task Details Modal */}
      {detailsTask && (
        <Modal
          isOpen={!!detailsTask}
          onClose={() => setDetailsTask(null)}
          title={`Task: ${detailsTask.title}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <StatusBadge status={detailsTask.status} />
              <StatusBadge status={detailsTask.priority} type="priority" />
              {detailsTask.is_overdue && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF2F2] text-[#9B2C2C]">
                  OVERDUE
                </span>
              )}
            </div>

            {detailsTask.description && (
              <p className="text-[#1E252B] leading-relaxed bg-[#F0F3F5] p-3 rounded-xl border border-[#D6D9DF]">
                {detailsTask.description}
              </p>
            )}

            <div className="space-y-2 border-t border-[#D6D9DF] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Assigned To:</span>
                <span className="font-semibold text-[#1E252B]">
                  {detailsTask.assigned_to_details?.full_name || detailsTask.assigned_to_details?.username}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Event:</span>
                <span className="font-semibold text-[#3D766D]">
                  {detailsTask.event_details?.title || 'None (Independent)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Deadline:</span>
                <span className="font-semibold">
                  {new Date(detailsTask.deadline).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setDetailsTask(null)}
                className="w-full py-2.5 rounded-xl border border-[#D6D9DF] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Task Modal */}
      {deleteTask && (
        <Modal isOpen={!!deleteTask} onClose={() => setDeleteTask(null)} title="Confirm Task Deletion">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Are you sure you want to delete task <strong>{deleteTask.title}</strong>?
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
              >
                Delete Task
              </button>
              <button
                onClick={() => setDeleteTask(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
