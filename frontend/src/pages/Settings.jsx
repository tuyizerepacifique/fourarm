import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { settingsAPI, authAPI } from '../services/api';
import { Save, Calendar, Clock, MapPin, List, User, Shield, Bell, Key, Users, Eye, EyeOff } from 'lucide-react';

function Settings() {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [familySettings, setFamilySettings] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Preferences State
  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
    contributionReminders: true,
    meetingReminders: true,
    monthlyReports: true
  });

  // Next Meeting Form State (for Admins)
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    agenda: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
      });
      
      // Load saved notification preferences from backend
      fetchNotificationPreferences();
    }

    if (isAdmin) {
      fetchFamilySettings();
    }
  }, [currentUser, isAdmin]);

  const fetchNotificationPreferences = async () => {
    try {
      // Try to fetch notification preferences from backend
      const response = await settingsAPI.getNotificationPreferences();
      if (response.data.success && response.data.preferences) {
        setNotificationForm(response.data.preferences);
      } else {
        // Fallback to localStorage if backend doesn't have preferences
        const savedNotifications = localStorage.getItem('notificationPreferences');
        if (savedNotifications) {
          setNotificationForm(JSON.parse(savedNotifications));
        }
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      // Fallback to localStorage
      const savedNotifications = localStorage.getItem('notificationPreferences');
      if (savedNotifications) {
        setNotificationForm(JSON.parse(savedNotifications));
      }
    }
  };

  const fetchFamilySettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await settingsAPI.getAll();
      
      // Handle both array and object response formats
      if (response.data.success && response.data.settings) {
        let settingsData = response.data.settings;
        
        // If settings is an array, convert it to object format
        if (Array.isArray(settingsData)) {
          const settingsObj = {};
          settingsData.forEach(setting => {
            settingsObj[setting.key] = {
              value: setting.value,
              description: setting.description,
              id: setting.id
            };
          });
          settingsData = settingsObj;
        }
        
        setFamilySettings(settingsData);
        
        // Extract meeting settings from the formatted settings object
        setMeetingForm({
          title: settingsData.nextMeetingTitle?.value || '',
          date: settingsData.nextMeetingDate?.value || '',
          time: settingsData.nextMeetingTime?.value || '',
          location: settingsData.nextMeetingLocation?.value || '',
          agenda: settingsData.nextMeetingAgenda?.value || ''
        });
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to load settings' });
      }
    } catch (error) {
      console.error('Error fetching family settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to load family settings.' 
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Use the API directly instead of updateProfile from AuthContext if it's not working
      const response = await authAPI.updateProfile(profileForm);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update the current user in context
        if (updateProfile) {
          await updateProfile(profileForm);
        }
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to change password. Please check your current password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Save to backend if available
      try {
        await settingsAPI.updateNotificationPreferences(notificationForm);
      } catch (error) {
        console.warn('Could not save to backend, using localStorage:', error);
        // Fallback to localStorage
        localStorage.setItem('notificationPreferences', JSON.stringify(notificationForm));
      }
      
      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save notification preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await settingsAPI.updateNextMeeting(meetingForm);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Next meeting scheduled successfully! It will appear on all dashboards.' });
        fetchFamilySettings();
      } else {
        setMessage({ type: 'error', text: response.data.error });
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update meeting.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isAdmin ? [{ id: 'family', label: 'Family Settings', icon: Users }] : [])
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and family preferences</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Password Requirements</h4>
                <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                  <li>• Minimum 6 characters</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationSubmit} className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notification Preferences</h4>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white">Email Notifications</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive important updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationForm.emailNotifications}
                      onChange={(e) => setNotificationForm({...notificationForm, emailNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white">Push Notifications</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get instant alerts on your device</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationForm.pushNotifications}
                      onChange={(e) => setNotificationForm({...notificationForm, pushNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white">Contribution Reminders</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reminders for monthly contributions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationForm.contributionReminders}
                      onChange={(e) => setNotificationForm({...notificationForm, contributionReminders: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white">Meeting Reminders</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alerts for upcoming family meetings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationForm.meetingReminders}
                      onChange={(e) => setNotificationForm({...notificationForm, meetingReminders: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white">Monthly Reports</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive monthly family financial reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationForm.monthlyReports}
                      onChange={(e) => setNotificationForm({...notificationForm, monthlyReports: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}

          {/* Family Settings Tab (Admin Only) */}
          {activeTab === 'family' && isAdmin && (
            <div>
              {settingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading settings...</p>
                </div>
              ) : (
                <form onSubmit={handleMeetingSubmit} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Next Family Meeting</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting Title
                    </label>
                    <input
                      type="text"
                      value={meetingForm.title}
                      onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                      placeholder="e.g., Monthly Review & Planning"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={meetingForm.date}
                        onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={meetingForm.time}
                        onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location/Venue
                    </label>
                    <input
                      type="text"
                      value={meetingForm.location}
                      onChange={(e) => setMeetingForm({...meetingForm, location: e.target.value})}
                      placeholder="e.g., Family Home, Google Meet link"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <List className="w-4 h-4 inline mr-1" />
                      Agenda
                    </label>
                    <textarea
                      value={meetingForm.agenda}
                      onChange={(e) => setMeetingForm({...meetingForm, agenda: e.target.value})}
                      placeholder="What will be discussed in the meeting?"
                      rows={4}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Scheduling...' : 'Schedule Meeting'}
                  </button>

                  {/* Display currently set meeting */}
                  {familySettings && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Currently Scheduled Meeting:</h4>
                      {familySettings.nextMeetingTitle?.value ? (
                        <>
                          <p className="text-blue-700 dark:text-blue-300">
                            <strong>{familySettings.nextMeetingTitle.value}</strong> on{' '}
                            {familySettings.nextMeetingDate?.value} at {familySettings.nextMeetingTime?.value}
                          </p>
                          <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                            <strong>Location:</strong> {familySettings.nextMeetingLocation?.value}
                          </p>
                          {familySettings.nextMeetingAgenda?.value && (
                            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                              <strong>Agenda:</strong> {familySettings.nextMeetingAgenda.value}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-blue-700 dark:text-blue-300">No meeting scheduled yet.</p>
                      )}
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;