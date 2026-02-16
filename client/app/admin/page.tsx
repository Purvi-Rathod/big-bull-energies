'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { countries } from '@/lib/countries';
import toast from 'react-hot-toast';

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  treeLink: string;
  totalInvestment: string;
  packageNames: string[];
  joinedAt: string;
  position: string | null;
  referrer: {
    userId: string;
    name: string;
    email: string | null;
  } | null;
}

interface DirectReferral {
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  joinedAt: string;
}

export default function AdminPanel() {
  const { user, admin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 50 });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; userName: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [expandedReferralsUserId, setExpandedReferralsUserId] = useState<string | null>(null);
  const [directReferralsCache, setDirectReferralsCache] = useState<Record<string, { list: DirectReferral[]; loading?: boolean }>>({});
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    walletAddress: '',
    bankAccount: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: '',
    },
  });

  // Route protection is handled in layout

  useEffect(() => {
    // Only fetch users if authorized
    const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CROWN-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      fetchUsers();
    }
  }, [page, search, countryFilter, startDate, endDate, user, admin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getAdminUsers({ 
        page, 
        limit: 50, 
        search,
        country: countryFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (response.data) {
        const list = response.data.users || [];
        // Ensure latest users first (by joinedAt / createdAt descending)
        list.sort((a: User, b: User) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
        setUsers(list);
        setPagination(response.data.pagination || { total: 0, pages: 0, limit: 50 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      const response = await api.impersonateUser(userId);
      if (response.data?.user && response.data?.token) {
        // Create a URL with the user token to open in a new tab
        // We'll use a special route that handles the impersonation token
        const impersonationUrl = `/impersonate?token=${encodeURIComponent(response.data.token)}&userId=${encodeURIComponent(userId)}`;
        
        // Open in new tab
        window.open(impersonationUrl, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to login as user');
      console.error('Error impersonating user:', err);
    }
  };

  const handleViewBio = (userId: string) => {
    // Navigate to user bio page
    window.location.href = `/admin/users/${userId}/bio`;
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteConfirm({ userId, userName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setDeletingUserId(deleteConfirm.userId);
      setError('');
      await api.deleteUser(deleteConfirm.userId);
      setDeleteConfirm(null);
      // Refresh the user list
      await fetchUsers();
      toast.success(`User ${deleteConfirm.userName} (${deleteConfirm.userId}) and all related data deleted successfully`, { duration: 5000 });
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleDeactivate = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'inactive' ? 'deactivate' : 'activate';
    
    try {
      setUpdatingStatus(userId);
      setOpenDropdown(null);
      await api.updateUserStatus(userId, newStatus);
      toast.success(`User ${action}d successfully!`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} user`);
      console.error(`Error ${action}ing user:`, err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEditProfile = (user: User) => {
    setEditingUser(user);
    setProfileFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      country: user.country || '',
      walletAddress: '',
      bankAccount: {
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        accountHolderName: '',
      },
    });
    setOpenDropdown(null);
  };

  const handleUpdateProfile = async () => {
    if (!editingUser) return;

    try {
      setUpdatingProfile(true);
      await api.updateUserProfile(editingUser.userId, profileFormData);
      toast.success('User profile updated successfully!');
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user profile');
      console.error('Error updating user profile:', err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('bankAccount.')) {
      const field = name.split('.')[1];
      setProfileFormData(prev => ({
        ...prev,
        bankAccount: {
          ...prev.bankAccount,
          [field]: value,
        },
      }));
    } else {
      setProfileFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Close dropdown when clicking outside (including portal menu has class so clicking menu doesn't close)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Close dropdown when table container or window scrolls (dropdown is fixed, would appear in wrong place)
  useEffect(() => {
    if (!openDropdown) return;
    const el = tableWrapperRef.current;
    const handleScroll = () => {
      setOpenDropdown(null);
      setDropdownPosition(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    el?.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      el?.removeEventListener('scroll', handleScroll);
    };
  }, [openDropdown]);

  const toggleReferrals = async (userId: string) => {
    if (expandedReferralsUserId === userId) {
      setExpandedReferralsUserId(null);
      return;
    }
    setExpandedReferralsUserId(userId);
    if (directReferralsCache[userId]) return;
    setDirectReferralsCache((prev) => ({ ...prev, [userId]: { list: [], loading: true } }));
    try {
      const response = await api.getDirectReferrals(userId);
      const list = response.data?.directReferrals || [];
      setDirectReferralsCache((prev) => ({ ...prev, [userId]: { list, loading: false } }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to load referrals');
      setDirectReferralsCache((prev) => ({ ...prev, [userId]: { list: [], loading: false } }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold';
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300 font-bold';
      case 'suspended':
      case 'rejected':
      case 'blocked':
        return 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 font-bold';
      case 'approved':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-300 font-bold';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300 font-semibold';
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">User Management</h1>
        <p className="mt-2 text-base text-gray-700">Manage and track all users in the system</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl border border-gray-200 rounded-xl">

          {/* Filters */}
          <div className="px-6 py-5 border-b-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search and Country Filter Row */}
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, userId, or phone..."
                  className="flex-1 w-[250px] px-2 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={countryFilter}
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg transition-all duration-200 font-semibold"
                >
                  Search
                </button>
                {(search || countryFilter || startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setCountryFilter('');
                      setStartDate('');
                      setEndDate('');
                      setPage(1);
                      fetchUsers();
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 shadow-md transition-all duration-200 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {/* Date Range Filter Row */}
              <div className="flex gap-4 flex-wrap items-center">
                <label className="text-sm font-medium text-black whitespace-nowrap">Date Range:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-black">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-black">Loading users...</p>
            </div>
          )}

          {/* Users Table */}
          {!loading && (
            <div ref={tableWrapperRef} className="max-w-full overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 admin-compact-table">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="text-left w-[14%]">User</th>
                    <th className="text-left w-[12%]">Position</th>
                    <th className="text-left w-[12%]">Sponsor</th>
                    <th className="text-left w-[10%]">Country&Phone</th>
                    <th className="text-left w-[8%]">Status</th>
                    <th className="text-left w-[10%]">Investment</th>
                    <th className="text-left w-[8%]">Joined</th>
                    <th className="text-left w-[6%]">Tree</th>
                    <th className="text-left w-[12%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-black">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <Fragment key={user.id}>
                      <tr className="hover:bg-gray-50">
                        {/* User Column */}
                        <td>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="text-black font-mono font-semibold truncate" title={user.userId}>
                              {user.userId}
                            </div>
                            <div className="font-medium text-black truncate" title={user.name}>
                              {user.name}
                            </div>
                            <div className="text-gray-600 truncate" title={user.email}>
                              {user.email}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              <button
                                onClick={() => handleViewBio(user.userId)}
                                className="px-1.5 py-0.5 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                title="View user dashboard"
                              >
                                Bio
                              </button>
                              <button
                                onClick={() => handleImpersonate(user.userId)}
                                className="px-1.5 py-0.5 text-[10px] bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                                title="Login as user"
                              >
                                Login
                              </button>
                              <button
                                onClick={() => toggleReferrals(user.userId)}
                                className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${expandedReferralsUserId === user.userId ? 'bg-indigo-700 text-white ring-1 ring-indigo-400' : 'bg-violet-500 text-white hover:bg-violet-600'}`}
                                title="Direct referrals"
                              >
                                Referrals
                              </button>
                            </div>
                          </div>
                        </td>
                        {/* Position Column */}
                        <td>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            {user.position ? (
                              <span className="font-semibold text-black truncate">{user.position}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                            {user.referrer ? (
                              <span className="text-gray-500 font-mono truncate">Parent: {user.referrer.userId}</span>
                            ) : (
                              <span className="text-gray-400">No parent</span>
                            )}
                          </div>
                        </td>
                        {/* Sponsor Column */}
                        <td>
                          {user.referrer ? (
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="font-semibold text-black truncate" title={user.referrer.name}>
                                {user.referrer.name}
                              </div>
                              <div className="text-gray-600 truncate" title={user.referrer.email || ''}>
                                {user.referrer.email || '-'}
                              </div>
                              <div className="text-gray-500 font-mono truncate" title={user.referrer.userId}>
                                {user.referrer.userId}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </td>
                        {/* Country&Phone Column */}
                        <td>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="text-black font-medium truncate" title={user.country}>
                              {user.country || '-'}
                            </div>
                            <div className="text-gray-600 font-mono truncate" title={user.phone}>
                              {user.phone || '-'}
                            </div>
                          </div>
                        </td>
                        {/* Status Column */}
                        <td>
                          <span
                            className={`px-2 py-0.5 inline-flex text-[10px] leading-tight font-bold rounded-full border shadow-sm ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        {/* Investment Column */}
                        <td>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="text-black font-semibold">
                              ${parseFloat(user.totalInvestment).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            {user.packageNames && user.packageNames.length > 0 ? (
                              <div className="flex flex-wrap gap-0.5">
                                {user.packageNames.map((pkgName, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium truncate max-w-full"
                                    title={pkgName}
                                  >
                                    {pkgName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No packages</span>
                            )}
                          </div>
                        </td>
                        {/* Joined Column */}
                        <td>
                          <div className="text-black whitespace-nowrap">{formatDate(user.joinedAt)}</div>
                        </td>
                        {/* Tree Column */}
                        <td>
                          <a
                            href={user.treeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </a>
                        </td>
                        {/* Actions Column */}
                        <td className="font-medium">
                          <div className="relative dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (openDropdown === user.userId) {
                                  setOpenDropdown(null);
                                  setDropdownPosition(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDropdownPosition({ top: rect.bottom + 4, left: rect.right - 160 });
                                  setOpenDropdown(user.userId);
                                }
                              }}
                              disabled={deletingUserId === user.userId || updatingStatus === user.userId || user.userId === 'CROWN-000000' || user.userId === 'CROWN-000000'}
                              className="p-1.5 text-black hover:text-black hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Actions"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedReferralsUserId === user.userId && (
                        <tr className="bg-violet-50/80">
                          <td colSpan={9} className="p-0 align-top">
                            <div className="px-4 py-3 border-t border-violet-200">
                              <div className="text-xs font-semibold text-violet-800 mb-2">Direct referrals by {user.name} ({user.userId})</div>
                              {directReferralsCache[user.userId]?.loading ? (
                                <div className="text-sm text-gray-500 py-2">Loading...</div>
                              ) : (
                                <div className="overflow-x-auto rounded-lg border border-violet-200 bg-white">
                                  <table className="w-full text-sm">
                                    <thead className="bg-violet-100">
                                      <tr>
                                        <th className="text-left px-3 py-2 text-violet-800">User ID</th>
                                        <th className="text-left px-3 py-2 text-violet-800">Name</th>
                                        <th className="text-left px-3 py-2 text-violet-800">Email</th>
                                        <th className="text-left px-3 py-2 text-violet-800">Country</th>
                                        <th className="text-left px-3 py-2 text-violet-800">Status</th>
                                        <th className="text-left px-3 py-2 text-violet-800">Joined</th>
                                        <th className="text-left px-3 py-2 text-violet-800">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-violet-100">
                                      {(!directReferralsCache[user.userId]?.list || directReferralsCache[user.userId].list.length === 0) ? (
                                        <tr><td colSpan={7} className="px-3 py-4 text-center text-gray-500">No direct referrals</td></tr>
                                      ) : (
                                        directReferralsCache[user.userId].list.map((ref) => (
                                          <tr key={ref.userId} className="hover:bg-violet-50/50">
                                            <td className="px-3 py-2 font-mono text-black">{ref.userId}</td>
                                            <td className="px-3 py-2 text-black">{ref.name}</td>
                                            <td className="px-3 py-2 text-gray-600 truncate max-w-[180px]" title={ref.email}>{ref.email}</td>
                                            <td className="px-3 py-2 text-black">{ref.country}</td>
                                            <td className="px-3 py-2">
                                              <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${getStatusColor(ref.status)}`}>{ref.status}</span>
                                            </td>
                                            <td className="px-3 py-2 text-black whitespace-nowrap">{formatDate(ref.joinedAt)}</td>
                                            <td className="px-3 py-2">
                                              <button onClick={() => handleViewBio(ref.userId)} className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Bio</button>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions dropdown portal (avoids overflow clipping) */}
          {openDropdown && dropdownPosition && typeof document !== 'undefined' && (() => {
            const userForMenu = users.find((u) => u.userId === openDropdown);
            if (!userForMenu) return null;
            const menu = (
              <div
                className="dropdown-container fixed w-40 bg-white rounded-md shadow-lg border border-gray-200 z-[9999] py-1"
                style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                    setDropdownPosition(null);
                    handleEditProfile(userForMenu);
                  }}
                  disabled={userForMenu.userId === 'CROWN-000000'}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                    setDropdownPosition(null);
                    handleDeactivate(userForMenu.userId, userForMenu.status);
                  }}
                  disabled={updatingStatus === userForMenu.userId || userForMenu.userId === 'CROWN-000000'}
                  className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userForMenu.status === 'active' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {userForMenu.status === 'active' ? 'Deactivate' : 'Activate'}
                  {updatingStatus === userForMenu.userId && '...'}
                </button>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                    setDropdownPosition(null);
                    handleDeleteClick(userForMenu.userId, userForMenu.name);
                  }}
                  disabled={deletingUserId === userForMenu.userId || userForMenu.userId === 'CROWN-000000'}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                  {deletingUserId === userForMenu.userId && '...'}
                </button>
              </div>
            );
            return createPortal(menu, document.body);
          })()}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-black">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border-2 border-indigo-300 rounded-lg text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border-2 border-indigo-300 rounded-lg text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-black text-center mb-2">
                Delete User
              </h3>
              <p className="text-sm text-black text-center mb-4">
                Are you sure you want to delete <span className="font-semibold text-black">{deleteConfirm.userName}</span> ({deleteConfirm.userId})?
              </p>
              <p className="text-xs text-red-600 text-center mb-6 bg-red-50 p-3 rounded">
                ⚠️ This action cannot be undone. This will permanently delete the user and all related data including investments, wallets, transactions, withdrawals, vouchers, tickets, and binary tree entries.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deletingUserId === deleteConfirm.userId}
                  className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingUserId === deleteConfirm.userId}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {deletingUserId === deleteConfirm.userId ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Profile Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Update User Profile</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600"
                disabled={updatingProfile}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>User:</strong> {editingUser.name} ({editingUser.userId})
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileFormData.name}
                    onChange={handleProfileFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileFormData.email}
                    onChange={handleProfileFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileFormData.phone}
                    onChange={handleProfileFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Country</label>
                  <select
                    name="country"
                    value={profileFormData.country}
                    onChange={handleProfileFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Wallet Address</label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={profileFormData.walletAddress}
                    onChange={handleProfileFormChange}
                    placeholder="Enter wallet address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-black mb-3">Bank Account Details (Optional)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Account Number</label>
                      <input
                        type="text"
                        name="bankAccount.accountNumber"
                        value={profileFormData.bankAccount.accountNumber}
                        onChange={handleProfileFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Bank Name</label>
                      <input
                        type="text"
                        name="bankAccount.bankName"
                        value={profileFormData.bankAccount.bankName}
                        onChange={handleProfileFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">IFSC Code</label>
                        <input
                          type="text"
                          name="bankAccount.ifscCode"
                          value={profileFormData.bankAccount.ifscCode}
                          onChange={handleProfileFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          name="bankAccount.accountHolderName"
                          value={profileFormData.bankAccount.accountHolderName}
                          onChange={handleProfileFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    disabled={updatingProfile}
                    className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {updatingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

