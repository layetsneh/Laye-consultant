import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Bot,
  User,
  ArrowUpDown,
  RefreshCw,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Database,
  Tag,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { SupportTicket, TicketStatus, TicketUrgency } from '../types';

interface CustomerDashboardProps {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
  onNewRequest: () => void;
  onRefresh: () => void;
  onRestoreDemoData?: () => void;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  isRefreshing: boolean;
  supabaseConnected: boolean;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  tickets,
  onSelectTicket,
  onNewRequest,
  onRefresh,
  onRestoreDemoData,
  onUpdateStatus,
  isRefreshing,
  supabaseConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'urgency'>('newest');

  // Calculate statistics
  const stats = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    const total = list.length;
    const pending = list.filter((t) => t.status === 'Pending').length;
    const aiResponded = list.filter((t) => t.status === 'AI Responded').length;
    const resolved = list.filter((t) => t.status === 'Resolved').length;
    const critical = list.filter((t) => t.urgency === 'Critical' || t.urgency === 'High').length;
    return { total, pending, aiResponded, resolved, critical };
  }, [tickets]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    const list = Array.isArray(tickets) ? tickets : [];
    list.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tickets]);

  // Filtered and sorted tickets
  const filteredTickets = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    return list
      .filter((ticket) => {
        // Status filter
        if (statusFilter !== 'ALL' && ticket.status !== statusFilter) return false;
        // Urgency filter
        if (urgencyFilter !== 'ALL') {
          if (urgencyFilter === 'Critical_or_High') {
            if (ticket.urgency !== 'Critical' && ticket.urgency !== 'High') return false;
          } else if (ticket.urgency !== urgencyFilter) {
            return false;
          }
        }
        // Category filter
        if (categoryFilter !== 'ALL' && ticket.category !== categoryFilter) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSubject = (ticket.subject || '').toLowerCase().includes(q);
          const matchName = (ticket.name || '').toLowerCase().includes(q);
          const matchEmail = (ticket.email || '').toLowerCase().includes(q);
          const matchComplaint = (ticket.complaint || '').toLowerCase().includes(q);
          const matchCategory = (ticket.category || '').toLowerCase().includes(q);
          if (!matchSubject && !matchName && !matchEmail && !matchComplaint && !matchCategory) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        }
        if (sortBy === 'oldest') {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeA - timeB;
        }
        if (sortBy === 'urgency') {
          const order: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return (order[b.urgency] || 0) - (order[a.urgency] || 0);
        }
        return 0;
      });
  }, [tickets, statusFilter, urgencyFilter, categoryFilter, searchQuery, sortBy]);

  const getUrgencyBadge = (urgency: TicketUrgency) => {
    switch (urgency) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Critical</span>
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            <span>High Urgency</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Medium</span>
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span>Low</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'AI Responded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Bot className="w-3 h-3 text-indigo-600" />
            <span>AI Responded</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Recently';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2.5">
            <span>Customer Support Dashboard</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Live Feed
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organized overview of submitted requests, AI-generated consultations, and status progression.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRestoreDemoData && (
            <button
              id="restore-demo-tickets-btn"
              type="button"
              onClick={onRestoreDemoData}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-2xs"
              title="Reset dashboard with sample enterprise advisory tickets"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Demo Data</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}

          <button
            id="refresh-tickets-btn"
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-2xs"
            title="Refresh from Supabase and local storage"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            id="create-ticket-dashboard-btn"
            type="button"
            onClick={onNewRequest}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs flex items-center gap-1.5 shadow-indigo-600/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          id="stat-card-total"
          onClick={() => {
            setStatusFilter('ALL');
            setUrgencyFilter('ALL');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' && urgencyFilter === 'ALL'
              ? 'bg-white border-indigo-300 ring-2 ring-indigo-500/10 shadow-xs'
              : 'bg-white/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All customer inquiries</div>
        </div>

        <div
          id="stat-card-ai-responded"
          onClick={() => {
            setStatusFilter((prev) => (prev === 'AI Responded' ? 'ALL' : 'AI Responded'));
            setUrgencyFilter('ALL');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'AI Responded'
              ? 'bg-white border-indigo-400 ring-2 ring-indigo-500/10 shadow-xs'
              : 'bg-white/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">AI Responded</span>
            <Bot className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-700">{stats.aiResponded}</div>
          <div className="text-[11px] text-indigo-600/80 mt-0.5">Instant solutions generated</div>
        </div>

        <div
          id="stat-card-pending"
          onClick={() => {
            setStatusFilter((prev) => (prev === 'Pending' ? 'ALL' : 'Pending'));
            setUrgencyFilter('ALL');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-white border-amber-300 ring-2 ring-amber-500/10 shadow-xs'
              : 'bg-white/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-700">{stats.pending}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Awaiting consultant follow-up</div>
        </div>

        <div
          id="stat-card-resolved"
          onClick={() => {
            setStatusFilter((prev) => (prev === 'Resolved' ? 'ALL' : 'Resolved'));
            setUrgencyFilter('ALL');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Resolved'
              ? 'bg-white border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs'
              : 'bg-white/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Cases closed successfully</div>
        </div>

        <div
          id="stat-card-critical"
          onClick={() => {
            setUrgencyFilter((prev) => (prev === 'Critical_or_High' ? 'ALL' : 'Critical_or_High'));
            setStatusFilter('ALL');
          }}
          className={`col-span-2 lg:col-span-1 p-4 rounded-xl border transition-all cursor-pointer ${
            urgencyFilter === 'Critical_or_High'
              ? 'bg-white border-rose-300 ring-2 ring-rose-500/10 shadow-xs'
              : 'bg-white/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">High / Critical</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-700">{stats.critical}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Requires priority attention</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="dashboard-search-input"
              type="text"
              placeholder="Search by client name, subject, email, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-selector" className="text-xs font-semibold text-slate-500 shrink-0">
              Sort:
            </label>
            <select
              id="sort-selector"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="urgency">Highest Urgency</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Status:
          </span>
          {['ALL', 'AI Responded', 'Pending', 'Resolved'].map((st) => (
            <button
              id={`filter-status-${st.toLowerCase().replace(' ', '-')}`}
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          <span className="text-slate-400 font-medium">Urgency:</span>
          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((urg) => (
            <button
              id={`filter-urgency-${urg.toLowerCase()}`}
              key={urg}
              type="button"
              onClick={() => setUrgencyFilter(urg)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                urgencyFilter === urg
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {urg === 'ALL' ? 'All Urgencies' : urg}
            </button>
          ))}

          {categories.length > 0 && (
            <>
              <span className="text-slate-300 mx-1">|</span>
              <span className="text-slate-400 font-medium">Category:</span>
              <select
                id="filter-category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </>
          )}

          {(statusFilter !== 'ALL' || urgencyFilter !== 'ALL' || categoryFilter !== 'ALL' || searchQuery) && (
            <button
              id="clear-filters-btn"
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setUrgencyFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Support Requests Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {tickets.length === 0
              ? 'There are no submitted requests in the repository yet. Submit a new support request to test the automated AI advisor!'
              : 'No tickets matched your current filter criteria. Try adjusting the search query or status filter.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {tickets.length === 0 ? (
              <>
                <button
                  id="empty-state-new-ticket-btn"
                  type="button"
                  onClick={onNewRequest}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit First Request</span>
                </button>
                {onRestoreDemoData && (
                  <button
                    id="empty-state-restore-btn"
                    type="button"
                    onClick={onRestoreDemoData}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>Load Sample Inquiries</span>
                  </button>
                )}
              </>
            ) : (
              <button
                id="empty-state-clear-filters-btn"
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setUrgencyFilter('ALL');
                  setCategoryFilter('ALL');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300/80 shadow-2xs hover:shadow-xs transition-all overflow-hidden group"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {ticket.id}
                      </span>
                      {getStatusBadge(ticket.status)}
                      {getUrgencyBadge(ticket.urgency)}
                      {ticket.category && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Tag className="w-3 h-3 text-slate-500" />
                          <span>{ticket.category}</span>
                        </span>
                      )}
                    </div>
                    <h3
                      onClick={() => onSelectTicket(ticket)}
                      className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer pt-1"
                    >
                      {ticket.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status quick toggle */}
                    <select
                      id={`status-toggle-${ticket.id}`}
                      value={ticket.status}
                      onChange={(e) => onUpdateStatus(ticket.id, e.target.value as TicketStatus)}
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Pending">Pending</option>
                      <option value="AI Responded">AI Responded</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <button
                      id={`view-ticket-btn-${ticket.id}`}
                      type="button"
                      onClick={() => onSelectTicket(ticket)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Review Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* AI Summary snippet */}
                {ticket.summary && (
                  <div className="mb-3 p-3 rounded-lg bg-indigo-50/40 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-indigo-900">AI Executive Summary: </span>
                      <span>{ticket.summary}</span>
                    </div>
                  </div>
                )}

                {/* User complaint excerpt */}
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {ticket.complaint}
                </p>

                {/* Footer metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ticket.name}</span>
                      <span className="text-slate-400 font-normal">({ticket.email})</span>
                    </span>

                    {ticket.sentiment && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                        <span>Sentiment: {ticket.sentiment}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {ticket.conversation && ticket.conversation.length > 2 && (
                      <span className="text-indigo-600 font-medium">
                        {ticket.conversation.length} messages in thread
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
