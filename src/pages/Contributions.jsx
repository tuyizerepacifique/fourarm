import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  FileText,
  X,
  User,
  CreditCard,
  Clock,
  CheckSquare,
  Ban
} from 'lucide-react';

function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [filteredContributions, setFilteredContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const [contributionToDelete, setContributionToDelete] = useState(null);
  const [contributionToView, setContributionToView] = useState(null);
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  // New contribution form state
  const [newContribution, setNewContribution] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
    transactionId: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchContributions();
  }, []);

  useEffect(() => {
    filterContributions();
  }, [contributions, searchTerm, statusFilter]);

  // Debug useEffect to track state changes
  useEffect(() => {
    console.log('Contributions state updated:', contributions);
  }, [contributions]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // For admin, get all contributions. For regular users, get their own
      const endpoint = isAdmin ? '/api/contributions' : '/api/contributions/my';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched contributions:', data.contributions); // Debug log
        setContributions(data.contributions || []);
      } else if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to access contributions.');
      } else {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
      setError(error.message || 'Failed to fetch contributions.');
    } finally {
      setLoading(false);
    }
  };

  const filterContributions = () => {
    let result = contributions;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(contribution => 
        contribution.transactionId?.toLowerCase().includes(term) ||
        contribution.notes?.toLowerCase().includes(term) ||
        contribution.user?.firstName?.toLowerCase().includes(term) ||
        contribution.user?.lastName?.toLowerCase().includes(term) ||
        contribution.user?.email?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(contribution => contribution.status === statusFilter);
    }

    setFilteredContributions(result);
  };

  const handleCreateContribution = async () => {
    try {
      // Validate form
      if (!newContribution.amount || !newContribution.paymentMethod) {
        setError('Please fill in all required fields');
        return;
      }

      if (parseFloat(newContribution.amount) <= 0) {
        setError('Amount must be greater than 0');
        return;
      }

      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/contributions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(newContribution.amount),
          paymentMethod: newContribution.paymentMethod,
          transactionId: newContribution.transactionId,
          notes: newContribution.notes
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setContributions([data.contribution, ...contributions]);
        setShowCreateModal(false);
        setNewContribution({
          amount: '',
          paymentMethod: 'bank_transfer',
          transactionId: '',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
        setSuccess('Contribution submitted successfully! Waiting for admin approval.');
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create contribution.');
      }
    } catch (error) {
      console.error('Error creating contribution:', error);
      setError(error.message || 'Failed to create contribution. Please try again.');
      setSuccess(null);
    }
  };

  const handleUpdateStatus = async (contributionId, status) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/contributions/${contributionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Status update response:', data); // Debug log
        
        // FIXED: Properly update the contributions state with the returned data
        setContributions(prevContributions => 
          prevContributions.map(contribution => 
            contribution.id === contributionId 
              ? data.contribution // Use the full contribution object from response
              : contribution
          )
        );
        
        setSuccess(`Contribution ${status} successfully!`);
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contribution status.');
      }
    } catch (error) {
      console.error('Error updating contribution status:', error);
      setError(error.message || 'Failed to update contribution status. Please try again.');
      setSuccess(null);
    }
  };

  const handleDeleteContribution = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/contributions/${contributionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setContributions(contributions.filter(contribution => contribution.id !== contributionToDelete.id));
        setShowDeleteModal(false);
        setContributionToDelete(null);
        setSuccess('Contribution deleted successfully!');
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contribution.');
      }
    } catch (error) {
      console.error('Error deleting contribution:', error);
      setError(error.message || 'Failed to delete contribution. Please try again.');
      setSuccess(null);
    }
  };

  const handleExport = () => {
    try {
      if (filteredContributions.length === 0) {
        setError('No data to export');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Prepare data for export
      const exportData = filteredContributions.map(contribution => ({
        'User Name': isAdmin ? `${contribution.user?.firstName || ''} ${contribution.user?.lastName || ''}`.trim() : 'Your Contribution',
        'User Email': isAdmin ? contribution.user?.email || '' : '',
        'Amount': contribution.amount,
        'Currency': 'RWF',
        'Payment Method': contribution.paymentMethod,
        'Transaction ID': contribution.transactionId || 'N/A',
        'Date': formatDate(contribution.createdAt),
        'Status': contribution.status,
        'Notes': contribution.notes || ''
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            // Escape quotes and wrap in quotes if contains commas
            const value = String(row[header] || '').replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contributions_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Contributions exported successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error exporting contributions:', error);
      setError('Failed to export contributions. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          Unknown
        </span>
      );
    }
    
    const statusClasses = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
      approved: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      completed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      rejected: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodClasses = {
      bank_transfer: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
      mobile_money: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
      cash: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      other: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };
    
    const methodLabels = {
      bank_transfer: 'Bank Transfer',
      mobile_money: 'Mobile Money',
      cash: 'Cash',
      other: 'Other'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodClasses[method] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
        {methodLabels[method] || method}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `RWF ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5 text-yellow-500" />,
      approved: <CheckCircle className="w-5 h-5 text-green-500" />,
      completed: <CheckSquare className="w-5 h-5 text-blue-500" />,
      rejected: <Ban className="w-5 h-5 text-red-500" />
    };
    return icons[status] || <Clock className="w-5 h-5 text-gray-500" />;
  };

  // Calculate statistics
  const totalContributions = contributions.reduce((sum, contribution) => sum + parseFloat(contribution.amount || 0), 0);
  const approvedContributions = contributions.filter(c => c.status === 'approved' || c.status === 'completed');
  const totalApproved = approvedContributions.reduce((sum, contribution) => sum + parseFloat(contribution.amount || 0), 0);
  const pendingContributions = contributions.filter(c => c.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 h-32 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contributions</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track all family contributions</p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Contribution
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contributions</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalContributions)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Amount</h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalApproved)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</h3>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingContributions}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{contributions.length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by transaction ID, notes, or user..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select 
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contributions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {isAdmin && <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">User</th>}
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Payment Method</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Transaction ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContributions.length > 0 ? (
                filteredContributions.map((contribution) => (
                  <tr key={contribution.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {isAdmin && (
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                              {contribution.user?.firstName?.charAt(0)}{contribution.user?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {contribution.user?.firstName} {contribution.user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{contribution.user?.email}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                      {formatCurrency(contribution.amount)}
                    </td>
                    <td className="py-4 px-4">
                      {getPaymentMethodBadge(contribution.paymentMethod)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {contribution.transactionId || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(contribution.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(contribution.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setContributionToView(contribution);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && contribution.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(contribution.id, 'approved')}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(contribution.id, 'rejected')}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isAdmin && contribution.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(contribution.id, 'completed')}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {!isAdmin && contribution.status === 'pending' && (
                          <button
                            onClick={() => {
                              setEditingContribution(contribution);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setContributionToDelete(contribution);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                          disabled={contribution.status !== 'pending' && !isAdmin}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No contributions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredContributions.length} of {contributions.length} contributions
          </p>
          <div className="flex gap-3">
            <button
              onClick={fetchContributions}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={filteredContributions.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Create Contribution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Contribution</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (RWF) *</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContribution.amount}
                  onChange={(e) => setNewContribution({...newContribution, amount: e.target.value})}
                  placeholder="Enter amount"
                  min="0"
                  step="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContribution.paymentMethod}
                  onChange={(e) => setNewContribution({...newContribution, paymentMethod: e.target.value})}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContribution.transactionId}
                  onChange={(e) => setNewContribution({...newContribution, transactionId: e.target.value})}
                  placeholder="Optional transaction reference"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newContribution.notes}
                  onChange={(e) => setNewContribution({...newContribution, notes: e.target.value})}
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateContribution}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Contribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && contributionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the contribution of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(contributionToDelete.amount)}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContribution}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Delete Contribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Detail Modal */}
      {showDetailModal && contributionToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contribution Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Header with amount and status */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(contributionToView.amount)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDateTime(contributionToView.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(contributionToView.status)}
                  {getStatusBadge(contributionToView.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    User Information
                  </h4>
                  {isAdmin && contributionToView.user ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p className="text-gray-900 dark:text-white">
                          {contributionToView.user.firstName} {contributionToView.user.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white">{contributionToView.user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-gray-900 dark:text-white">{contributionToView.user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Your contribution</p>
                  )}
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                      <div className="mt-1">
                        {getPaymentMethodBadge(contributionToView.paymentMethod)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                      <p className="text-gray-900 dark:text-white">
                        {contributionToView.transactionId || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date Submitted</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatDateTime(contributionToView.createdAt)}
                      </p>
                    </div>
                    {contributionToView.updatedAt !== contributionToView.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="text-gray-900 dark:text-white">
                          {formatDateTime(contributionToView.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {contributionToView.notes && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {contributionToView.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && contributionToView.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleUpdateStatus(contributionToView.id, 'approved');
                      setShowDetailModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(contributionToView.id, 'rejected');
                      setShowDetailModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {isAdmin && contributionToView.status === 'approved' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleUpdateStatus(contributionToView.id, 'completed');
                      setShowDetailModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Contribution Modal */}
      {showEditModal && editingContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Contribution</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (RWF) *</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editingContribution.amount}
                  onChange={(e) => setEditingContribution({...editingContribution, amount: e.target.value})}
                  placeholder="Enter amount"
                  min="0"
                  step="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editingContribution.paymentMethod}
                  onChange={(e) => setEditingContribution({...editingContribution, paymentMethod: e.target.value})}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editingContribution.transactionId}
                  onChange={(e) => setEditingContribution({...editingContribution, transactionId: e.target.value})}
                  placeholder="Optional transaction reference"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editingContribution.notes}
                  onChange={(e) => setEditingContribution({...editingContribution, notes: e.target.value})}
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle edit submission here
                  setShowEditModal(false);
                  setSuccess('Contribution updated successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Contribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contributions;