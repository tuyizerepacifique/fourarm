import { useState, useEffect } from 'react';
import {
  PieChart, BarChart3, TrendingUp, Building2,
  Briefcase, Landmark, DollarSign, AlertCircle,
  Plus, Download, Filter, Users, Shield,
  Clock, Eye, EyeOff, RefreshCw, Pencil
} from 'lucide-react';
import { investmentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import InvestmentModal from '../components/InvestmentModal';
import UpdateInvestmentModal from '../components/UpdateInvestmentModal';

// Define the investment types and corresponding icons
const INVESTMENT_TYPES = [
  { id: 'real_estate', label: 'Real Estate', icon: Building2 },
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'small_business', label: 'Business', icon: Briefcase },
  { id: 'fixed_income', label: 'Fixed Income', icon: Landmark },
  { id: 'forex', label: 'Forex', icon: DollarSign },
  { id: 'other', label: 'Other', icon: BarChart3 },
];

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFinancialDetails, setShowFinancialDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [investmentPercentageRule, setInvestmentPercentageRule] = useState(83);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [investmentToUpdate, setInvestmentToUpdate] = useState(null);

  // Get currentUser from the auth context
  const { currentUser, isLoading: isAuthLoading } = useAuth();

  // If currentUser is still loading, show a loading message
  if (isAuthLoading || !currentUser) {
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

  // Define isAdmin after currentUser is confirmed to exist
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const fetchInvestmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [investmentsResponse, statsResponse] = await Promise.all([
        investmentAPI.getAll(),
        investmentAPI.getStats()
      ]);

      if (investmentsResponse.data.success) {
        setInvestments(investmentsResponse.data.investments || []);
      } else {
        setError(investmentsResponse.data.error || 'Failed to fetch investments');
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (error) {
      console.error('Error fetching investment data:', error);
      setError('Failed to load investment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewInvestment = () => {
    const totalInvestedAmount = investments.reduce((sum, inv) => sum + parseFloat(inv.amountInvested || 0), 0);
    const availableForInvestment = stats?.investmentCap - totalInvestedAmount;

    if (isAdmin) {
      if (availableForInvestment > 0) {
        setIsModalOpen(true);
      } else {
        alert('Cannot create a new investment. The total invested amount has reached the 83% cap.');
      }
    } else {
      alert('Only administrators can create new investments. Please contact your family admin.');
    }
  };

  const handleSaveInvestment = async (investmentData) => {
    try {
      const response = await investmentAPI.create(investmentData);
      if (response.data.success) {
        fetchInvestmentData();
        setIsModalOpen(false);
      } else {
        alert('Failed to create investment: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating investment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create investment. Please try again.';
      alert(errorMessage);
    }
  };

  const handleUpdateInvestment = async (updatedData) => {
    try {
      const { id, currentValue } = updatedData;
      const response = await investmentAPI.update(id, { currentValue });
      if (response.data.success) {
        fetchInvestmentData();
        setIsUpdateModalOpen(false);
        setInvestmentToUpdate(null);
      } else {
        alert('Failed to update investment: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating investment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update investment. Please try again.';
      alert(errorMessage);
    }
  };

  const handleRetry = () => {
    fetchInvestmentData();
  };

  const handleExportReport = () => {
    const exportData = investments.map(inv => ({
      Name: inv.name,
      Type: inv.type.replace('_', ' '),
      Category: inv.category,
      'Amount Invested': inv.amountInvested,
      'Current Value': inv.currentValue,
      ROI: `${inv.roi}%`,
      'Expected Return': `${inv.expectedReturnRate}%`,
      'Risk Level': inv.riskLevel.replace('_', ' '),
      Status: inv.status.replace('_', ' '),
      Description: inv.description || '',
      'Created By': inv.creator ? `${inv.creator.firstName} ${inv.creator.lastName}` : 'Unknown',
      'Created At': new Date(inv.createdAt).toLocaleDateString()
    }));

    const headers = Object.keys(exportData[0] || {}).join(',');
    const csvData = exportData.map(row =>
      Object.values(row).map(value =>
        `"${String(value || '').replace(/"/g, '""')}"`
      ).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${csvData}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `investment-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAllocationBreakdown = () => {
    if (!investments.length) return {};

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amountInvested || 0), 0);
    if (totalInvested === 0) return {};

    const breakdown = {};
    investments.forEach(inv => {
      const type = inv.type;
      const amount = parseFloat(inv.amountInvested || 0);
      breakdown[type] = (breakdown[type] || 0) + amount;
    });

    Object.keys(breakdown).forEach(type => {
      breakdown[type] = Math.round((breakdown[type] / totalInvested) * 100);
    });

    return breakdown;
  };

  const allocationBreakdown = getAllocationBreakdown();

  const getFilteredInvestments = () => {
    if (activeTab === 'overview' || activeTab === 'proposals') {
      return investments;
    }
    return investments.filter(inv => inv.type === activeTab);
  };

  const totalInvestedAmount = stats?.totalInvested || investments.reduce((sum, inv) => sum + parseFloat(inv.amountInvested || 0), 0);
  const remainingInvestmentCapacity = Math.max(0, (stats?.investmentCap || 0) - totalInvestedAmount);

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

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Investment Data Error</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    ...INVESTMENT_TYPES,
    ...(isAdmin ? [{ id: 'proposals', label: 'Proposals', icon: Plus }] : [])
  ];

  return (
    <div className="space-y-6 p-6">
      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvestment}
        investmentCap={stats?.investmentCap || 0}
        totalContributions={stats?.totalContributions || 0}
        totalInvestedAmount={totalInvestedAmount}
      />
      {investmentToUpdate && (
        <UpdateInvestmentModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setInvestmentToUpdate(null);
          }}
          investment={investmentToUpdate}
          onUpdate={handleUpdateInvestment}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Family Investments
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Up to {investmentPercentageRule}% of contributions allocated to investments • {100 - investmentPercentageRule}% emergency fund
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isAdmin
                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            }`}>
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3 inline mr-1" />
                  ADMIN VIEW
                </>
              ) : (
                <>
                  <Users className="w-3 h-3 inline mr-1" />
                  MEMBER VIEW
                </>
              )}
            </span>
            {isAdmin && (
              <button
                onClick={handleNewInvestment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Investment
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                RWF {stats?.totalValue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            From {stats?.activeInvestments || 0} investments
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Actual Return</p>
              <p className={`text-2xl font-bold ${
                stats?.actualROI >= 10 ? 'text-green-600 dark:text-green-400' : 
                stats?.actualROI >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {stats?.actualROI?.toFixed(2) || '0'}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expected: {stats?.expectedReturn?.toFixed(2) || '0'}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats?.actualROI >= 10 ? 'Meeting 10% target' : 
             stats?.actualROI >= 0 ? 'Positive but below target' : 'Negative return'}
          </p>
        </div>

        {isAdmin ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    RWF {stats?.totalInvested?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {stats?.totalContributions > 0 ? ((stats.totalInvested / stats.totalContributions) * 100).toFixed(0) : 0}% of contributions
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-60 dark:text-gray-400">Emergency Fund</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    RWF {stats?.emergencyFund?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {100 - investmentPercentageRule}% of contributions
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Investments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.activeInvestments || '0'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Across multiple categories
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Growth</p>
                  <p className={`text-2xl font-bold ${
                    stats?.actualROI >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats?.actualROI >= 0 ? '+' : ''}{stats?.actualROI?.toFixed(2) || '0'}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Year-to-date performance
              </p>
            </div>
          </>
        )}
      </div>

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

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isAdmin && (
                <div className="flex justify-between items-center">
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {`You have `}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      RWF {remainingInvestmentCapacity.toLocaleString()}
                    </span>
                    {` available to invest within the 83% cap.`}
                  </div>
                  <button
                    onClick={() => setShowFinancialDetails(!showFinancialDetails)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {showFinancialDetails ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Financial Details
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show Financial Details
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Portfolio Allocation
                  </h3>
                  {Object.keys(allocationBreakdown).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(allocationBreakdown).map(([type, percentage]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded">
                          <span className="text-sm font-medium capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No investments yet. Allocation will appear here when investments are made.
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Performance vs Target
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Actual Return</span>
                      <span className={`font-bold ${
                        stats?.actualROI >= 10 ? 'text-green-600 dark:text-green-400' : 
                        stats?.actualROI >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stats?.actualROI?.toFixed(2) || '0'}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stats?.actualROI >= 10 ? 'bg-green-500' : 
                          stats?.actualROI >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(Math.abs(stats?.actualROI || 0) * 10, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Target Return</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">10.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Recent Investments
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {investments.length} total investments
                  </span>
                </div>

                {investments.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-lg">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Investments Yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isAdmin ? 'Create your first investment to get started.' : 'No investments have been made yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {investments.slice(0, 5).map((investment) => (
                      <div key={investment.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {investment.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {investment.type.replace('_', ' ')} • {investment.category}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          {showFinancialDetails || !isAdmin ? (
                            <>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  RWF {investment.amountInvested?.toLocaleString()}
                                </p>
                                <p className={`text-sm ${
                                  typeof investment.roi === 'number' && !isNaN(investment.roi)
                                    ? investment.roi >= 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                    : 'text-gray-500' 
                                }`}>
                                  {typeof investment.roi === 'number' && !isNaN(investment.roi)
                                    ? `${investment.roi > 0 ? '+' : ''}${investment.roi.toFixed(2)}% ROI`
                                    : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Current: RWF {investment.currentValue?.toLocaleString()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Click eye icon to view details
                            </p>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setInvestmentToUpdate(investment);
                                setIsUpdateModalOpen(true);
                              }}
                              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                              title="Update Value"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'proposals' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {activeTab.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Investments
              </h3>

              {getFilteredInvestments().length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No {activeTab.replace('_', ' ')} Investments
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isAdmin ? `Create your first ${activeTab.replace('_', ' ')} investment.` : 'No investments in this category yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredInvestments().map((investment) => (
                    <div key={investment.id} className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {investment.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {investment.category} • {investment.status.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Risk: <span className="capitalize">{investment.riskLevel?.replace('_', ' ')}</span>
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              RWF {investment.amountInvested?.toLocaleString()}
                            </p>
                            <p className={`text-sm ${
                              typeof investment.roi === 'number' && !isNaN(investment.roi)
                                ? investment.roi >= 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                                : 'text-gray-500' 
                            }`}>
                              {typeof investment.roi === 'number' && !isNaN(investment.roi)
                                ? `${investment.roi > 0 ? '+' : ''}${investment.roi.toFixed(2)}% ROI`
                                : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Current: RWF {investment.currentValue?.toLocaleString()}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setInvestmentToUpdate(investment);
                                setIsUpdateModalOpen(true);
                              }}
                              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                              title="Update Value"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {investment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          {investment.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'proposals' && isAdmin && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Investment Proposals
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage investment proposals from family members.
              </p>
              <button
                onClick={handleNewInvestment}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create New Proposal
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
    </div>
  );
}