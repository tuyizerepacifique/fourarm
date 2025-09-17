import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Bell,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { announcementsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await announcementsAPI.getAll();
      
      if (response.data.success) {
        setAnnouncements(response.data.announcements || []);
      } else {
        setError(response.data.error || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (announcementData) => {
    try {
      const response = await announcementsAPI.create(announcementData);
      
      if (response.data.success) {
        fetchAnnouncements();
        setIsCreateModalOpen(false);
      } else {
        alert('Failed to create announcement: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement. Please try again.');
    }
  };

  const handleUpdateAnnouncement = async (announcementData) => {
    try {
      const response = await announcementsAPI.update(editingAnnouncement.id, announcementData);
      
      if (response.data.success) {
        fetchAnnouncements();
        setIsEditModalOpen(false);
        setEditingAnnouncement(null);
      } else {
        alert('Failed to update announcement: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement. Please try again.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await announcementsAPI.delete(id);
      
      if (response.data.success) {
        fetchAnnouncements();
      } else {
        alert('Failed to delete announcement: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement. Please try again.');
    }
  };

  const handleToggleVisibility = async (id, isVisible) => {
    try {
      const response = await announcementsAPI.updateVisibility(id, { isVisible: !isVisible });
      
      if (response.data.success) {
        fetchAnnouncements();
      } else {
        alert('Failed to update visibility: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update visibility. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
        <AnnouncementModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateAnnouncement}
          mode="create"
        />
      )}

      {/* Edit Announcement Modal */}
      {isEditModalOpen && editingAnnouncement && (
        <AnnouncementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAnnouncement(null);
          }}
          onSave={handleUpdateAnnouncement}
          mode="edit"
          announcement={editingAnnouncement}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Announcements
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Important updates and notifications for all family members
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Error</h3>
          </div>
          <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Announcements Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isAdmin ? 'Create your first announcement to share updates with family members.' : 'No announcements have been posted yet.'}
            </p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border-l-4 ${
                announcement.priority === 'high'
                  ? 'border-l-red-500'
                  : announcement.priority === 'medium'
                  ? 'border-l-yellow-500'
                  : 'border-l-blue-500'
              } ${!announcement.isVisible ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    {!announcement.isVisible && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Hidden
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      announcement.priority === 'high'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : announcement.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    }`}>
                      {announcement.priority} priority
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleVisibility(announcement.id, announcement.isVisible)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      title={announcement.isVisible ? 'Hide announcement' : 'Show announcement'}
                    >
                      {announcement.isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAnnouncement(announcement);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700"
                      title="Edit announcement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {announcement.author?.firstName} {announcement.author?.lastName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(announcement.createdAt)}
                  </span>
                </div>
                {announcement.updatedAt !== announcement.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated {formatDate(announcement.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Announcement Modal Component
function AnnouncementModal({ isOpen, onClose, onSave, mode, announcement }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    isVisible: true
  });

  useEffect(() => {
    if (mode === 'edit' && announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'normal',
        isVisible: announcement.isVisible !== undefined ? announcement.isVisible : true
      });
    }
  }, [mode, announcement]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'New Announcement' : 'Edit Announcement'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter announcement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter announcement content..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Visible to members
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4" />
              {mode === 'create' ? 'Create Announcement' : 'Update Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}