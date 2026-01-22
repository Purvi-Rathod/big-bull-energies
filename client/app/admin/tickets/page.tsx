'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  raisedBy: {
    userId: string;
    name: string;
    email: string;
  };
  department: string;
  service?: string;
  subject: string;
  description?: string;
  status: string;
  document?: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTicketsPage() {
  const { admin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchTickets();
  }, [page, statusFilter, startDate, endDate]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getAllTickets({
        page,
        limit: 20,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (response.data) {
        setTickets(response.data.tickets || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    if (!newStatus && !reply) {
      toast.error('Please provide a status update or reply');
      return;
    }

    setUpdating(true);
    try {
      await api.updateTicket(selectedTicket.id, {
        status: newStatus || undefined,
        reply: reply || undefined,
      });
      toast.success('Ticket updated successfully!');
      setSelectedTicket(null);
      setReply('');
      setNewStatus('');
      await fetchTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-300 font-bold shadow-sm';
      case 'In Progress':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 font-bold shadow-sm';
      case 'Closed':
      case 'Resolved':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold shadow-sm';
      case 'Rejected':
        return 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300 font-semibold shadow-sm';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          <p className="mt-4 text-black">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Support Tickets</h1>
          <p className="mt-1 text-sm text-black">Manage and respond to user support tickets</p>
        </div>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Date Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex gap-4 items-center flex-wrap">
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
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 text-sm"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-black">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-black">
                      {ticket.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-black">{ticket.raisedBy.userId}</div>
                      <div className="text-black">{ticket.raisedBy.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-black max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {ticket.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {ticket.service || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setNewStatus(ticket.status);
                          setReply(ticket.reply || '');
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View/Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-black">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Update Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Ticket Details</h3>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setReply('');
                    setNewStatus('');
                  }}
                  className="text-black hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">User</label>
                  <p className="text-sm text-black">{selectedTicket.raisedBy.userId} - {selectedTicket.raisedBy.name}</p>
                  <p className="text-sm text-black">{selectedTicket.raisedBy.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Subject</label>
                  <p className="text-sm text-black">{selectedTicket.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Description</label>
                  <p className="text-sm text-black whitespace-pre-wrap">{selectedTicket.description || 'No description provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Department</label>
                  <p className="text-sm text-black">{selectedTicket.department}</p>
                </div>

                {selectedTicket.service && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Service</label>
                    <p className="text-sm text-black">{selectedTicket.service}</p>
                  </div>
                )}

                {selectedTicket.reply && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Previous Reply</label>
                    <p className="text-sm text-black whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{selectedTicket.reply}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="newStatus" className="block text-sm font-medium text-black mb-2">
                    Update Status
                  </label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={selectedTicket.status}>{selectedTicket.status}</option>
                    {['Open', 'In Progress', 'Closed'].filter(s => s !== selectedTicket.status).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reply" className="block text-sm font-medium text-black mb-2">
                    Reply to User
                  </label>
                  <textarea
                    id="reply"
                    rows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Enter your reply to the user..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedTicket(null);
                      setReply('');
                      setNewStatus('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTicket}
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update Ticket'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

