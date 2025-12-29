'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import CneoLoader from '@/components/CneoLoader';

interface Ticket {
  id: string;
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

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    department: 'Admin support' as 'Admin support' | 'Technical Support',
    service: '' as '' | 'Package Activation' | 'Downline Activation' | 'Authentication',
    subject: '',
    description: '',
  });
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getUserTickets();
      if (response.data) {
        setTickets(response.data.tickets || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject) {
      toast.error('Subject is required');
      return;
    }

    setCreating(true);
    try {
      await api.createTicket({
        department: formData.department,
        service: formData.service || undefined,
        subject: formData.subject,
        description: formData.description || undefined,
      });
      toast.success('Ticket created successfully!');
      setShowCreateModal(false);
      setFormData({
        department: 'Admin support',
        service: '',
        subject: '',
        description: '',
      });
      await fetchTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <CneoLoader fullScreen />;
  }

  return (
    <div className="w-full bg-gradient-to-br from-black via-gray-900 to-black min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 text-white">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Support Tickets</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">Create and track your support tickets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
        >
          Create Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-6">
        {tickets.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-12 text-center">
            <p className="text-gray-400 text-lg">No tickets found. Create your first ticket to get started.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-6 hover:border-yellow-500/60 hover:shadow-yellow-500/20 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">{ticket.subject}</h3>
                  <p className="text-sm text-gray-400 mt-1 font-semibold">
                    Ticket ID: <span className="text-yellow-400 font-mono">{ticket.id.substring(0, 8)}</span> | Created: {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                  ticket.status === 'Open'
                    ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                    : ticket.status === 'In Progress'
                    ? 'bg-gray-700/50 text-yellow-200 border border-yellow-500/30'
                    : ticket.status === 'Closed'
                    ? 'bg-gray-700/50 text-gray-300 border border-gray-600'
                    : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                }`}>
                  {ticket.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
                  <p className="text-sm text-gray-400 font-semibold mb-2">Department</p>
                  <p className="text-sm font-extrabold text-white">{ticket.department}</p>
                </div>
                {ticket.service && (
                  <div className="p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
                    <p className="text-sm text-gray-400 font-semibold mb-2">Service</p>
                    <p className="text-sm font-extrabold text-white">{ticket.service}</p>
                  </div>
                )}
              </div>

              {ticket.description && (
                <div className="mb-4 p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
                  <p className="text-sm text-gray-400 font-semibold mb-3">Description</p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              )}

              {ticket.reply && (
                <div className="mt-4 p-5 bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 border-2 border-yellow-500/40 rounded-xl">
                  <p className="text-sm font-extrabold text-yellow-400 mb-3">Admin Reply:</p>
                  <p className="text-sm text-white whitespace-pre-wrap">{ticket.reply}</p>
                  <p className="text-xs text-gray-400 mt-3 font-semibold">
                    Updated: {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border border-yellow-500/30 w-full max-w-2xl shadow-2xl rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Create Support Ticket</span>
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      department: 'Admin support',
                      service: '',
                      subject: '',
                      description: '',
                    });
                  }}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-5">
                <div>
                  <label htmlFor="department" className="block text-sm font-bold text-yellow-400 mb-3">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="department"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as 'Admin support' | 'Technical Support' })}
                    className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                  >
                    <option value="Admin support">Admin support</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-bold text-yellow-400 mb-3">
                    Service (Optional)
                  </label>
                  <select
                    id="service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value as any })}
                    className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                  >
                    <option value="">Select a service (optional)</option>
                    <option value="Package Activation">Package Activation</option>
                    <option value="Downline Activation">Downline Activation</option>
                    <option value="Authentication">Authentication</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-yellow-400 mb-3">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter ticket subject"
                    className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-yellow-400 mb-3">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your issue or request..."
                    className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-yellow-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        department: 'Admin support',
                        service: '',
                        subject: '',
                        description: '',
                      });
                    }}
                    className="px-6 py-2.5 text-sm font-bold text-gray-300 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
                  >
                    {creating ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
  );
}

