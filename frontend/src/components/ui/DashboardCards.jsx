import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line 
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Database,
  Network,
  Clock,
  Cpu,
  Shield,
  UserPlus,
  FileCheck,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';

// StatCard Component
export const StatCard = ({ label, value, icon, trend, trendPositive, progress, subtitle, helpText }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {trend !== undefined && (
        <div className="flex items-center mt-2">
          <span className={`text-${trendPositive ? 'green' : 'red'}-600 dark:text-${trendPositive ? 'green' : 'red'}-400 text-sm font-medium flex items-center`}>
            {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from last month</span>
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{subtitle}</p>}
      {helpText && <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 mt-auto">{helpText}</p>}
    </div>
  );
};

// ProgressBar Component
export const ProgressBar = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

// RecentActivityCard Component
export const RecentActivityCard = ({ activities }) => {
  return (
    <div className="space-y-4">
      {activities.length > 0 ? activities.map((activity, index) => (
        <div key={index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex-shrink-0 mr-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
};

// AdminStatsCard Component
export const AdminStatsCard = ({ label, value, icon, color, helpText, isStatus }) => {
  const colorClasses = {
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
        <div className={`p-2 ${colorClasses[color]} rounded-lg`}>
          {icon}
        </div>
      </div>
      {isStatus ? (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
          {value}
        </span>
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      )}
      {helpText && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 mt-auto">{helpText}</p>}
    </div>
  );
};

// MeetingCard Component
export const MeetingCard = ({ meetingDate }) => {
  const isValidDate = meetingDate && !isNaN(new Date(meetingDate).getTime());
  const isToday = isValidDate && new Date(meetingDate).toDateString() === new Date().toDateString();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Next Meeting
      </h3>
      {isValidDate ? (
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${isToday ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
            <Calendar className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(meetingDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(meetingDate).toLocaleTimeString()}
            </p>
            {isToday && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 mt-2">
                Today
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4 mt-auto">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No meeting scheduled</p>
          <p className="text-xs mt-1">Admin can set meeting date in settings</p>
        </div>
      )}
    </div>
  );
};

// QuickActions Component
export const QuickActions = ({ isAdmin }) => {
  const navigate = useNavigate();

  const adminActions = [
    {
      label: 'Approve Contributions',
      icon: <FileCheck className="w-5 h-5" />,
      onClick: () => navigate('/contributions'),
      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800/30'
    },
    {
      label: 'Manage Users',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: () => navigate('/user-management'),
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30'
    }
  ];

  const memberActions = [
    {
      label: 'Make a Contribution',
      icon: <TrendingUp className="w-5 h-5" />,
      onClick: () => navigate('/contributions'),
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30'
    },
    {
      label: 'View Investments',
      icon: <PieChartIcon className="w-5 h-5" />,
      onClick: () => navigate('/investments'),
      color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/30'
    }
  ];

  const actions = isAdmin ? adminActions : memberActions;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${action.color}`}
          >
            <span className="text-sm font-medium">{action.label}</span>
            {action.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

// InvestmentChart Component with Recharts
export const InvestmentChart = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <LineChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Investment Performance
        </h3>
      </div>
      <div className="h-64">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderColor: '#E5E7EB',
                  borderRadius: '8px',
                  color: '#1F2937'
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No investment data available
          </div>
        )}
      </div>
    </div>
  );
};

// ContributionChart Component
export const ContributionChart = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contribution Trends
        </h3>
      </div>
      <div className="h-64">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderColor: '#E5E7EB',
                  borderRadius: '8px',
                  color: '#1F2937'
                }}
              />
              <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No contribution data available
          </div>
        )}
      </div>
    </div>
  );
};

// SystemHealthCard Component
export const SystemHealthCard = ({ label, status, value, icon }) => {
  const getStatusColor = (status) => {
    if (typeof status === 'string') {
      const statusLower = status.toLowerCase();
      if (statusLower === 'connected' || statusLower === 'active') {
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      }
      if (statusLower === 'warning') {
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      }
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    }
    return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          {value ? (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          )}
        </div>
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
          {icon}
        </div>
      </div>
    </div>
  );
};