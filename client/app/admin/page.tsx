'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  treeLink: string;
  totalInvestment: string;
  joinedAt: string;
}

export default function AdminPanel() {
  const { user, admin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 50 });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; userName: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Route protection is handled in layout

  useEffect(() => {
    // Only fetch users if authorized
    const isAdminUser = user?.userId === 'CNEOX-000000' || user?.userId === 'CROWN-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      fetchUsers();
    }
  }, [page, search, user, admin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getAdminUsers({ page, limit: 50, search });
      if (response.data) {
        setUsers(response.data.users || []);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading while checking auth
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
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and track all users in the system</p>
        </div>
        <div className="bg-white shadow rounded-lg">

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, userId, or phone..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                    fetchUsers();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Clear
                </button>
              )}
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
              <p className="mt-2 text-gray-500">Loading users...</p>
            </div>
          )}

          {/* Users Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                      User ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                      Mobile
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                      Investment
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                      Joined
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">
                      Tree
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={user.name}>
                            {user.name}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-900 font-mono truncate max-w-[130px]" title={user.userId}>
                            {user.userId}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-500 truncate max-w-[180px]" title={user.email}>
                            {user.email}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-500 truncate max-w-[110px]" title={user.phone}>
                            {user.phone}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-900 font-semibold">
                            ${parseFloat(user.totalInvestment).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-500">{formatDate(user.joinedAt)}</div>
                        </td>
                        <td className="px-3 py-3">
                          <a
                            href={user.treeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-xs"
                          >
                            View
                          </a>
                        </td>
                        <td className="px-3 py-3 text-xs font-medium">
                          <div className="relative dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(openDropdown === user.userId ? null : user.userId);
                              }}
                              disabled={deletingUserId === user.userId || updatingStatus === user.userId || user.userId === 'CNEOX-000000' || user.userId === 'CROWN-000000'}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Actions"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            
                            {openDropdown === user.userId && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdown(null);
                                      handleImpersonate(user.userId);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Login
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeactivate(user.userId, user.status);
                                    }}
                                    disabled={updatingStatus === user.userId || user.userId === 'CNEOX-000000' || user.userId === 'CROWN-000000'}
                                    className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {user.status === 'active' ? (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                    {updatingStatus === user.userId && '...'}
                                  </button>
                                  <hr className="my-1 border-gray-200" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdown(null);
                                      handleDeleteClick(user.userId, user.name);
                                    }}
                                    disabled={deletingUserId === user.userId || user.userId === 'CNEOX-000000' || user.userId === 'CROWN-000000'}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                    {deletingUserId === user.userId && '...'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Delete User
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm.userName}</span> ({deleteConfirm.userId})?
              </p>
              <p className="text-xs text-red-600 text-center mb-6 bg-red-50 p-3 rounded">
                ⚠️ This action cannot be undone. This will permanently delete the user and all related data including investments, wallets, transactions, withdrawals, vouchers, tickets, and binary tree entries.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deletingUserId === deleteConfirm.userId}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
    </div>
  );
}

