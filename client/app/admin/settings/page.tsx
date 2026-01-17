'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PackageSchedule {
  packageId: string;
  packageName: string;
  schedule: {
    type: 'days_of_month' | 'day_of_week';
    values: number[];
    enabled: boolean;
  } | null;
}

export default function SettingsPage() {
  const { user, admin, loading: authLoading } = useAuth();
  const { confirm } = useConfirm();
  
  // Trigger Daily Calculations
  const [cronLoading, setCronLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Flush Investments
  const [flushLoading, setFlushLoading] = useState(false);
  const [flushTransactionsLoading, setFlushTransactionsLoading] = useState(false);
  const [flushUserDataLoading, setFlushUserDataLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment Gateway Settings
  const [nowpaymentsEnabled, setNowpaymentsEnabled] = useState<boolean | null>(null);
  const [nowpaymentsLoading, setNowpaymentsLoading] = useState(false);
  
  // Auth Rate Limiting
  const [rateLimitingEnabled, setRateLimitingEnabled] = useState<boolean | null>(null);
  const [rateLimitingLoading, setRateLimitingLoading] = useState(false);
  
  // Deactivate All Users
  const [deactivateAllLoading, setDeactivateAllLoading] = useState(false);
  
  // ROI Withdrawal Schedules
  const [packages, setPackages] = useState<PackageSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    type: 'days_of_month' | 'day_of_week';
    values: number[];
    enabled: boolean;
  }>({
    type: 'days_of_month',
    values: [],
    enabled: true,
  });

  useEffect(() => {
    const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CNEOX-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      fetchNOWPaymentsStatus();
      fetchRateLimitingStatus();
      fetchSchedules();
    }
  }, [user, admin]);

  // Check job status
  const checkJobStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await api.getLatestCalculationJob();
      if (response.data) {
        setJobStatus(response.data);
        
        // Stop polling if job is completed or failed
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
    } catch (err: any) {
      console.error('Error checking job status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Trigger Daily Calculations
  const handleTriggerCron = async () => {
    const confirmed = await confirm({
      title: 'Trigger Daily Calculations',
      message: 'Are you sure you want to trigger the daily calculations (ROI, Binary, Referral)?\n\nThis will start a background job that processes calculations. You can check the status below.',
      variant: 'info',
      confirmText: 'Yes, Trigger',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setCronLoading(true);
      const response = await api.triggerDailyCalculations({
        includeROI: true,
        includeBinary: true,
        includeReferral: true,
      });
      
      if (response.data) {
        toast.success('Daily calculations started in background! Processing will continue...', { duration: 5000 });
        setJobStatus({
          _id: response.data.jobId,
          status: response.data.status,
          startedAt: response.data.startedAt,
          processedItems: 0,
          totalItems: 0,
        });
        
        // Clear any existing polling interval
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        
        // Start polling for status updates
        const interval = setInterval(async () => {
          try {
            const latestResponse = await api.getLatestCalculationJob();
            if (latestResponse.data) {
              setJobStatus(latestResponse.data);
              
              if (latestResponse.data.status === 'completed' || latestResponse.data.status === 'failed') {
                clearInterval(interval);
                setPollingInterval(null);
                if (latestResponse.data.status === 'completed') {
                  toast.success('Daily calculations completed successfully!', { duration: 5000 });
                } else if (latestResponse.data.status === 'failed') {
                  toast.error('Daily calculations failed. You can resume the job.', { duration: 5000 });
                }
              }
            }
          } catch (err) {
            console.error('Error checking job status:', err);
          }
        }, 5000); // Check every 5 seconds
        
        setPollingInterval(interval);
        
        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(interval);
          setPollingInterval(null);
        }, 600000);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger daily calculations');
      console.error('Error triggering cron:', err);
    } finally {
      setCronLoading(false);
    }
  };

  // Resume failed job
  const handleResumeJob = async (jobId: string) => {
    const confirmed = await confirm({
      title: 'Resume Calculation Job',
      message: 'Are you sure you want to resume this calculation job? It will continue from where it left off.',
      variant: 'info',
      confirmText: 'Yes, Resume',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setCronLoading(true);
      const response = await api.resumeCalculationJob(jobId);
      if (response.data) {
        toast.success('Calculation job resumed! Processing will continue...', { duration: 5000 });
        setJobStatus(response.data);
        
        // Clear any existing polling interval
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        
        // Start polling for status updates
        const interval = setInterval(async () => {
          try {
            const latestResponse = await api.getLatestCalculationJob();
            if (latestResponse.data) {
              setJobStatus(latestResponse.data);
              
              if (latestResponse.data.status === 'completed' || latestResponse.data.status === 'failed') {
                clearInterval(interval);
                setPollingInterval(null);
                if (latestResponse.data.status === 'completed') {
                  toast.success('Daily calculations completed successfully!', { duration: 5000 });
                } else if (latestResponse.data.status === 'failed') {
                  toast.error('Daily calculations failed. You can resume the job.', { duration: 5000 });
                }
              }
            }
          } catch (err) {
            console.error('Error checking job status:', err);
          }
        }, 5000);
        
        setPollingInterval(interval);
        setTimeout(() => {
          clearInterval(interval);
          setPollingInterval(null);
        }, 600000);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resume calculation job');
      console.error('Error resuming job:', err);
    } finally {
      setCronLoading(false);
    }
  };

  // Check status on mount and when user/admin changes
  useEffect(() => {
    const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CNEOX-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      checkJobStatus();
    }
    
    // Cleanup polling interval on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [user, admin]);

  // Flush All Investments
  const handleFlushInvestments = async () => {
    const confirmed = await confirm({
      title: '⚠️ WARNING: Flush All Investments',
      message: 'This will permanently delete ALL investments and related data for ALL users!\n\n' +
        'This action will:\n' +
        '• Delete all investments\n' +
        '• Delete all ROI, Binary, Referral, and Investment transactions\n' +
        '• Reset ROI, Binary, Referral, and Investment wallet balances to zero\n' +
        '• Reset all binary tree business volumes to zero\n\n' +
        'Users will NOT be deleted, but all their investment data will be lost.\n\n' +
        'This action CANNOT be undone. Are you absolutely sure?',
      variant: 'danger',
      confirmText: 'Yes, Flush All',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setFlushLoading(true);
      setError('');
      const response = await api.flushAllInvestments();
      
      if (response.data) {
        toast.success(
          `All investments flushed successfully! Investments deleted: ${response.data.investmentsDeleted}, Transactions deleted: ${response.data.transactionsDeleted}`,
          { duration: 5000 }
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to flush investments');
      toast.error(err.message || 'Failed to flush investments');
      console.error('Error flushing investments:', err);
    } finally {
      setFlushLoading(false);
    }
  };

  // Flush All User Data (Reset for Testing)
  const handleFlushUserData = async () => {
    const confirmed = await confirm({
      title: '⚠️ WARNING: Flush All User Data',
      message: 'This will reset ALL user data to zero for testing purposes!\n\n' +
        'This action will:\n' +
        '• Reset BinaryTree: Left Business, Right Business, Left Carry, Right Carry, Matching Due\n' +
        '• Reset all wallet balances: ROI, Binary, Referral, Investment, Career Level\n' +
        '• Reset Career Level progress for all users\n' +
        '• Delete all Investments\n' +
        '• Delete all Transactions/Reports\n' +
        '• Delete all Payment history\n\n' +
        'PRESERVED (NOT DELETED):\n' +
        '• User accounts (users remain)\n' +
        '• Binary tree structure (parent/child relationships)\n' +
        '• Vouchers\n' +
        '• Referrals (referrer relationships)\n\n' +
        'This action CANNOT be undone. Are you absolutely sure?',
      variant: 'danger',
      confirmText: 'Yes, Flush All User Data',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setFlushUserDataLoading(true);
      setError('');
      const response = await api.flushAllUserData();
      
      if (response.data) {
        toast.success(
          `All user data flushed successfully! ` +
          `Binary Trees: ${response.data.binaryTreesReset}, ` +
          `Wallets: ${response.data.walletsReset}, ` +
          `Career Progress: ${response.data.careerProgressReset}, ` +
          `Investments: ${response.data.investmentsDeleted}, ` +
          `Transactions: ${response.data.transactionsDeleted}`,
          { duration: 8000 }
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to flush user data');
      toast.error(err.message || 'Failed to flush user data');
      console.error('Error flushing user data:', err);
    } finally {
      setFlushUserDataLoading(false);
    }
  };

  // Flush All Transactions
  const handleFlushTransactions = async () => {
    const confirmed = await confirm({
      title: '⚠️ WARNING: Flush All Transactions',
      message: 'This will permanently delete ALL transactions and NOWPayments history!\n\n' +
        'This action will:\n' +
        '• Delete all ROI transactions\n' +
        '• Delete all Binary bonus transactions\n' +
        '• Delete all Referral bonus transactions\n' +
        '• Delete all Investment transactions\n' +
        '• Delete all NOWPayments payment history\n\n' +
        'Users, investments, and wallet balances will NOT be affected.\n' +
        'Only transaction records will be deleted.\n\n' +
        'This action CANNOT be undone. Are you absolutely sure?',
      variant: 'danger',
      confirmText: 'Yes, Flush All',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setFlushTransactionsLoading(true);
      setError('');
      const response = await api.flushAllInvestments();
      
      if (response.data) {
        toast.success(
          `All transactions flushed successfully! Transactions deleted: ${response.data.transactionsDeleted}`,
          { duration: 5000 }
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to flush transactions');
      toast.error(err.message || 'Failed to flush transactions');
      console.error('Error flushing transactions:', err);
    } finally {
      setFlushTransactionsLoading(false);
    }
  };

  // Payment Gateway Settings
  const fetchNOWPaymentsStatus = async () => {
    try {
      const response = await api.getNOWPaymentsStatus();
      if (response.data) {
        setNowpaymentsEnabled(response.data.enabled);
      }
    } catch (err: any) {
      console.error('Error fetching NOWPayments status:', err);
      setNowpaymentsEnabled(true);
    }
  };

  const handleToggleNOWPayments = async () => {
    if (nowpaymentsEnabled === null) return;

    const newStatus = !nowpaymentsEnabled;
    const confirmed = await confirm({
      title: newStatus ? 'Enable NOWPayments Gateway' : 'Disable NOWPayments Gateway',
      message: newStatus
        ? 'Are you sure you want to enable NOWPayments gateway? Users will be able to make real payments.'
        : 'Are you sure you want to disable NOWPayments gateway? Users will not be able to make payments until it is re-enabled.',
      variant: 'warning',
      confirmText: newStatus ? 'Yes, Enable' : 'Yes, Disable',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setNowpaymentsLoading(true);
      const response = await api.updateNOWPaymentsStatus(newStatus);
      if (response.data) {
        setNowpaymentsEnabled(response.data.enabled);
        toast.success(`NOWPayments gateway ${newStatus ? 'enabled' : 'disabled'} successfully!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update NOWPayments status');
      console.error('Error updating NOWPayments status:', err);
    } finally {
      setNowpaymentsLoading(false);
    }
  };

  // Auth Rate Limiting
  const fetchRateLimitingStatus = async () => {
    try {
      setRateLimitingLoading(true);
      const response = await api.getAuthRateLimitingStatus();
      if (response.data) {
        setRateLimitingEnabled(response.data.enabled);
      }
    } catch (err: any) {
      console.error('Failed to fetch rate limiting status:', err);
      setRateLimitingEnabled(true);
    } finally {
      setRateLimitingLoading(false);
    }
  };

  const handleToggleRateLimiting = async () => {
    if (rateLimitingEnabled === null) return;

    const newStatus = !rateLimitingEnabled;
    const confirmed = await confirm({
      title: newStatus ? 'Enable Rate Limiting' : 'Disable Rate Limiting',
      message: newStatus
        ? 'Are you sure you want to enable rate limiting? This will restrict signup/login attempts per IP (30 per 15 minutes).'
        : 'Are you sure you want to disable rate limiting? Leaders will be able to create multiple accounts without restrictions.',
      variant: 'warning',
      confirmText: newStatus ? 'Yes, Enable' : 'Yes, Disable',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setRateLimitingLoading(true);
      const response = await api.updateAuthRateLimitingStatus(newStatus);
      if (response.data) {
        setRateLimitingEnabled(response.data.enabled);
        toast.success(`Auth rate limiting ${newStatus ? 'enabled' : 'disabled'} successfully!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update rate limiting status');
      console.error('Error updating rate limiting status:', err);
    } finally {
      setRateLimitingLoading(false);
    }
  };

  // ROI Withdrawal Schedules
  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      setSchedulesError('');
      const response = await api.getWithdrawalSchedules();
      if (response.data) {
        setPackages(response.data.packageSchedules || []);
      }
    } catch (err: any) {
      setSchedulesError(err.message || 'Failed to fetch withdrawal schedules');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleEdit = (pkg: PackageSchedule) => {
    setEditingPackage(pkg.packageId);
    if (pkg.schedule) {
      setFormData({
        type: pkg.schedule.type,
        values: [...pkg.schedule.values],
        enabled: pkg.schedule.enabled,
      });
    } else {
      // Set default schedule based on package name
      const normalizedName = pkg.packageName.toLowerCase();
      if (normalizedName.includes('solar starter')) {
        setFormData({ type: 'days_of_month', values: [15, 30], enabled: true });
      } else if (normalizedName.includes('power growth')) {
        setFormData({ type: 'days_of_month', values: [10, 20, 30], enabled: true });
      } else if (normalizedName.includes('elite energy')) {
        setFormData({ type: 'day_of_week', values: [0], enabled: true }); // 0 = Sunday
      } else {
        setFormData({ type: 'days_of_month', values: [], enabled: true });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPackage(null);
    setFormData({
      type: 'days_of_month',
      values: [],
      enabled: true,
    });
  };

  const handleSaveSchedule = async () => {
    if (!editingPackage) return;

    const pkg = packages.find(p => p.packageId === editingPackage);
    if (!pkg) return;

    try {
      setSchedulesError('');
      setSuccess('');
      
      const response = await api.updateWithdrawalSchedule(pkg.packageName, {
        type: formData.type,
        values: formData.values,
        enabled: formData.enabled,
      });

      if (response.data) {
        setSuccess('Withdrawal schedule updated successfully');
        toast.success('Withdrawal schedule updated successfully');
        fetchSchedules();
        setEditingPackage(null);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update withdrawal schedule';
      setSchedulesError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setSchedulesError(''), 5000);
    }
  };

  const handleRemoveSchedule = async (packageId: string) => {
    const pkg = packages.find(p => p.packageId === packageId);
    if (!pkg) return;

    const confirmed = await confirm({
      title: 'Remove Withdrawal Schedule',
      message: `Are you sure you want to remove the custom withdrawal schedule for ${pkg.packageName}? It will revert to default schedule.`,
      variant: 'warning',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setSchedulesError('');
      setSuccess('');
      
      await api.updateWithdrawalSchedule(pkg.packageName, null);
      setSuccess('Withdrawal schedule removed successfully');
      toast.success('Withdrawal schedule removed successfully');
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove withdrawal schedule';
      setSchedulesError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setSchedulesError(''), 5000);
    }
  };

  const formatSchedule = (pkg: PackageSchedule) => {
    if (!pkg.schedule || !pkg.schedule.enabled) {
      const normalizedName = pkg.packageName.toLowerCase();
      if (normalizedName.includes('solar starter')) {
        return 'Default: 15th and 30th of every month';
      } else if (normalizedName.includes('power growth')) {
        return 'Default: 10th, 20th, and 30th of every month';
      } else if (normalizedName.includes('elite energy')) {
        return 'Default: Every Sunday';
      }
      return 'Default: Daily withdrawals';
    }

    if (pkg.schedule.type === 'days_of_month') {
      const sortedDays = [...pkg.schedule.values].sort((a, b) => a - b);
      const daysStr = sortedDays.map(d => {
        const suffix = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';
        return `${d}${suffix}`;
      }).join(', ');
      return `Custom: ${daysStr} of every month`;
    } else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const sortedDays = [...pkg.schedule.values].sort((a, b) => a - b);
      return `Custom: Every ${sortedDays.map(day => dayNames[day]).join(', ')}`;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage system settings and configurations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* System Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Actions</h2>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Trigger Daily Calculations</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manually trigger daily calculations for ROI, Binary, and Referral bonuses. 
                  Calculations run in the background and can be resumed if interrupted.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={checkJobStatus}
                  disabled={checkingStatus}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {checkingStatus ? 'Checking...' : 'Check Status'}
                </button>
                <button
                  onClick={handleTriggerCron}
                  disabled={cronLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cronLoading ? 'Starting...' : 'Trigger Daily Calculations'}
                </button>
              </div>
            </div>

            {/* Job Status Display */}
            {jobStatus && (
              <div className={`p-4 border rounded-lg ${
                jobStatus.status === 'completed' ? 'border-green-200 bg-green-50' :
                jobStatus.status === 'failed' ? 'border-red-200 bg-red-50' :
                jobStatus.status === 'processing' ? 'border-blue-200 bg-blue-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Job Status: <span className={`${
                        jobStatus.status === 'completed' ? 'text-green-600' :
                        jobStatus.status === 'failed' ? 'text-red-600' :
                        jobStatus.status === 'processing' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {jobStatus.status.toUpperCase()}
                      </span>
                      {jobStatus.status === 'processing' && (
                        <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                      )}
                    </h4>
                    {jobStatus.totalItems > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress: {jobStatus.processedItems || 0} / {jobStatus.totalItems}</span>
                          <span>{Math.round(((jobStatus.processedItems || 0) / jobStatus.totalItems) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              jobStatus.status === 'completed' ? 'bg-green-600' :
                              jobStatus.status === 'failed' ? 'bg-red-600' :
                              'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, ((jobStatus.processedItems || 0) / jobStatus.totalItems) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {jobStatus.status === 'failed' && jobStatus.lastError && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                        <strong>Error:</strong> {jobStatus.lastError}
                      </div>
                    )}
                    {jobStatus.results && (
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        {jobStatus.results.roi && (
                          <div>
                            <strong>ROI:</strong> {jobStatus.results.roi.processed || 0} processed, {jobStatus.results.roi.errors || 0} errors
                            {jobStatus.results.roi.total > 0 && ` (out of ${jobStatus.results.roi.total} total)`}
                            {jobStatus.results.roi.error && <span className="text-red-600 ml-2">- {jobStatus.results.roi.error}</span>}
                          </div>
                        )}
                        {jobStatus.results.binary && (
                          <div>
                            <strong>Binary:</strong> {jobStatus.results.binary.processed || 0} processed, {jobStatus.results.binary.errors || 0} errors
                            {jobStatus.results.binary.total > 0 && ` (out of ${jobStatus.results.binary.total} total)`}
                            {jobStatus.results.binary.totalBinaryPaid > 0 && ` - $${jobStatus.results.binary.totalBinaryPaid.toFixed(2)} paid`}
                            {jobStatus.results.binary.error && <span className="text-red-600 ml-2">- {jobStatus.results.binary.error}</span>}
                          </div>
                        )}
                        {jobStatus.results.referral && (
                          <div>
                            <strong>Referral:</strong> {jobStatus.results.referral.message || 'N/A'}
                          </div>
                        )}
                      </div>
                    )}
                    {jobStatus.completedAt && (
                      <div className="mt-2 text-xs text-gray-500">
                        Completed at: {new Date(jobStatus.completedAt).toLocaleString()}
                      </div>
                    )}
                    {jobStatus.startedAt && jobStatus.status === 'processing' && (
                      <div className="mt-2 text-xs text-gray-500">
                        Started at: {new Date(jobStatus.startedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  {jobStatus.status === 'failed' && (
                    <button
                      onClick={() => handleResumeJob(jobStatus._id)}
                      disabled={cronLoading}
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Resume Job
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-red-900 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Danger Zone
          </h2>
          <p className="text-sm text-red-700 mt-1">
            These actions are irreversible and will permanently delete data. Use with extreme caution.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-900">Flush All User Data (Reset for Testing)</h3>
              <p className="text-sm text-red-700 mt-1">
                ⚠️ WARNING: This will reset ALL user data to zero for testing!
              </p>
              <div className="text-xs text-red-600 mt-2 space-y-1">
                <p><strong>Will Reset:</strong> Left Business, Right Business, Left Carry, Right Carry, Matching Due, All Wallet Balances, Career Progress, Investments, Transactions</p>
                <p><strong>Will Preserve:</strong> User Accounts, Binary Tree Structure, Vouchers, Referrals</p>
              </div>
            </div>
            <button
              onClick={handleFlushUserData}
              disabled={flushUserDataLoading}
              className="ml-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {flushUserDataLoading ? 'Flushing...' : 'Flush All User Data'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="text-lg font-medium text-red-900">Flush All Investments</h3>
              <p className="text-sm text-red-700 mt-1">
                ⚠️ WARNING: This will permanently delete ALL investments and related data for ALL users!
              </p>
            </div>
            <button
              onClick={handleFlushInvestments}
              disabled={flushLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {flushLoading ? 'Flushing...' : 'Flush All Investments'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="text-lg font-medium text-red-900">Flush All Transactions</h3>
              <p className="text-sm text-red-700 mt-1">
                ⚠️ WARNING: This will permanently delete ALL transactions and NOWPayments history!
              </p>
            </div>
            <button
              onClick={handleFlushTransactions}
              disabled={flushTransactionsLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {flushTransactionsLoading ? 'Flushing...' : 'Flush All Transactions'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateway Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Gateway Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Control NOWPayments gateway for development and testing</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${nowpaymentsEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {nowpaymentsEnabled === null ? 'Loading...' : nowpaymentsEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleToggleNOWPayments}
              disabled={nowpaymentsEnabled === null || nowpaymentsLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                nowpaymentsEnabled ? 'bg-indigo-600' : 'bg-gray-300'
              } ${(nowpaymentsEnabled === null || nowpaymentsLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  nowpaymentsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        {nowpaymentsEnabled === false && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> NOWPayments gateway is disabled. Users will not be able to make payments until it is re-enabled.
            </p>
          </div>
        )}
      </div>

      {/* Auth Rate Limiting */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Auth Rate Limiting</h2>
            <p className="text-sm text-gray-600 mt-1">Control rate limiting for signup and login endpoints</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${rateLimitingEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {rateLimitingEnabled === null ? 'Loading...' : rateLimitingEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleToggleRateLimiting}
              disabled={rateLimitingEnabled === null || rateLimitingLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                rateLimitingEnabled ? 'bg-indigo-600' : 'bg-gray-300'
              } ${(rateLimitingEnabled === null || rateLimitingLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  rateLimitingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        {rateLimitingEnabled === false && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Rate limiting is disabled. Leaders can now create multiple accounts without restrictions. Re-enable for security.
            </p>
          </div>
        )}
        {rateLimitingEnabled === true && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Rate limiting is enabled (30 requests per 15 minutes per IP). Disable to allow leaders to create multiple accounts at once.
            </p>
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow p-6 border-2 border-orange-200">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-orange-900 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </h2>
          <p className="text-sm text-orange-700 mt-1">
            Manage user account statuses. All new signups are inactive by default and will be activated when they invest.
          </p>
        </div>
        <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-orange-900">Deactivate All Users</h3>
            <p className="text-sm text-orange-700 mt-1">
              ⚠️ WARNING: This will mark ALL users (except admin accounts) as inactive!
            </p>
            <div className="text-xs text-orange-600 mt-2 space-y-1">
              <p><strong>Will Deactivate:</strong> All user accounts except CROWN-000000 and CNEOX-000000</p>
              <p><strong>Note:</strong> Users will become active again automatically when they invest in a plan</p>
              <p><strong>Use Case:</strong> Useful for resetting all user statuses or enforcing investment requirement</p>
            </div>
          </div>
          <button
            onClick={async () => {
              const confirmed = await confirm({
                title: '⚠️ WARNING: Deactivate All Users',
                message: 'This will mark ALL users (except admin accounts) as inactive!\n\n' +
                  'This action will:\n' +
                  '• Mark all users as "inactive" status\n' +
                  '• Admin accounts (CROWN-000000, CNEOX-000000) will NOT be affected\n' +
                  '• Users will become active again automatically when they invest\n\n' +
                  'This is useful for:\n' +
                  '• Enforcing investment requirement for all users\n' +
                  '• Resetting user statuses\n' +
                  '• Requiring users to invest before accessing the platform\n\n' +
                  'Are you sure you want to proceed?',
                variant: 'warning',
                confirmText: 'Yes, Deactivate All',
                cancelText: 'Cancel',
              });

              if (!confirmed) return;

              try {
                setDeactivateAllLoading(true);
                setError('');
                const response = await api.deactivateAllUsers();
                
                if (response.data) {
                  toast.success(
                    `Successfully deactivated ${response.data.usersDeactivated} user(s)!`,
                    { duration: 5000 }
                  );
                }
              } catch (err: any) {
                setError(err.message || 'Failed to deactivate all users');
                toast.error(err.message || 'Failed to deactivate all users');
                console.error('Error deactivating all users:', err);
              } finally {
                setDeactivateAllLoading(false);
              }
            }}
            disabled={deactivateAllLoading}
            className="ml-4 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {deactivateAllLoading ? 'Deactivating...' : 'Deactivate All Users'}
          </button>
        </div>
      </div>

      {/* ROI Withdrawal Schedules */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ROI Withdrawal Schedules</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configure custom withdrawal schedules for each package. Leave empty to use default schedules.
        </p>

        {schedulesError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {schedulesError}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {schedulesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading schedules...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.packageId} className="border border-gray-200 rounded-lg p-4">
                {editingPackage === pkg.packageId ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{pkg.packageName}</h3>
                      <p className="text-sm text-gray-500">Package ID: {pkg.packageId}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'days_of_month' | 'day_of_week' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="days_of_month">Days of Month (e.g., 15th, 30th)</option>
                        <option value="day_of_week">Day of Week (e.g., Sunday, Monday)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.type === 'days_of_month' ? 'Days of Month (1-31)' : 'Days of Week (0=Sunday, 6=Saturday)'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.type === 'days_of_month' ? (
                          Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <button
                              key={day}
                              onClick={() => {
                                const newValues = formData.values.includes(day)
                                  ? formData.values.filter((d) => d !== day)
                                  : [...formData.values, day].sort((a, b) => a - b);
                                setFormData({ ...formData, values: newValues });
                              }}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                formData.values.includes(day)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {day}
                            </button>
                          ))
                        ) : (
                          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                const newValues = formData.values.includes(index)
                                  ? formData.values.filter((d) => d !== index)
                                  : [...formData.values, index].sort((a, b) => a - b);
                                setFormData({ ...formData, values: newValues });
                              }}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                formData.values.includes(index)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {day}
                            </button>
                          ))
                        )}
                      </div>
                      {formData.values.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected: {formData.type === 'days_of_month' 
                            ? formData.values.join(', ') 
                            : formData.values.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`enabled-${pkg.packageId}`}
                        checked={formData.enabled}
                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`enabled-${pkg.packageId}`} className="text-sm font-medium text-gray-700">
                        Enable this schedule
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveSchedule}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Save Schedule
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      {pkg.schedule && (
                        <button
                          onClick={() => handleRemoveSchedule(pkg.packageId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Remove Schedule
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{pkg.packageName}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatSchedule(pkg)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {pkg.schedule ? 'Edit Schedule' : 'Add Schedule'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
