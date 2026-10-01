import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit, Trash2, Search, Calendar, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { Category } from '../../types';
import { Modal } from '../../components/common/Modal';

export const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#3D766D',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/categories/?search=${encodeURIComponent(search)}`);
      setCategories(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories/', form);
      setAddModalOpen(false);
      setForm({ name: '', description: '', color: '#3D766D' });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.name?.[0] || 'Failed to create category.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    try {
      await api.patch(`/categories/${editCategory.id}/`, form);
      setEditCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert('Failed to update category.');
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      await api.delete(`/categories/${deleteCategory.id}/`);
      setDeleteCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert('Failed to delete category.');
    }
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description,
      color: cat.color,
    });
  };

  const presetColors = ['#3D766D', '#2D5851', '#4F8A80', '#1E252B', '#8F9192', '#D97706', '#059669', '#DC2626'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E252B] tracking-tight">Categories Management</h1>
          <p className="text-xs sm:text-sm text-[#8F9192] mt-0.5">
            Organize sessions and workshops into searchable taxonomic categories.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', description: '', color: '#3D766D' });
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#FDFDFE] p-4 rounded-2xl border border-[#D6D9DF] shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8F9192]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F3F5] rounded-xl text-xs border border-[#D6D9DF] text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden transition-all"
          />
        </div>
        <div className="text-xs text-[#8F9192]">
          Total Categories: <strong className="text-[#1E252B]">{categories.length}</strong>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-[#EBF3F1]/60 animate-pulse" />
          ))
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              className="bg-[#FDFDFE] rounded-2xl border border-[#D6D9DF] p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1 text-[#8F9192] hover:text-[#3D766D] rounded-md transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCategory(cat)}
                      className="p-1 text-[#8F9192] hover:text-rose-600 rounded-md transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-[#1E252B]">{cat.name}</h3>
                <p className="text-xs text-[#8F9192] mt-1 line-clamp-2">{cat.description || 'No description provided.'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D6D9DF] flex items-center justify-between text-xs text-[#8F9192]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#3D766D]" />
                  <span>{cat.events_count ?? 0} Events linked</span>
                </span>
                <span className="font-mono text-[10px] text-[#8F9192]">{cat.color}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {(addModalOpen || editCategory) && (
        <Modal
          isOpen={addModalOpen || !!editCategory}
          onClose={() => {
            setAddModalOpen(false);
            setEditCategory(null);
          }}
          title={editCategory ? `Edit Category: ${editCategory.name}` : 'Add New Category'}
          maxWidth="sm"
        >
          <form onSubmit={editCategory ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Design & Creative"
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Summary of sessions in this category..."
                className="w-full px-3 py-2 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs text-[#1E252B] focus:ring-2 focus:ring-[#3D766D] focus:bg-[#FDFDFE] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E252B] mb-2">Badge Color</label>
              <div className="flex items-center gap-2 mb-2">
                {presetColors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      form.color === c ? 'scale-125 ring-2 ring-[#3D766D] ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#F0F3F5] border border-[#D6D9DF] rounded-xl text-xs font-mono text-[#1E252B]"
              />
            </div>

            <div className="pt-3 flex gap-3 border-t border-[#D6D9DF]">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#3D766D] hover:bg-[#2D5851] text-[#FDFDFE] font-semibold text-xs shadow-xs transition-colors"
              >
                {editCategory ? 'Save Changes' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  setEditCategory(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B] hover:bg-[#F0F3F5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Category Modal */}
      {deleteCategory && (
        <Modal
          isOpen={!!deleteCategory}
          onClose={() => setDeleteCategory(null)}
          title="Confirm Category Deletion"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Delete category <strong>{deleteCategory.name}</strong>? Linked events will become uncategorized.
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
              >
                Delete Category
              </button>
              <button
                onClick={() => setDeleteCategory(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D6D9DF] text-xs font-semibold text-[#1E252B]"
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
