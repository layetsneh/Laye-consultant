import { GoogleGenAI, Type } from '@google/genai';
import { SupportTicket, TicketCategory, TicketUrgency, SentimentType } from '../types';

export interface AIAnalysisResult {
  ai_response: string;
  category: TicketCategory;
  urgency: TicketUrgency;
  urgency_reasoning: string;
  summary: string;
  sentiment: SentimentType;
  key_actions: string[];
  isFallback?: boolean;
}

/**
 * Intelligent deterministic fallback generator when Gemini API is unavailable or unconfigured
 */
export function generateSmartFallbackAnalysis(
  name: string,
  email: string,
  subject: string,
  complaint: string
): AIAnalysisResult {
  const lowerText = `${subject} ${complaint}`.toLowerCase();

  // 1. Detect Category
  let category: TicketCategory = 'General Inquiry';
  if (/bill|invoice|charge|refund|price|tier|payment|subscription|receipt|cost|expense/i.test(lowerText)) {
    category = 'Billing & Invoicing';
  } else if (/soc|hipaa|compliance|gdpr|legal|audit|pci|security|vulnerability|leak|breach/i.test(lowerText)) {
    category = /compliance|audit/i.test(lowerText) ? 'Compliance & Legal' : 'Account & Security';
  } else if (/architecture|strategy|roadmap|consulting|growth|scaling|advisory|evaluat/i.test(lowerText)) {
    category = 'Strategic Consulting';
  } else if (/api|database|postgres|timeout|504|500|crash|outage|latency|server|bug|error|down|gateway|cluster/i.test(lowerText)) {
    category = 'Technical Support';
  } else if (/feature|ui|ux|integration|mobile|portal|webhook|sdk/i.test(lowerText)) {
    category = 'Product & Features';
  }

  // 2. Detect Urgency
  let urgency: TicketUrgency = 'Medium';
  let urgencyReasoning = 'Standard operational request requiring diagnostic evaluation.';
  if (/outage|down|crash|emergency|critical|immediate|p0|blocker|timeout|revenue|100%/i.test(lowerText)) {
    urgency = 'Critical';
    urgencyReasoning = 'High severity issue with direct potential impact on operational availability or ongoing service delivery.';
  } else if (/urgent|high|dispute|spike|unexpected|fail|breach|error/i.test(lowerText)) {
    urgency = 'High';
    urgencyReasoning = 'Elevated priority incident requiring swift advisory intervention.';
  } else if (/inquiry|question|roadmap|advice|explore|plan/i.test(lowerText)) {
    urgency = 'Low';
    urgencyReasoning = 'Exploratory advisory topic without immediate system degradation.';
  }

  // 3. Detect Sentiment
  let sentiment: SentimentType = 'Neutral';
  if (/frustrated|disappointed|angry|unacceptable|wrong|terrible|broken/i.test(lowerText)) {
    sentiment = 'Frustrated';
  } else if (/critical|emergency|urgent|asap|blocking|immediately/i.test(lowerText)) {
    sentiment = 'Urgent';
  } else if (/thank|appreciate|excited|glad|great/i.test(lowerText)) {
    sentiment = 'Positive';
  }

  // 4. Extract Key Action Points based on category
  let keyActions: string[] = [];
  if (category === 'Technical Support') {
    keyActions = [
      'Inspect application server logs and upstream gateway timeout thresholds',
      'Verify database connection pool saturation and active worker threads',
      'Deploy localized circuit breakers or rate-limiting on incoming request bursts',
      'Provide diagnostic trace identifiers to Laye Consultant technical operations',
    ];
  } else if (category === 'Billing & Invoicing') {
    keyActions = [
      'Audit the most recent billing run against your active service tier agreement',
      'Initiate an account ledger reconciliation to isolate line-item discrepancies',
      'Submit request for interim credit memo pending contract review',
    ];
  } else if (category === 'Compliance & Legal' || category === 'Account & Security') {
    keyActions = [
      'Perform preliminary security gap assessment against required compliance framework',
      'Review access control logs and customer-managed key rotation policies',
      'Schedule dedicated compliance readiness review with Laye Consultant advisory partner',
    ];
  } else {
    keyActions = [
      'Conduct requirements discovery session to define strategic milestones',
      'Formulate architectural blueprint tailored to business objectives',
      'Review implementation timeline and resource allocation roadmap',
    ];
  }

  // 5. Executive Advisory Response (Markdown)
  const ai_response = `### Executive Advisory & Resolution Protocol

Dear ${name},

Thank you for contacting **Laye Consultant**. We have received your inquiry regarding **"${subject}"** and our advisory practice has initiated an initial assessment of your case.

---

#### 1. Situation Analysis & Initial Assessment
* **Identified Domain**: \`${category}\`
* **Assigned Priority**: \`${urgency}\` (${urgencyReasoning})
* **Reported Details**:
> "${complaint}"

---

#### 2. Immediate Recommended Actions
${keyActions.map((action, i) => `${i + 1}. **${action}**`).join('\n')}

---

#### 3. Advisory Support & Next Steps
Our consulting specialists are standing by to collaborate with your team. You can reply directly within this portal with any additional diagnostic logs, architecture diagrams, or account references.

Warm regards,  
**Laye Consultant Client Advisory Practice**  
*Direct Support & Executive Escalations*`;

  const summary = `Inquiry regarding ${subject} submitted by ${name} categorized under ${category}.`;

  return {
    ai_response,
    category,
    urgency,
    urgency_reasoning: urgencyReasoning,
    summary,
    sentiment,
    key_actions: keyActions,
    isFallback: true,
  };
}

/**
 * Intelligent follow-up reply fallback
 */
export function generateSmartFallbackFollowUp(
  ticketSubject: string,
  clientName: string,
  userMessage: string
): string {
  return `Dear ${clientName || 'Client'},

Thank you for your follow-up message regarding **"${ticketSubject}"**.

We have logged your latest update:
> "${userMessage}"

Our advisory team has updated your case record with these details. If this is an urgent blocker, our senior consultant will prioritize this in the active queue. You will receive further updates directly on this ticket thread.

Warm regards,  
**Laye Consultant Advisory Lead**`;
}

/**
 * Main Gemini AI inquiry analyzer with automatic fallback
 */
export async function analyzeInquiryWithGemini(
  name: string,
  email: string,
  subject: string,
  complaint: string,
  apiKey?: string
): Promise<AIAnalysisResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    console.warn('GEMINI_API_KEY is not set. Utilizing Laye Consultant deterministic intelligence engine.');
    return generateSmartFallbackAnalysis(name, email, subject, complaint);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the Lead Executive Advisor at "Laye Consultant", an elite management, technical, and strategic consulting firm.
Your job is to:
1. Deliver an immediate, high-touch, empathetic, and actionable consultant response ("ai_response") tailored directly to the client's problem. Address them warmly by name, provide structured guidance (numbered steps, diagnostic checklist, or strategic counsel), and provide an empathetic, authoritative tone.
2. Auto-categorize the issue into one of: 'Technical Support', 'Billing & Invoicing', 'Strategic Consulting', 'Account & Security', 'Product & Features', 'Compliance & Legal', or 'General Inquiry'.
3. Evaluate the urgency level ('Low', 'Medium', 'High', 'Critical') with a clear 1-sentence reasoning ('urgency_reasoning').
4. Formulate an executive summary ('summary') of 1-2 clear sentences summarizing the customer's core challenge.
5. Identify user sentiment ('sentiment': 'Positive', 'Neutral', 'Frustrated', or 'Urgent').
6. Provide 2-4 concrete immediate action points ('key_actions') that the client or advisory team should take.

Format your entire response strictly as valid JSON matching the schema provided.`;

    const prompt = `Client Details:
Name: ${name}
Email: ${email}
Ticket Subject: ${subject}

Client Complaint / Question:
"""
${complaint}
"""

Please analyze this submission, generate the consultant response, categorize it, assess urgency, summarize it, and provide key action items.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ai_response: {
              type: Type.STRING,
              description: 'The full consultant reply written to the client with rich formatting and structured steps.',
            },
            category: {
              type: Type.STRING,
              description: 'Category: Technical Support, Billing & Invoicing, Strategic Consulting, Account & Security, Product & Features, Compliance & Legal, or General Inquiry.',
            },
            urgency: {
              type: Type.STRING,
              description: 'Urgency rating: Low, Medium, High, or Critical.',
            },
            urgency_reasoning: {
              type: Type.STRING,
              description: 'Brief reason why this urgency was assigned.',
            },
            summary: {
              type: Type.STRING,
              description: '1-2 sentence executive summary of the complaint.',
            },
            sentiment: {
              type: Type.STRING,
              description: 'Client sentiment: Positive, Neutral, Frustrated, or Urgent.',
            },
            key_actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-4 actionable next steps or recommendations.',
            },
          },
          required: [
            'ai_response',
            'category',
            'urgency',
            'urgency_reasoning',
            'summary',
            'sentiment',
            'key_actions',
          ],
        },
      },
    });

    const rawText = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      parsedData = match ? JSON.parse(match[0]) : {};
    }

    return {
      ai_response:
        parsedData.ai_response ||
        `Dear ${name},\n\nThank you for reaching out to Laye Consultant regarding "${subject}". We have received your request and our advisory team is reviewing the details.\n\n${complaint}`,
      category: parsedData.category || 'Technical Support',
      urgency: parsedData.urgency || 'Medium',
      urgency_reasoning:
        parsedData.urgency_reasoning || 'Operational inquiry requiring technical review.',
      summary:
        parsedData.summary || `Inquiry regarding ${subject} submitted by ${name}.`,
      sentiment: parsedData.sentiment || 'Neutral',
      key_actions: parsedData.key_actions || [
        'Verify system configurations',
        'Review account credentials',
        'Follow up with Laye Consultant support team',
      ],
      isFallback: false,
    };
  } catch (error) {
    console.error('Gemini API call failed, using intelligent fallback:', error);
    return generateSmartFallbackAnalysis(name, email, subject, complaint);
  }
}

/**
 * Main Gemini AI follow-up generator with fallback
 */
export async function generateFollowUpWithGemini(
  ticketSubject: string,
  clientName: string,
  previousConversation: any[],
  userMessage: string,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    return generateSmartFallbackFollowUp(ticketSubject, clientName, userMessage);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const formattedHistory = Array.isArray(previousConversation)
      ? previousConversation
          .map((m: any) => `${m.role === 'user' ? 'Client' : 'Laye Consultant'}: ${m.content}`)
          .join('\n\n')
      : '';

    const prompt = `You are continuing a support and advisory conversation at Laye Consultant with client ${clientName || 'the client'}.
Ticket Subject: "${ticketSubject || 'Support Case'}"

Conversation History:
${formattedHistory}

Latest Message from Client:
"${userMessage}"

Provide a concise, helpful, expert follow-up response resolving their query or clarifying next steps. Keep a reassuring, professional tone.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a senior advisor at Laye Consultant delivering direct, helpful advice.',
        temperature: 0.5,
      },
    });

    return (
      response.text?.trim() ||
      generateSmartFallbackFollowUp(ticketSubject, clientName, userMessage)
    );
  } catch (error) {
    console.error('Follow-up Gemini error, using fallback:', error);
    return generateSmartFallbackFollowUp(ticketSubject, clientName, userMessage);
  }
}
