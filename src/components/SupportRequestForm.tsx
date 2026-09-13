import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  User,
  Mail,
  FileText,
  MessageSquare,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { SupportTicket, TicketCategory } from '../types';
import { saveTicket } from '../lib/supabase';
import { generateSmartFallbackAnalysis, AIAnalysisResult } from '../lib/consultantAi';

interface SupportRequestFormProps {
  onTicketCreated: (ticket: SupportTicket) => void;
  onViewDashboard: () => void;
}

const SAMPLE_PRESETS = [
  {
    title: 'Cloud Cost & Billing Anomaly',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@enterprise-labs.io',
    subject: 'Unexpected $14,200 spike in AWS multi-region data egress charges',
    complaint:
      'We noticed an unexpected $14,200 surge on our cloud invoice over the last 72 hours. Our Terraform pipelines deployed multi-region backup replication without lifecycle rules. We need immediate advisory on cost containment, AWS dispute documentation, and architectural remediation.',
  },
  {
    title: 'Database Outage in Production',
    name: 'David Alvarez',
    email: 'david.alvarez@fintechflow.com',
    subject: 'PostgreSQL connection pool exhaustion crashing customer checkouts',
    complaint:
      'Our primary PostgreSQL cluster hit 100% max_connections at 09:15 UTC. Microservices are throwing connection timeout errors and checkout transactions are failing for 35% of users. We need emergency triage steps to safely flush zombie connections and optimize PgBouncer pooling.',
  },
  {
    title: 'SOC2 & Security Advisory',
    name: 'Elena Rostova',
    email: 'elena@novapower.org',
    subject: 'Expedited readiness audit for enterprise customer SOC 2 Type II review',
    complaint:
      'An enterprise healthcare prospect requires our completed SOC 2 Type II audit within 4 weeks before executing a $250k contract. We need a fast-track compliance gap analysis, access policy templates, and continuous monitoring tooling recommendations.',
  },
];

export const SupportRequestForm: React.FC<SupportRequestFormProps> = ({
  onTicketCreated,
  onViewDashboard,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setName(preset.name);
    setEmail(preset.email);
    setSubject(preset.subject);
    setComplaint(preset.complaint);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !complaint.trim()) {
      setErrorMessage('Please complete all form fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmissionStep('Transmitting request to Laye Consultant Core...');

    try {
      setSubmissionStep('Analyzing inquiry with Gemini AI...');

      let analysis: AIAnalysisResult;

      try {
        const response = await fetch('/api/support/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            complaint: complaint.trim(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          analysis = data.analysis;
        } else {
          console.warn(`API returned HTTP ${response.status}. Activating Laye Consultant intelligence engine.`);
          analysis = generateSmartFallbackAnalysis(
            name.trim(),
            email.trim(),
            subject.trim(),
            complaint.trim()
          );
        }
      } catch (fetchErr) {
        console.warn('API endpoint unreachable, activating Laye Consultant intelligence engine:', fetchErr);
        analysis = generateSmartFallbackAnalysis(
          name.trim(),
          email.trim(),
          subject.trim(),
          complaint.trim()
        );
      }

      setSubmissionStep('Synchronizing record to Supabase database...');

      const newTicket: SupportTicket = {
        id: `TICK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        complaint: complaint.trim(),
        ai_response: analysis.ai_response,
        category: analysis.category || 'Technical Support',
        urgency: analysis.urgency || 'Medium',
        urgency_reasoning: analysis.urgency_reasoning,
        summary: analysis.summary,
        sentiment: analysis.sentiment || 'Neutral',
        key_actions: analysis.key_actions || [],
        status: 'AI Responded',
        created_at: new Date().toISOString(),
        conversation: [
          {
            id: `msg-${Date.now()}-1`,
            role: 'user',
            senderName: name.trim(),
            content: complaint.trim(),
            timestamp: new Date().toISOString(),
          },
          {
            id: `msg-${Date.now()}-2`,
            role: 'assistant',
            senderName: 'Laye Consultant AI',
            content: analysis.ai_response,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await saveTicket(newTicket);

      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setComplaint('');
      setIsSubmitting(false);

      onTicketCreated(newTicket);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(
        err.message || 'An error occurred while generating the AI response. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Intro hero banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Automated Expert Triage &amp; Advisory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Submit Your Support Question
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Get an instant, in-depth consultant response powered by integrated AI. Every submission is automatically analyzed for urgency, categorized, summarized, and saved to your Supabase cloud repository.
        </p>
      </div>

      {/* Preset quick test badges */}
      <div className="mb-6 p-4 rounded-xl bg-slate-100/70 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Scenarios</span>
          </div>
          <span className="text-xs text-slate-500">Click to autofill form</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              id={`preset-btn-${idx}`}
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-xs group"
            >
              <div className="font-semibold text-slate-800 group-hover:text-indigo-700 flex items-center justify-between">
                <span>{preset.title}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-slate-500 line-clamp-1 mt-0.5">{preset.subject}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Support Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Support Request Form</h2>
              <p className="text-xs text-slate-500">All fields required for accurate AI analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Response Guaranteed</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to process request</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* User Info Row: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="client-name" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Full Name <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="client-name"
                  type="text"
                  required
                  placeholder="e.g. Layet Sneh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="client-email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Work Email Address <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="client-email"
                  type="email"
                  required
                  placeholder="e.g. layetsneh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="ticket-subject" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Subject / Inquiry Headline <span className="text-indigo-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                id="ticket-subject"
                type="text"
                required
                placeholder="e.g. Critical API latency spike during checkout migration"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
                className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Detailed Complaint Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="ticket-complaint" className="block text-sm font-semibold text-slate-800">
                Detailed Complaint or Question <span className="text-indigo-600">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {complaint.length} characters
              </span>
            </div>
            <div className="relative">
              <textarea
                id="ticket-complaint"
                required
                rows={5}
                placeholder="Describe the issue in detail. Include any error codes, logs, financial impact, affected user numbers, or timelines to help our AI formulate an exact advisory plan..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                disabled={isSubmitting}
                className="block w-full p-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* AI Feature Pill Badges */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Instant AI Reply</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Urgency Detection</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Auto-Categorization</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Supabase Cloud Sync</span>
            </div>
          </div>

          {/* Submission button with loading state */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              id="view-previous-tickets-btn"
              type="button"
              onClick={onViewDashboard}
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1 order-2 sm:order-1"
            >
              <span>View Submitted Requests</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="submit-support-ticket-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 order-1 sm:order-2 ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{submissionStep || 'Processing with AI...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit &amp; Generate AI Consultation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
