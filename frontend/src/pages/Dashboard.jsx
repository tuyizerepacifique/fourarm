import { useState, useEffect } from 'react';
import { 
  StatCard, 
  ProgressBar, 
  RecentActivityCard, 
  AdminStatsCard,
  MeetingCard,
  QuickActions,
  ContributionChart,
  SystemHealthCard
} from "../components/ui/DashboardCards";
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import { 
  AlertCircle, 
  RefreshCw, 
  Users, 
  Shield, 
  TrendingUp,
  Calendar,
  UserPlus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Cpu,
  Network,
  Mail
} from 'lucide-react';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, logout } = useAuth();

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const isMember = currentUser?.role?.toLowerCase() === 'member' || !isAdmin;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getDashboard();
      
      if (response.data.success) {
        console.log('Dashboard data received:', response.data);
        setDashboardData(response.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.error || error.message || 'Backend server is not available.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    window.location.href = '/login';
  };

  const handleRetry = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      fetchDashboardData();
    }
  };

  // Safe formatting functions
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'RWF 0';
    return `RWF ${Number(value).toLocaleString()}`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString();
  };

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return 'Not scheduled';
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    return new Date(date).toLocaleTimeString();
  };

  // Format email to handle overflow
  const formatEmail = (email) => {
    if (!email) return '';
    return email;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 h-32 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mx-6 my-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Authentication Error</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <div className="flex gap-3">
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mx-6 my-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 text-blue-600 mb-4">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <h3 className="text-lg font-semibold">Loading Dashboard Data</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we load your dashboard information...</p>
      </div>
    );
  }

  // Extract data with proper fallbacks
  const { 
    myContributions,
    myContributionsGrowth,
    familyFund,
    familyFundGrowth,
    paidCount,
    totalMembers,
    nextMeeting, 
    recentActivity = [],
    pendingApprovals,
    totalContributions,
    recentRegistrations = [],
    systemHealth,
    contributionData = []
  } = dashboardData;

  // Calculate values with proper fallbacks - handle null values from API
  const safeMyContributions = myContributions !== undefined && myContributions !== null ? myContributions : 0;
  const safeMyContributionsGrowth = myContributionsGrowth !== undefined && myContributionsGrowth !== null ? myContributionsGrowth : 0;
  const safeFamilyFund = familyFund !== undefined && familyFund !== null ? familyFund : 0;
  const safeFamilyFundGrowth = familyFundGrowth !== undefined && familyFundGrowth !== null ? familyFundGrowth : 0;
  const safePaidCount = paidCount !== undefined && paidCount !== null ? paidCount : 0;
  const safeTotalMembers = totalMembers !== undefined && totalMembers !== null ? totalMembers : 1;
  const safePendingApprovals = pendingApprovals !== undefined && pendingApprovals !== null ? pendingApprovals : 0;
  const safeTotalContributions = totalContributions !== undefined && totalContributions !== null ? totalContributions : 0;

  // Calculate payment progress
  const paymentProgress = safeTotalMembers > 0 ? Math.round((safePaidCount / safeTotalMembers) * 100) : 0;

  // Sample data for development if no contribution data is available
  const sampleContributionData = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 15000 },
    { month: 'Mar', amount: 18000 },
    { month: 'Apr', amount: 22000 },
    { month: 'May', amount: 25000 },
    { month: 'Jun', amount: 28000 }
  ];

  // Use sample data if no real data is available (for development)
  const displayContributionData = contributionData && contributionData.length > 0 ? contributionData : sampleContributionData;

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {currentUser?.firstName} {currentUser?.lastName}!
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isAdmin 
              ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' 
              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          }`}>
            {isAdmin ? (
              <>
                <Shield className="w-3 h-3 inline mr-1" />
                ADMINISTRATOR
              </>
            ) : (
              <>
                <Users className="w-3 h-3 inline mr-1" />
                MEMBER
              </>
            )}
          </span>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm email-text">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="email-text break-words">{currentUser?.email}</span>
          </div>
          <span className="hidden sm:inline text-gray-400 text-sm">•</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
        {/* Show My Contributions card for members only */}
        {isMember && (
          <StatCard
            label="My Contributions"
            value={formatCurrency(safeMyContributions)}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={safeMyContributionsGrowth}
            trendPositive={safeMyContributionsGrowth >= 0}
            helpText="Your total approved contributions"
          />
        )}
        
        <StatCard
          label="Family Fund"
          value={formatCurrency(safeFamilyFund)}
          icon={<Users className="w-5 h-5" />}
          trend={safeFamilyFundGrowth}
          trendPositive={safeFamilyFundGrowth >= 0}
          helpText="Total fund value with growth trend"
        />
        
        <StatCard
          label="Payment Progress"
          value={`${safePaidCount}/${safeTotalMembers}`}
          icon={<CheckCircle className="w-5 h-5" />}
          progress={paymentProgress}
          helpText="Members who have completed payments"
        />
        
        <StatCard
          label="Next Meeting"
          value={formatDate(nextMeeting)}
          icon={<Calendar className="w-5 h-5" />}
          subtitle={formatTime(nextMeeting)}
          helpText="Upcoming family meeting"
        />
      </div>

      {/* Admin Specific Stats */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminStatsCard
              label="Pending Approvals"
              value={safePendingApprovals}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="yellow"
              helpText="Contributions awaiting approval"
            />
            
            <AdminStatsCard
              label="Total Contributions"
              value={formatNumber(safeTotalContributions)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
              helpText="All contributions including pending"
            />
            
            <AdminStatsCard
              label="Active Members"
              value={safeTotalMembers}
              icon={<Users className="w-5 h-5" />}
              color="green"
              helpText="Total number of family members"
            />
          </div>

          {/* System Health */}
          {systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SystemHealthCard
                label="Database"
                status={systemHealth.database}
                icon={<Database className="w-5 h-5" />}
              />
              <SystemHealthCard
                label="API Status"
                status={systemHealth.api}
                icon={<Network className="w-5 h-5" />}
              />
              <SystemHealthCard
                label="System Uptime"
                value={`${Math.floor(systemHealth.uptime / 3600)}h`}
                icon={<Clock className="w-5 h-5" />}
              />
              <SystemHealthCard
                label="Memory Usage"
                value={`${Math.round(systemHealth.memoryUsage.heapUsed / 1024 / 1024)}MB`}
                icon={<Cpu className="w-5 h-5" />}
              />
            </div>
          )}
        </>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contribution Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contribution Progress
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{paymentProgress}%</span>
            </div>
            <ProgressBar value={paymentProgress} />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{safePaidCount} paid</span>
              <span>{safeTotalMembers} total</span>
            </div>
          </div>
        </div>

        <MeetingCard meetingDate={nextMeeting} />
        
        {/* Additional stats card to fill the space */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Members</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {safeTotalMembers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fund Growth</span>
              <span className={`text-sm font-medium ${
                safeFamilyFundGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {safeFamilyFundGrowth >= 0 ? '+' : ''}{safeFamilyFundGrowth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            {/* Display next meeting details if available */}
            {nextMeeting && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Meeting</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(nextMeeting)} {formatTime(nextMeeting)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contribution Chart with proper handling */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contribution Trends
            </h3>
            {displayContributionData && displayContributionData.length > 0 ? (
              <ContributionChart data={displayContributionData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No contribution data available</p>
                <p className="text-sm mt-2">Contribution data will appear here once available</p>
              </div>
            )}
          </div>
          
          {/* Additional admin stats card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Admin Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {safePendingApprovals}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Contributions</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {safeTotalContributions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Payment Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {paymentProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{recentActivity.length} activities</span>
          </div>
          <RecentActivityCard activities={recentActivity} />
        </div>

        {/* Quick Actions and Recent Registrations */}
        <div className="space-y-6">
          <QuickActions isAdmin={isAdmin} />
          
          {isAdmin && recentRegistrations && recentRegistrations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Registrations
                </h3>
              </div>
              <div className="space-y-3">
                {recentRegistrations.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 email-text break-words">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' 
                          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;