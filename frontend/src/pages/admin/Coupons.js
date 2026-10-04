import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PencilIcon, TrashIcon, TicketIcon, PlusIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useConfirm } from '../../hooks/useConfirm';
import { API_URL } from '../../utils/api';

const EMPTY_FORM = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
};

// ISO timestamp -> value for <input type="date"> (and back)
const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
const endOfDay = (date) => (date ? new Date(`${date}T23:59:59`).toISOString() : null);

const formatDiscount = (c) =>
  c.discountType === 'percent' ? `${Number(c.discountValue)}% off` : `$${Number(c.discountValue).toFixed(2)} off`;

// Status shown in the list; icon + text, never color alone
const couponStatus = (c) => {
  if (!c.isActive) return { label: 'Disabled', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: '⏸' };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { label: 'Expired', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: '⌛' };
  if (c.maxUses && c.usedCount >= c.maxUses) return { label: 'Used up', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: '✓' };
  return { label: 'Active', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: '●' };
};

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, ...confirmState } = useConfirm();

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/coupons`);
      setCoupons(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      expiresAt: toDateInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      expiresAt: endOfDay(form.expiresAt),
      maxUses: form.maxUses || null,
      minOrderAmount: form.minOrderAmount || 0,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/coupons/${editingId}`, payload);
        toast.success('Coupon updated');
      } else {
        await axios.post(`${API_URL}/coupons`, payload);
        toast.success(`Coupon ${payload.code} created`);
      }
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await axios.put(`${API_URL}/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? 'Coupon disabled' : 'Coupon enabled');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleDelete = async (coupon) => {
    const confirmed = await confirm({
      title: 'Delete Coupon',
      message: `Delete coupon "${coupon.code}"? Customers will no longer be able to use it. Past orders keep their discount.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/coupons/${coupon._id}`);
      toast.success('Coupon deleted');
      if (editingId === coupon._id) resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Coupons</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Create discount codes customers can enter at checkout.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4 h-fit">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {editingId ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
              {editingId ? 'Edit coupon' : 'New coupon'}
            </h2>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
              <input id="code" required value={form.code} onChange={set('code')} placeholder="SUMMER20"
                pattern="[A-Za-z0-9_\-]{3,30}" title="3-30 letters, numbers, - or _"
                className={`${inputClass} uppercase font-mono`} />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input id="description" value={form.description} onChange={set('description')} placeholder="Summer sale" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                <select id="discountType" value={form.discountType} onChange={set('discountType')} className={inputClass}>
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
              </div>
              <div>
                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {form.discountType === 'percent' ? 'Percent *' : 'Amount ($) *'}
                </label>
                <input id="discountValue" required type="number" min="0.01" step="0.01"
                  max={form.discountType === 'percent' ? 100 : undefined}
                  value={form.discountValue} onChange={set('discountValue')} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. order ($)</label>
                <input id="minOrderAmount" type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={set('minOrderAmount')} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max uses</label>
                <input id="maxUses" type="number" min="1" step="1" value={form.maxUses} onChange={set('maxUses')} placeholder="Unlimited" className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires on</label>
              <input id="expiresAt" type="date" value={form.expiresAt} onChange={set('expiresAt')} className={inputClass} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty for no expiry. Valid until the end of that day.</p>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="rounded text-primary-600" />
              Active
            </label>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create coupon'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center"><LoadingSpinner /></div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-16 px-4">
                <TicketIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">No coupons yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create your first discount code with the form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {['Code', 'Discount', 'Min. order', 'Used', 'Expires', 'Status', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {coupons.map((c) => {
                      const status = couponStatus(c);
                      return (
                        <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-mono font-semibold text-gray-900 dark:text-white">{c.code}</p>
                            {c.description && <p className="text-xs text-gray-500 dark:text-gray-400">{c.description}</p>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDiscount(c)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {Number(c.minOrderAmount) > 0 ? `$${Number(c.minOrderAmount).toFixed(2)}` : '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button onClick={() => toggleActive(c)} title={c.isActive ? 'Click to disable' : 'Click to enable'}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                              <span aria-hidden="true">{status.icon}</span> {status.label}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <button onClick={() => startEdit(c)} aria-label={`Edit ${c.code}`}
                              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(c)} aria-label={`Delete ${c.code}`}
                              className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={confirmState.isOpen}
          onClose={confirmState.close}
          onConfirm={confirmState.handleConfirm}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          variant={confirmState.variant}
        />
      </div>
    </AdminLayout>
  );
};

export default Coupons;
