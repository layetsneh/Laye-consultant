import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupportTicket, TicketStatus, ChatMessage } from '../types';
import { INITIAL_SEED_TICKETS } from '../data/initialTickets';

export const DEFAULT_SUPABASE_URL = 'https://ocnnzxazrhcqahuwbphk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-57e-uHhWkivtsW5-aK6sg_avsyZRzy';

const STORAGE_KEY_TICKETS = 'laye_consultant_tickets_v1';
const STORAGE_KEY_SUPABASE_URL = 'laye_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'laye_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const { url, anonKey } = getStoredSupabaseConfig();
    supabaseInstance = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseInstance;
}

export function updateSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, anonKey.trim());
  supabaseInstance = createClient(url.trim(), anonKey.trim(), {
    auth: { persistSession: false },
  });
}

// Local storage fallback handlers - resiliently seeded
export function getLocalTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_SEED_TICKETS));
      return INITIAL_SEED_TICKETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty or corrupt, restore seed tickets
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_SEED_TICKETS));
    return INITIAL_SEED_TICKETS;
  } catch (e) {
    console.error('Error reading local tickets', e);
    return INITIAL_SEED_TICKETS;
  }
}

export function resetLocalTicketsToDefault(): SupportTicket[] {
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_SEED_TICKETS));
  return INITIAL_SEED_TICKETS;
}

export function saveLocalTicket(ticket: SupportTicket): SupportTicket[] {
  const existing = getLocalTickets();
  const index = existing.findIndex((t) => t.id === ticket.id);
  let updated: SupportTicket[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = ticket;
  } else {
    updated = [ticket, ...existing];
  }
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated));
  return updated;
}

export function updateLocalTicketStatus(id: string, status: TicketStatus): SupportTicket[] {
  const existing = getLocalTickets();
  const updated = existing.map((t) =>
    t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
  );
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated));
  return updated;
}

export function addLocalMessage(id: string, message: ChatMessage): SupportTicket[] {
  const existing = getLocalTickets();
  const updated = existing.map((t) => {
    if (t.id === id) {
      const conv = t.conversation || [];
      return {
        ...t,
        conversation: [...conv, message],
        updated_at: new Date().toISOString(),
      };
    }
    return t;
  });
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated));
  return updated;
}

export interface SupabaseHealthResult {
  connected: boolean;
  tableExists: boolean;
  error?: string;
}

export async function testSupabaseConnection(): Promise<SupabaseHealthResult> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('tickets').select('id').limit(1);

    if (error) {
      // Check if table missing
      if (error.code === '42P01' || error.message.includes('relation "tickets" does not exist') || error.message.includes('not found')) {
        return { connected: true, tableExists: false, error: 'Database reached, but "tickets" table not created yet.' };
      }
      return { connected: false, tableExists: false, error: error.message };
    }
    return { connected: true, tableExists: true };
  } catch (err: any) {
    return { connected: false, tableExists: false, error: err?.message || 'Connection failed' };
  }
}

export async function fetchAllTickets(): Promise<{ tickets: SupportTicket[]; isSupabase: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed, fallback to local storage:', error.message);
      return { tickets: getLocalTickets(), isSupabase: false, error: error.message };
    }

    if (data && Array.isArray(data) && data.length > 0) {
      // Ensure JSON columns parse properly
      const formatted: SupportTicket[] = data.map((item) => ({
        ...item,
        key_actions: Array.isArray(item.key_actions)
          ? item.key_actions
          : typeof item.key_actions === 'string'
          ? JSON.parse(item.key_actions || '[]')
          : [],
        conversation: Array.isArray(item.conversation)
          ? item.conversation
          : typeof item.conversation === 'string'
          ? JSON.parse(item.conversation || '[]')
          : [],
      }));

      // Sync into local storage as well for seamless offline resilience
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(formatted));
      return { tickets: formatted, isSupabase: true };
    }
    return { tickets: getLocalTickets(), isSupabase: true };
  } catch (e: any) {
    console.warn('Error connecting to Supabase:', e);
    return { tickets: getLocalTickets(), isSupabase: false, error: e?.message };
  }
}

export async function saveTicket(ticket: SupportTicket): Promise<{ success: boolean; isSupabase: boolean; error?: string }> {
  // Always persist to local cache first
  saveLocalTicket(ticket);

  try {
    const client = getSupabaseClient();
    const payload = {
      id: ticket.id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      complaint: ticket.complaint,
      ai_response: ticket.ai_response,
      category: ticket.category,
      urgency: ticket.urgency,
      urgency_reasoning: ticket.urgency_reasoning || '',
      summary: ticket.summary || '',
      sentiment: ticket.sentiment || 'Neutral',
      key_actions: ticket.key_actions || [],
      status: ticket.status,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at || ticket.created_at,
      conversation: ticket.conversation || [],
    };

    const { error } = await client.from('tickets').upsert(payload);
    if (error) {
      console.warn('Supabase save error:', error.message);
      return { success: true, isSupabase: false, error: error.message };
    }
    return { success: true, isSupabase: true };
  } catch (e: any) {
    console.warn('Supabase save exception:', e);
    return { success: true, isSupabase: false, error: e?.message };
  }
}

export async function updateTicketStatusInDb(id: string, status: TicketStatus): Promise<boolean> {
  updateLocalTicketStatus(id, status);
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function addMessageToTicketInDb(id: string, message: ChatMessage): Promise<boolean> {
  const updatedLocal = addLocalMessage(id, message);
  const ticket = updatedLocal.find((t) => t.id === id);
  if (!ticket) return false;

  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('tickets')
      .update({
        conversation: ticket.conversation || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export const SUPABASE_SQL_SETUP = `-- Run this in Supabase Dashboard -> SQL Editor
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  complaint TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT NOT NULL,
  urgency_reasoning TEXT,
  summary TEXT,
  sentiment TEXT,
  key_actions JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'AI Responded',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  conversation JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS and public policies for the support portal
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON tickets;
CREATE POLICY "Allow public read access" ON tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON tickets;
CREATE POLICY "Allow public insert access" ON tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON tickets;
CREATE POLICY "Allow public update access" ON tickets FOR UPDATE USING (true);
`;
