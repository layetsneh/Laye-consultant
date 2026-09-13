export type TicketStatus = 'Pending' | 'AI Responded' | 'Resolved';
export type TicketUrgency = 'Low' | 'Medium' | 'High' | 'Critical';
export type SentimentType = 'Positive' | 'Neutral' | 'Frustrated' | 'Urgent';
export type TicketCategory =
  | 'Technical Support'
  | 'Billing & Invoicing'
  | 'Strategic Consulting'
  | 'Account & Security'
  | 'Product & Features'
  | 'Compliance & Legal'
  | 'General Inquiry';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  complaint: string;
  ai_response: string;
  category: TicketCategory | string;
  urgency: TicketUrgency;
  urgency_reasoning?: string;
  summary: string;
  sentiment?: 'Positive' | 'Neutral' | 'Frustrated' | 'Urgent';
  key_actions?: string[];
  status: TicketStatus;
  created_at: string;
  updated_at?: string;
  conversation?: ChatMessage[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}
