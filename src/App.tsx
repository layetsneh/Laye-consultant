import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SupportRequestForm } from './components/SupportRequestForm';
import { CustomerDashboard } from './components/CustomerDashboard';
import { TicketDetailModal } from './components/TicketDetailModal';
import { SupportTicket, TicketStatus, ChatMessage } from './types';
import { INITIAL_SEED_TICKETS } from './data/initialTickets';
import {
  fetchAllTickets,
  saveTicket,
  updateTicketStatusInDb,
  addMessageToTicketInDb,
  testSupabaseConnection,
  SupabaseHealthResult,
  getLocalTickets,
  resetLocalTicketsToDefault,
} from './lib/supabase';
import { Sparkles, GitBranch, Database, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard'>('dashboard');
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    return getLocalTickets();
  });

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseHealthResult>({
    connected: false,
    tableExists: false,
  });

  // Calculate ticket counts for header navigation
  const ticketCounts = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter((t) => t.status === 'Pending').length;
    const aiResponded = tickets.filter((t) => t.status === 'AI Responded').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;
    return { total, pending, aiResponded, resolved };
  }, [tickets]);

  // Load and sync from Supabase
  const loadTicketsAndHealth = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Test database health
      const health = await testSupabaseConnection();
      setSupabaseStatus(health);

      // Fetch latest tickets
      const result = await fetchAllTickets();
      if (result.tickets && result.tickets.length > 0) {
        setTickets(result.tickets);
      } else {
        setTickets(getLocalTickets());
      }
    } catch (err) {
      console.error('Error during data fetch:', err);
      setTickets(getLocalTickets());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTicketsAndHealth();
  }, [loadTicketsAndHealth]);

  const handleResetDemoTickets = () => {
    const fresh = resetLocalTicketsToDefault();
    setTickets(fresh);
    setSelectedTicket(null);
  };

  // Ticket creation handler
  const handleTicketCreated = (newTicket: SupportTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicket(newTicket);
    setActiveTab('dashboard');
  };

  // Status update handler
  const handleUpdateStatus = async (id: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    );

    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null));
    }

    await updateTicketStatusInDb(id, newStatus);
  };

  // Chat message addition handler
  const handleAddMessage = async (ticketId: string, message: ChatMessage) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const conv = t.conversation || [];
          return {
            ...t,
            conversation: [...conv, message],
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => {
        if (!prev) return null;
        const conv = prev.conversation || [];
        return {
          ...prev,
          conversation: [...conv, message],
          updated_at: new Date().toISOString(),
        };
      });
    }

    await addMessageToTicketInDb(ticketId, message);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header with Navigation & Live Connection Badges */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ticketCounts={ticketCounts}
        supabaseStatus={supabaseStatus}
        onRefreshDatabase={loadTicketsAndHealth}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'form' && (
          <SupportRequestForm
            onTicketCreated={handleTicketCreated}
            onViewDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <CustomerDashboard
            tickets={tickets}
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
            onNewRequest={() => setActiveTab('form')}
            onRefresh={loadTicketsAndHealth}
            onRestoreDemoData={handleResetDemoTickets}
            onUpdateStatus={handleUpdateStatus}
            isRefreshing={isRefreshing}
            supabaseConnected={supabaseStatus.connected}
          />
        )}
      </main>

      {/* Full Ticket Inspection & Interactive Follow-Up Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddMessage={handleAddMessage}
        />
      )}

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 font-display">Laye Consultant</span>
            <span>•</span>
            <span>Automated AI Support &amp; Incident Advisory</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://github.com/layetsneh/Laye-consultant.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <span>•</span>
            <a
              href="https://ocnnzxazrhcqahuwbphk.supabase.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Instance</span>
            </a>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Enterprise Grade Security</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
