import React, { useState } from 'react';
import {
  X,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Send,
  Copy,
  Check,
  Tag,
  ShieldAlert,
  ArrowRight,
  ListOrdered,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import Markdown from 'react-markdown';
import { SupportTicket, TicketStatus, ChatMessage } from '../types';
import { generateSmartFallbackFollowUp } from '../lib/consultantAi';

interface TicketDetailModalProps {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onAddMessage: (ticketId: string, message: ChatMessage) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onUpdateStatus,
  onAddMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const keyActionsList = React.useMemo(() => {
    if (Array.isArray(ticket.key_actions)) return ticket.key_actions;
    if (typeof ticket.key_actions === 'string') {
      try {
        const parsed = JSON.parse(ticket.key_actions);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }, [ticket.key_actions]);

  const handleCopyResponse = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(ticket.ai_response || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSendingReply) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      senderName: ticket.name,
      content: replyText.trim(),
      timestamp: new Date().toISOString(),
    };

    onAddMessage(ticket.id, userMessage);
    const sentText = replyText.trim();
    setReplyText('');
    setIsSendingReply(true);

    try {
      const response = await fetch('/api/support/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketSubject: ticket.subject,
          clientName: ticket.name,
          previousConversation: ticket.conversation || [],
          userMessage: sentText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get follow-up AI response');
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        senderName: 'Laye Consultant AI',
        content: data.reply || 'Our advisory team will follow up shortly.',
        timestamp: new Date().toISOString(),
      };

      onAddMessage(ticket.id, aiMessage);
    } catch (err) {
      console.error('Follow-up error:', err);
      const fallbackAiMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        senderName: 'Laye Consultant AI',
        content: generateSmartFallbackFollowUp(ticket.subject, ticket.name, sentText),
        timestamp: new Date().toISOString(),
      };
      onAddMessage(ticket.id, fallbackAiMessage);
    } finally {
      setIsSendingReply(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Bot className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-300 font-semibold">{ticket.id}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300">{formatDate(ticket.created_at)}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {ticket.subject}
              </h2>
            </div>
          </div>

          <button
            id="close-ticket-modal-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata & Status Control Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Tag className="w-3 h-3 text-indigo-600" />
                <span>{ticket.category}</span>
              </span>

              {/* Urgency */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  ticket.urgency === 'Critical'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : ticket.urgency === 'High'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : ticket.urgency === 'Medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {ticket.urgency === 'Critical' ? (
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                ) : ticket.urgency === 'High' ? (
                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                )}
                <span>Urgency: {ticket.urgency}</span>
              </span>

              {/* Client Sentiment */}
              {ticket.sentiment && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-slate-600 border border-slate-200">
                  Sentiment: {ticket.sentiment}
                </span>
              )}
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shadow-2xs">
                {(['Pending', 'AI Responded', 'Resolved'] as TicketStatus[]).map((st) => (
                  <button
                    id={`status-select-${st.toLowerCase().replace(' ', '-')}`}
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(ticket.id, st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      ticket.status === st
                        ? st === 'Resolved'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : st === 'Pending'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Urgency reasoning notice if high or critical */}
          {ticket.urgency_reasoning && (
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-950">AI Urgency Assessment: </span>
                <span>{ticket.urgency_reasoning}</span>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          {ticket.summary && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Executive Summary</span>
              </div>
              <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                {ticket.summary}
              </p>
            </div>
          )}

          {/* Original Complaint section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">{ticket.name}</span>
                  <span className="text-xs text-slate-400 ml-1.5">({ticket.email})</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">Original Complaint</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100 font-normal">
              {ticket.complaint}
            </div>
          </div>

          {/* AI Consultant Advisory Section */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 rounded-xl border border-indigo-200 p-5 sm:p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Laye Consultant AI Response</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Gemini 3.8 Flash
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Automated expert triage &amp; troubleshooting strategy</p>
                </div>
              </div>

              <button
                id="copy-ai-response-btn"
                type="button"
                onClick={handleCopyResponse}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Copy response to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Markdown rendered AI output */}
            <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3 bg-white/90 p-4 rounded-xl border border-indigo-100/80">
              <Markdown>{ticket.ai_response || 'No AI consultation response generated yet.'}</Markdown>
            </div>
          </div>

          {/* Actionable Recommendations Checklist */}
          {keyActionsList.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <ListOrdered className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recommended Action Plan
                </h4>
              </div>
              <div className="space-y-2">
                {keyActionsList.map((action, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      completedActions[idx]
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!completedActions[idx]}
                      onChange={() => toggleAction(idx)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={completedActions[idx] ? 'line-through opacity-75' : 'font-medium'}>
                      {action}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Conversation History & Follow-Up */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Follow-Up Discussion Thread
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                {ticket.conversation?.length || 0} messages
              </span>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {ticket.conversation && ticket.conversation.length > 0 ? (
                ticket.conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600">{msg.senderName}</span>
                      <span>•</span>
                      <span>{formatDate(msg.timestamp)}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  No additional follow-up messages yet.
                </p>
              )}
            </div>

            {/* Follow-Up Input Box */}
            <form onSubmit={handleSendFollowUp} className="pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <input
                  id="followup-message-input"
                  type="text"
                  placeholder="Ask a follow-up question or request further clarification..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={isSendingReply}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                />
                <button
                  id="send-followup-btn"
                  type="submit"
                  disabled={!replyText.trim() || isSendingReply}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 shrink-0 ${
                    !replyText.trim() || isSendingReply
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-xs'
                  }`}
                >
                  {isSendingReply ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingReply ? 'Thinking...' : 'Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {ticket.status !== 'Resolved' ? (
              <button
                id="resolve-ticket-btn"
                type="button"
                onClick={() => onUpdateStatus(ticket.id, 'Resolved')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Ticket as Resolved</span>
              </button>
            ) : (
              <button
                id="reopen-ticket-btn"
                type="button"
                onClick={() => onUpdateStatus(ticket.id, 'Pending')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Re-open for Review</span>
              </button>
            )}
          </div>

          <button
            id="close-ticket-footer-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
