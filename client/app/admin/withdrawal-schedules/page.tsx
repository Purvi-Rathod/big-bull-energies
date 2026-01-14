'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Calendar, Save, X, Plus, Trash2 } from 'lucide-react';

interface PackageSchedule {
  packageName: string;
  hasCustomSchedule: boolean;
  schedule: {
    type: 'days_of_month' | 'day_of_week';
    values: number[];
    enabled: boolean;
  } | null;
}

export default function WithdrawalSchedulesPage() {
  const { user, admin, loading: authLoading } = useAuth();
  const { confirm } = useConfirm();
  const [packages, setPackages] = useState<PackageSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      fetchSchedules();
    }
  }, [user, admin]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getWithdrawalSchedules();
      if (response.data) {
        setPackages(response.data.packageSchedules || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch withdrawal schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: PackageSchedule) => {
    setEditingPackage(pkg.packageName);
    if (pkg.schedule) {
      setFormData({
        type: pkg.schedule.type,
        values: [...pkg.schedule.values],
        enabled: pkg.schedule.enabled,
      });
    } else {
      // Default schedule based on package name
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

  const handleCancel = () => {
    setEditingPackage(null);
    setFormData({ type: 'days_of_month', values: [], enabled: true });
  };

  const handleAddValue = () => {
    if (formData.type === 'days_of_month') {
      const newValue = prompt('Enter day of month (1-31):');
      if (newValue) {
        const day = parseInt(newValue);
        if (day >= 1 && day <= 31 && !formData.values.includes(day)) {
          setFormData({ ...formData, values: [...formData.values, day].sort((a, b) => a - b) });
        } else {
          toast.error('Invalid day. Must be between 1-31 and not already added.');
        }
      }
    } else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selected = prompt(`Select day of week:\n${dayNames.map((name, idx) => `${idx}: ${name}`).join('\n')}`);
      if (selected !== null) {
        const day = parseInt(selected);
        if (day >= 0 && day <= 6 && !formData.values.includes(day)) {
          setFormData({ ...formData, values: [...formData.values, day].sort((a, b) => a - b) });
        } else {
          toast.error('Invalid day. Must be between 0-6 and not already added.');
        }
      }
    }
  };

  const handleRemoveValue = (value: number) => {
    setFormData({
      ...formData,
      values: formData.values.filter((v) => v !== value),
    });
  };

  const handleSave = async (packageName: string) => {
    if (formData.values.length === 0) {
      toast.error('Please add at least one withdrawal date');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await api.updateWithdrawalSchedule(packageName, formData);
      setSuccess(`Withdrawal schedule updated for ${packageName}`);
      toast.success(`Schedule updated for ${packageName}`);
      setEditingPackage(null);
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update withdrawal schedule';
      setError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRemoveSchedule = async (packageName: string) => {
    const confirmed = await confirm({
      title: 'Remove Custom Schedule',
      message: `Are you sure you want to remove the custom schedule for ${packageName}? It will revert to the default schedule.`,
      variant: 'warning',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      await api.updateWithdrawalSchedule(packageName, null);
      setSuccess(`Custom schedule removed for ${packageName}. Using default schedule.`);
      toast.success(`Schedule removed for ${packageName}`);
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove withdrawal schedule';
      setError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getScheduleDescription = (pkg: PackageSchedule): string => {
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
      const days = pkg.schedule.values.sort((a, b) => a - b);
      const daysStr = days.map(d => {
        const suffix = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';
        return `${d}${suffix}`;
      }).join(', ');
      return `Custom: ${daysStr} of every month`;
    } else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const days = pkg.schedule.values.map(d => dayNames[d]).join(', ');
      return `Custom: Every ${days}`;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading withdrawal schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ROI Withdrawal Schedules</h1>
          <p className="mt-1 text-sm text-gray-500">Manage withdrawal schedules for each package type</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Package Schedules</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure when users can withdraw ROI based on their package type
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {packages.map((pkg) => (
            <div key={pkg.packageName} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{pkg.packageName}</h4>
                  <p className="text-sm text-gray-600 mb-4">{getScheduleDescription(pkg)}</p>

                  {editingPackage === pkg.packageName ? (
                    <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Schedule Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              type: e.target.value as 'days_of_month' | 'day_of_week',
                              values: [], // Clear values when changing type
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="days_of_month">Days of Month (e.g., 15th, 30th)</option>
                          <option value="day_of_week">Day of Week (e.g., Sunday, Monday)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.type === 'days_of_month' ? 'Days of Month' : 'Days of Week'}
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.values.map((value) => (
                            <span
                              key={value}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                            >
                              {formData.type === 'days_of_month' ? (
                                <>
                                  {value}
                                  {value === 1 || value === 21 || value === 31
                                    ? 'st'
                                    : value === 2 || value === 22
                                    ? 'nd'
                                    : value === 3 || value === 23
                                    ? 'rd'
                                    : 'th'}
                                </>
                              ) : (
                                ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][value]
                              )}
                              <button
                                onClick={() => handleRemoveValue(value)}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={handleAddValue}
                          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
                          Add {formData.type === 'days_of_month' ? 'Day' : 'Day of Week'}
                        </button>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`enabled-${pkg.packageName}`}
                          checked={formData.enabled}
                          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`enabled-${pkg.packageName}`} className="ml-2 text-sm text-gray-700">
                          Enable this schedule (uncheck to allow daily withdrawals)
                        </label>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleSave(pkg.packageName)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Schedule
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        {pkg.hasCustomSchedule ? 'Edit Schedule' : 'Set Custom Schedule'}
                      </button>
                      {pkg.hasCustomSchedule && (
                        <button
                          onClick={() => handleRemoveSchedule(pkg.packageName)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove Custom Schedule
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Schedule Types:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <strong>Days of Month:</strong> Specify specific days (e.g., 15th, 30th) when withdrawals are allowed
          </li>
          <li>
            <strong>Day of Week:</strong> Specify days of the week (e.g., Sunday, Monday) when withdrawals are allowed
          </li>
          <li>
            <strong>Disabled Schedule:</strong> If a schedule is disabled, users can withdraw daily (no restrictions)
          </li>
        </ul>
      </div>
    </div>
  );
}
