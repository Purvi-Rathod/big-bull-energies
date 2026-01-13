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
  
  // Flush Investments
  const [flushLoading, setFlushLoading] = useState(false);
  const [flushTransactionsLoading, setFlushTransactionsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment Gateway Settings
  const [nowpaymentsEnabled, setNowpaymentsEnabled] = useState<boolean | null>(null);
  const [nowpaymentsLoading, setNowpaymentsLoading] = useState(false);
  
  // Auth Rate Limiting
  const [rateLimitingEnabled, setRateLimitingEnabled] = useState<boolean | null>(null);
  const [rateLimitingLoading, setRateLimitingLoading] = useState(false);
  
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

  // Trigger Daily Calculations
  const handleTriggerCron = async () => {
    const confirmed = await confirm({
      title: 'Trigger Daily Calculations',
      message: 'Are you sure you want to trigger the daily calculations (ROI, Binary, Referral)?',
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
        toast.success('Daily calculations triggered successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger daily calculations');
      console.error('Error triggering cron:', err);
    } finally {
      setCronLoading(false);
    }
  };

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
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Trigger Daily Calculations</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manually trigger daily calculations for ROI, Binary, and Referral bonuses
              </p>
            </div>
            <button
              onClick={handleTriggerCron}
              disabled={cronLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cronLoading ? 'Processing...' : 'Trigger Daily Calculations'}
            </button>
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
