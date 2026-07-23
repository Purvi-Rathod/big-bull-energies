'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return t.badgeActive;
      case 'In Progress':
        return t.badgePending;
      case 'Closed':
        return `${t.badgeNeutral} bg-emerald-100 text-emerald-800 border-emerald-200`;
      default:
        return t.badgeNeutral;
    }
  };

  if (loading) {
    return <BigBullLoader text="Loading tickets…" />;
  }

  return (
    <div className={t.page}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={t.title}>Support Tickets</h1>
          <p className={t.subtitle}>Create and track your support tickets</p>
        </div>
        <button type="button" onClick={() => setShowCreateModal(true)} className={t.btnPrimary}>
          Create Ticket
        </button>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className={t.cardEmpty}>
            <p className="text-lg font-medium" style={{ color: t.muted }}>
              No tickets found. Create your first ticket to get started.
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className={t.card}>
              <div className="flex justify-between items-start mb-4 gap-3">
                <div>
                  <h3 className="text-lg font-extrabold" style={{ color: t.ink }}>{ticket.subject}</h3>
                  <p className="text-sm mt-1 font-medium" style={{ color: t.muted }}>
                    Ticket ID:{' '}
                    <span className="font-mono font-bold" style={{ color: t.primary }}>
                      {ticket.id.substring(0, 8)}
                    </span>{' '}
                    | Created: {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className={t.cardInner}>
                  <p className="text-sm font-semibold mb-1" style={{ color: t.muted }}>Department</p>
                  <p className="text-sm font-extrabold" style={{ color: t.ink }}>{ticket.department}</p>
                </div>
                {ticket.service && (
                  <div className={t.cardInner}>
                    <p className="text-sm font-semibold mb-1" style={{ color: t.muted }}>Service</p>
                    <p className="text-sm font-extrabold" style={{ color: t.ink }}>{ticket.service}</p>
                  </div>
                )}
              </div>

              {ticket.description && (
                <div className={`${t.cardInner} mb-4`}>
                  <p className="text-sm font-semibold mb-2" style={{ color: t.muted }}>Description</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: t.ink }}>{ticket.description}</p>
                </div>
              )}

              {ticket.reply && (
                <div className={t.cardHighlight}>
                  <p className="text-sm font-extrabold mb-2" style={{ color: t.primary }}>Admin Reply:</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: t.ink }}>{ticket.reply}</p>
                  <p className="text-xs mt-3 font-semibold" style={{ color: t.muted }}>
                    Updated: {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className={t.modalOverlay}>
          <div className={`${t.modalPanel} max-w-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold" style={{ color: t.ink }}>Create Support Ticket</h3>
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
                className="text-[#5A6F78] hover:text-[#05627C] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label htmlFor="department" className={t.label}>
                  Department <span style={{ color: t.gold }}>*</span>
                </label>
                <select
                  id="department"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as 'Admin support' | 'Technical Support' })}
                  className={t.select}
                >
                  <option value="Admin support">Admin support</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div>
                <label htmlFor="service" className={t.label}>Service (Optional)</label>
                <select
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value as any })}
                  className={t.select}
                >
                  <option value="">Select a service (optional)</option>
                  <option value="Package Activation">Package Activation</option>
                  <option value="Downline Activation">Downline Activation</option>
                  <option value="Authentication">Authentication</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className={t.label}>
                  Subject <span style={{ color: t.gold }}>*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter ticket subject"
                  className={t.input}
                />
              </div>

              <div>
                <label htmlFor="description" className={t.label}>Description</label>
                <textarea
                  id="description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your issue or request..."
                  className={`${t.input} resize-y`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#d8e6ec]">
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
                  className={t.btnGhost}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className={t.btnPrimary}>
                  {creating ? 'Creating…' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
