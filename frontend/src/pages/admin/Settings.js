import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'website', name: 'Website', icon: GlobeAltIcon },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your application settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Cobra Fashion Store"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Description
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your store description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="contact@store.com"
                    />
                  </div>
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600" defaultChecked />
                    <span className="text-gray-700">Email notifications for new orders</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600" defaultChecked />
                    <span className="text-gray-700">Email notifications for low stock</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600" />
                    <span className="text-gray-700">SMS notifications for urgent issues</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600" defaultChecked />
                    <span className="text-gray-700">Daily summary reports</span>
                  </label>
                  <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h2>
                <p className="text-gray-600">Configure payment gateway and methods</p>
                <div className="mt-6 space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                    <p className="text-sm text-gray-600 mt-1">Accept payment on delivery</p>
                    <label className="flex items-center gap-2 mt-2">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span className="text-sm text-gray-700">Enabled</span>
                    </label>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900">Stripe Payment</h3>
                    <p className="text-sm text-gray-600 mt-1">Accept credit/debit cards</p>
                    <label className="flex items-center gap-2 mt-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-gray-700">Enabled</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Configuration</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="noreply@store.com"
                    />
                  </div>
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Save Email Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'website' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Website Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://yourstore.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Mode
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-primary-600" />
                      <span className="text-gray-700">Enable maintenance mode</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Temporarily disable the website for maintenance
                    </p>
                  </div>
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Save Website Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
