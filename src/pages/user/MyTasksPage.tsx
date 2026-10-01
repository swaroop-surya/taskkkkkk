import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Play,
  Check,
  Eye,
  Flag,
} from 'lucide-react';
import api from '../../api/axios';
import { TaskItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [detailsTask, setDetailsTask] = useState<TaskItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      await api.patch(`/tasks/${taskId}/update_status/`, { status: newStatus });
      setActionSuccess(`Task status transitioned to ${newStatus.replace('_', ' ').toUpperCase()}!`);
      fetchTasks();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert('Unable to update task status.');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E252B] tracking-tight">My Assigned Tasks</h1>
        <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
          Track deadlines, review instructions, and transition tasks through the execution lifecycle.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-[#EBF3F1] border border-[#D6D9DF] text-[#2D5851] rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3D766D]" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#EBF3F1] border border-[#D6D9DF] p-1 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          Pending ({tasks.filter(t => t.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'in_progress'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          In Progress ({tasks.filter(t => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#3D766D] text-[#FDFDFE] shadow-2xs'
              : 'text-[#8F9192] hover:text-[#1E252B]'
          }`}
        >
          Completed ({tasks.filter(t => t.status === 'completed').length})
        </button>
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-[#EBF3F1]/60 animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF]">
          <CheckSquare className="w-12 h-12 text-[#BDC2C7] mx-auto mb-3" />
          <h3 className="font-semibold text-[#1E252B]">No tasks in this category</h3>
          <p className="text-xs text-[#8F9192] mt-1">Check other tabs or ask an admin for task assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={task.priority} type="priority" />
                  <StatusBadge status={task.status} />
                </div>

                <h3 className="font-bold text-base text-[#1E252B] line-clamp-1">
                  {task.title}
                </h3>
                <p className="text-xs text-[#8F9192] mt-1 line-clamp-2">
                  {task.description || 'No additional instructions.'}
                </p>

                <div className="space-y-1.5 mt-3 pt-3 border-t border-[#D6D9DF] text-xs text-[#8F9192]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${task.is_overdue ? 'text-rose-500' : 'text-[#8F9192]'}`} />
                      <span className={task.is_overdue ? 'text-rose-600 font-bold' : ''}>
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </span>
                    {task.event_details && (
                      <span className="text-[#3D766D] font-medium truncate max-w-[150px]">
                        {task.event_details.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update Stepper: Pending -> In Progress -> Completed */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#D6D9DF]">
                <button
                  onClick={() => setDetailsTask(task)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8F9192] hover:text-[#3D766D] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EBF3F1] hover:bg-[#3D766D] text-[#3D766D] hover:text-[#FDFDFE] border border-[#D6D9DF] font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Task</span>
                    </button>
                  )}

                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Complete</span>
                    </button>
                  )}

                  {task.status === 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className="text-[11px] text-[#8F9192] hover:text-[#1E252B] underline"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {detailsTask && (
        <Modal
          isOpen={!!detailsTask}
          onClose={() => setDetailsTask(null)}
          title={`Task: ${detailsTask.title}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6D9DF]">
              <StatusBadge status={detailsTask.priority} type="priority" />
              <StatusBadge status={detailsTask.status} />
            </div>

            {detailsTask.description && (
              <div className="p-3 bg-[#F0F3F5] rounded-xl border border-[#D6D9DF]">
                <span className="font-semibold block mb-1 text-[#8F9192]">Instructions:</span>
                <p className="text-[#1E252B] leading-relaxed">
                  {detailsTask.description}
                </p>
              </div>
            )}

            <div className="space-y-2 border-t border-[#D6D9DF] pt-3 text-[#1E252B]">
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Associated Event:</span>
                <span className="font-semibold text-[#3D766D]">
                  {detailsTask.event_details?.title || 'None (Independent Task)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8F9192]">Due Deadline:</span>
                <span className={`font-semibold ${detailsTask.is_overdue ? 'text-rose-600' : ''}`}>
                  {new Date(detailsTask.deadline).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailsTask(null)}
                className="px-4 py-2 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
