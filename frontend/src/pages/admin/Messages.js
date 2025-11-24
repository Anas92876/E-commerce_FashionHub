import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  InboxIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useConfirm } from '../../hooks/useConfirm';
import { API_URL } from '../../utils/api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyData, setReplyData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const { confirm, ...confirmState } = useConfirm();

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load messages');
      setLoading(false);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);

    if (!message.isRead) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/contact/${message._id}/status`,
          { isRead: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(messages.map(m =>
          m._id === message._id ? { ...m, isRead: true } : m
        ));
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/contact/${messageId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Status updated successfully');
      setMessages(messages.map(m =>
        m._id === messageId ? { ...m, status: newStatus } : m
      ));
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmed = await confirm({
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/contact/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success('Message deleted successfully');
        setMessages(messages.filter(m => m._id !== messageId));
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage(null);
        }
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const handleOpenReplyModal = (message) => {
    setReplyData({
      to: message.email,
      subject: `Re: ${message.subject}`,
      message: `\n\n---\nOriginal Message from ${message.name}:\n${message.message}`
    });
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyData.message.trim()) {
      toast.error('Please write a message');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/contact/${selectedMessage._id}/reply`,
        replyData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Reply sent successfully');
      await handleStatusChange(selectedMessage._id, 'replied');
      setShowReplyModal(false);
      setReplyData({ to: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (statusFilter === 'all') return true;
    return message.status === statusFilter;
  });

  const getStatusConfig = (status) => {
    const configs = {
      new: { color: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/50', icon: SparklesIcon, label: 'New' },
      read: { color: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50', icon: EnvelopeOpenIcon, label: 'Read' },
      replied: { color: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/50', icon: CheckCircleIcon, label: 'Replied' }
    };
    return configs[status] || configs.new;
  };

  const statusOptions = [
    { value: 'all', label: 'All Messages', count: messages.length, gradient: 'from-purple-500 to-indigo-600', icon: InboxIcon },
    { value: 'new', label: 'New', count: messages.filter(m => m.status === 'new').length, gradient: 'from-rose-500 to-pink-600', icon: SparklesIcon },
    { value: 'read', label: 'Read', count: messages.filter(m => m.status === 'read').length, gradient: 'from-blue-500 to-indigo-600', icon: EnvelopeOpenIcon },
    { value: 'replied', label: 'Replied', count: messages.filter(m => m.status === 'replied').length, gradient: 'from-emerald-500 to-green-600', icon: CheckCircleIcon },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            Contact Messages
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Manage customer inquiries and feedback</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          {statusOptions.map((option, index) => {
            const OptionIcon = option.icon;
            return (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden cursor-pointer rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${statusFilter === option.value
                    ? `bg-gradient-to-r ${option.gradient} text-white`
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                onClick={() => setStatusFilter(option.value)}
              >
                <div className="relative z-10 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-2xl sm:text-3xl font-bold ${statusFilter === option.value ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                      {option.count}
                    </div>
                    <OptionIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${statusFilter === option.value ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                  </div>
                  <div className={`text-xs sm:text-sm font-medium ${statusFilter === option.value ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                    {option.label}
                  </div>
                </div>
                {statusFilter === option.value && (
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Messages Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Messages List */}
          <div className="lg:col-span-1 card p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600">
                <InboxIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Inbox</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No messages found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {filteredMessages.map((message, index) => {
                    const statusConfig = getStatusConfig(message.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleViewMessage(message)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedMessage?._id === message._id
                            ? 'border-purple-500 dark:border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 shadow-lg'
                            : !message.isRead
                              ? 'border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 hover:border-rose-300 dark:hover:border-rose-600'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{message.name}</span>
                            {!message.isRead && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg"
                              >
                                NEW
                              </motion.span>
                            )}
                          </div>
                          <StatusIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mb-1">{message.subject}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 break-words overflow-wrap-anywhere">{message.message}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate">{message.email}</span>
                          <span className="flex-shrink-0 ml-2">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2 card p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-1 w-full">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{selectedMessage.subject}</h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${getStatusConfig(selectedMessage.status).color}`}>
                      {React.createElement(getStatusConfig(selectedMessage.status).icon, { className: 'w-4 h-4' })}
                      {getStatusConfig(selectedMessage.status).label}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete Message"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Sender Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                      <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">From</span>
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{selectedMessage.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                      <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">Email</span>
                      <p className="font-semibold text-sm sm:text-base text-blue-600 dark:text-blue-400 truncate">
                        <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                      </p>
                    </div>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                        <PhoneIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">Phone</span>
                        <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{selectedMessage.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                      <CalendarIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">Received</span>
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message:</h3>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap break-words overflow-wrap-anywhere" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{selectedMessage.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage._id, e.target.value)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white font-medium"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenReplyModal(selectedMessage)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                    Reply
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-center py-12">
                <div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                    <EnvelopeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Select a message to view</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">Choose a message from the list to read and manage it</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Reply Modal */}
        <AnimatePresence>
          {showReplyModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setShowReplyModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 overflow-y-auto"
                onClick={() => setShowReplyModal(false)}
              >
                <div className="flex min-h-full items-center justify-center p-4">
                  <motion.div
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-2xl">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Reply to Message</h3>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowReplyModal(false)}
                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </motion.button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4 sm:p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To:</label>
                        <input
                          type="email"
                          value={replyData.to}
                          readOnly
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject:</label>
                        <input
                          type="text"
                          value={replyData.subject}
                          onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
                          className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message:</label>
                        <textarea
                          value={replyData.message}
                          onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
                          rows="8"
                          className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 whitespace-pre-wrap break-words overflow-wrap-anywhere"
                          placeholder="Type your reply here..."
                          style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
                        />
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-2xl">
                      <button
                        onClick={() => setShowReplyModal(false)}
                        disabled={sending}
                        className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSendReply}
                        disabled={sending}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {sending ? (
                          'Sending...'
                        ) : (
                          <>
                            <PaperAirplaneIcon className="w-5 h-5" />
                            Send Reply
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
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

export default Messages;
