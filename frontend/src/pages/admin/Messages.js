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
  InboxIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
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
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

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
      new: { color: 'bg-red-100 text-red-800 border-red-200', icon: EnvelopeIcon, label: 'New' },
      read: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: EnvelopeOpenIcon, label: 'Read' },
      replied: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon, label: 'Replied' }
    };
    return configs[status] || configs.new;
  };

  const statusOptions = [
    { value: 'all', label: 'All Messages', count: messages.length },
    { value: 'new', label: 'New', count: messages.filter(m => m.status === 'new').length },
    { value: 'read', label: 'Read', count: messages.filter(m => m.status === 'read').length },
    { value: 'replied', label: 'Replied', count: messages.filter(m => m.status === 'replied').length },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Contact Messages</h1>
          <p className="text-gray-600">Manage customer inquiries and feedback</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className="card p-4 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setStatusFilter(option.value)}
            >
              <div className="text-2xl font-bold text-gray-900">{option.count}</div>
              <div className="text-sm text-gray-600">{option.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Messages Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Messages List */}
          <div className="lg:col-span-1 card p-4">
            <div className="flex items-center gap-2 mb-4">
              <InboxIcon className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Inbox</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedMessage?._id === message._id
                            ? 'border-primary-500 bg-primary-50'
                            : !message.isRead
                            ? 'border-blue-200 bg-blue-50 hover:border-blue-300'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 truncate">{message.name}</span>
                            {!message.isRead && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <StatusIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 truncate mb-1">{message.subject}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{message.message}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
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
          <div className="lg:col-span-2 card p-6">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusConfig(selectedMessage.status).color}`}>
                      {React.createElement(getStatusConfig(selectedMessage.status).icon, { className: 'w-4 h-4' })}
                      {getStatusConfig(selectedMessage.status).label}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Message"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Sender Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">From</span>
                      <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Email</span>
                      <p className="font-semibold text-primary-600">
                        <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                      </p>
                    </div>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">Phone</span>
                        <p className="font-semibold text-gray-900">{selectedMessage.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Received</span>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Message:</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage._id, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  <button
                    onClick={() => handleOpenReplyModal(selectedMessage)}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                    Reply
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-center py-12">
                <div>
                  <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Select a message to view</p>
                  <p className="text-gray-400 text-sm mt-2">Choose a message from the list to read and manage it</p>
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
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => setShowReplyModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 overflow-y-auto"
                onClick={() => setShowReplyModal(false)}
              >
                <div className="flex min-h-full items-center justify-center p-4">
                  <div
                    className="w-full max-w-2xl bg-white rounded-xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900">Reply to Message</h3>
                      <button
                        onClick={() => setShowReplyModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
                        <input
                          type="email"
                          value={replyData.to}
                          readOnly
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                        <input
                          type="text"
                          value={replyData.subject}
                          onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                        <textarea
                          value={replyData.message}
                          onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
                          rows="10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          placeholder="Type your reply here..."
                        />
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowReplyModal(false)}
                        disabled={sending}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50"
                      >
                        {sending ? (
                          'Sending...'
                        ) : (
                          <>
                            <PaperAirplaneIcon className="w-5 h-5" />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default Messages;
