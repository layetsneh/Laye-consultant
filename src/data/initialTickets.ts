import { SupportTicket } from '../types';

export const INITIAL_SEED_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-CRIT-901',
    name: 'Marcus Vance',
    email: 'm.vance@apexlogistics.com',
    subject: 'Production API Gateway 504 gateway timeout blocking warehouse dispatch',
    complaint:
      'Our primary API Gateway at us-east-1 is throwing intermittent 504 gateway timeouts for all inbound delivery scanning units. Approximately 1,200 handheld scanners are unable to upload shipment confirmations, causing physical warehouse fulfillment delays. We need immediate diagnostic assistance.',
    ai_response: `### Executive Advisory & Urgent Resolution Protocol

Dear Marcus,

Thank you for contacting **Laye Consultant**. We recognize the critical operational impact on your warehouse fulfillment line and have mobilized this immediate action plan.

---

#### 1. Immediate Root Cause Hypotheses
* **Upstream Backend Connection Starvation**: 504 errors specifically indicate your API Gateway cannot obtain a timely response from your containerized microservices or load balancer within your configured timeout window (typically 29–30 seconds).
* **Connection Pool Saturation**: Your scanning units may be executing unbounded concurrent requests, saturating the database or internal gRPC connection pools.

---

#### 2. Immediate Diagnostic Checklist
1. **Enable Circuit Breaking on Scanners**: Instruct mobile app clients to employ exponential backoff with jitter rather than rapid-fire retries.
2. **Inspect Upstream ALB Target Group Metrics**: Check if \`TargetResponseTime\` has spiked or if \`UnHealthyHostCount\` is rising.
3. **Temporarily Scale Upstream Replicas**: If running ECS/EKS, increase target container replica count by 50% immediately to relieve socket queues.

---

#### 3. Recommended Remediation & Next Steps
* Our technical consulting lead will review your CloudWatch logs if you provide your recent request IDs.
* Please execute the scaling adjustment and confirm if error rates drop below 1%.

Warm regards,  
**Laye Consultant Technical Advisory Practice**`,
    category: 'Technical Support',
    urgency: 'Critical',
    urgency_reasoning:
      'Direct warehouse revenue impact and physical logistics halt affecting over 1,200 active devices.',
    summary:
      'API Gateway 504 timeouts preventing warehouse scanners from dispatching shipments.',
    sentiment: 'Urgent',
    key_actions: [
      'Scale upstream container replicas by 50%',
      'Activate exponential backoff with jitter on scanning handhelds',
      'Check ALB target health and latency distribution',
      'Review database connection pool utilization in us-east-1',
    ],
    status: 'AI Responded',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    conversation: [
      {
        id: 'msg-seed-1',
        role: 'user',
        senderName: 'Marcus Vance',
        content:
          'Our primary API Gateway at us-east-1 is throwing intermittent 504 gateway timeouts for all inbound delivery scanning units. Approximately 1,200 handheld scanners are unable to upload shipment confirmations, causing physical warehouse fulfillment delays. We need immediate diagnostic assistance.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'msg-seed-2',
        role: 'assistant',
        senderName: 'Laye Consultant AI',
        content:
          'We have formulated a priority incident triage protocol. Please scale your upstream container replicas immediately and enable exponential backoff on client scanners.',
        timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
      },
    ],
  },
  {
    id: 'TICK-MED-442',
    name: 'Chloe Tremblay',
    email: 'chloe@biogenix-analytics.ca',
    subject: 'Request for cloud architecture assessment for HIPAA compliant data lake',
    complaint:
      'We are designing a multi-omics bioinformatics research lake in AWS. We need consulting guidance on configuring encrypted S3 buckets with KMS customer-managed keys, AWS Glue ETL segregation, and audit logging to satisfy HIPAA & PIPEDA compliance guidelines.',
    ai_response: `### Strategic Architecture Review & Compliance Roadmap

Dear Chloe,

Thank you for engaging **Laye Consultant** for your cloud architecture and compliance initiatives. Building a genomics data lake that adheres strictly to HIPAA and PIPEDA requires a defense-in-depth security perimeter.

---

#### 1. S3 & Key Management Strategy (KMS)
* **KMS Key Rotation**: Provision customer-managed keys (CMK) with automatic annual key rotation enabled.
* **Bucket Policy Hardening**: Enforce \`aws:SecureTransport\` (TLS 1.3 only) and deny unencrypted \`s3:PutObject\` operations.
* **Object Lock**: Implement S3 Object Lock in Governance mode for raw sequencer files to establish immutable audit trails.

---

#### 2. Pipeline Segregation
* Separate your **Landing (Raw)**, **Processing (Staging)**, and **Curated (Analytics)** zones across dedicated AWS accounts using AWS Organizations with Service Control Policies (SCPs).
* Run AWS Glue in private VPC subnets with VPC Endpoints for S3, preventing data egress to the public internet.

---

#### 3. Audit & Verification
* Configure AWS CloudTrail data events specifically on the data lake buckets, streaming to an isolated security auditing account.

We would be pleased to schedule a deep-dive architecture diagram review session with your engineering team.

Warm regards,  
**Laye Consultant Cloud & Security Practice**`,
    category: 'Strategic Consulting',
    urgency: 'Medium',
    urgency_reasoning:
      'Architectural planning inquiry for upcoming compliance deadline without active system downtime.',
    summary:
      'Architecture and security compliance consultation for AWS HIPAA-compliant bioinformatics data lake.',
    sentiment: 'Neutral',
    key_actions: [
      'Implement multi-account S3 landing/curated zone segregation',
      'Enforce TLS 1.3 and KMS CMK encryption policies on S3 buckets',
      'Deploy Glue jobs inside isolated VPC subnets with S3 endpoints',
    ],
    status: 'Resolved',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'TICK-HIGH-208',
    name: 'Julian Mercer',
    email: 'julian.m@finrise-capital.com',
    subject: 'Discrepancy in automated billing invoices following tier upgrade',
    complaint:
      'We upgraded our enterprise subscription to Tier 3 on the 1st of the month, but received dual invoices charging both the legacy Tier 2 pro-rata fee and full Tier 3 price without the agreed 20% annual discount applied. Please adjust and verify invoice #INV-88319.',
    ai_response: `### Billing Investigation & Pro-Rata Correction Notice

Dear Julian,

Thank you for reaching out to **Laye Consultant**. We apologize for the confusion regarding Invoice **#INV-88319** following your tier upgrade.

---

#### 1. Findings from Account Review
* Our subscription billing logic executed an automatic mid-cycle pro-rata calculation for Tier 2 alongside the initial charge for Tier 3.
* The agreed 20% enterprise discount coupon was pending manual sales operations approval on our billing gateway.

---

#### 2. Action Taken
1. **Credit Memo Issued**: We have issued Credit Note **#CR-1042** for the duplicate prorated portion ($1,450.00).
2. **Discount Re-applied**: The 20% enterprise discount has been permanently linked to your billing profile and applied retroactively.
3. **Updated Statement**: A revised, clean invoice reflecting the net correct total has been generated.

If you have any questions regarding the adjusted statement, please reply directly to this ticket.

Warm regards,  
**Laye Consultant Finance & Billing Advisory**`,
    category: 'Billing & Invoicing',
    urgency: 'High',
    urgency_reasoning:
      'Active dispute on financial transaction and erroneous customer charges require fast resolution.',
    summary:
      'Invoice discrepancy and duplicate charges after tier upgrade requiring credit adjustment and discount application.',
    sentiment: 'Frustrated',
    key_actions: [
      'Verify credit memo #CR-1042 in billing portal',
      'Confirm permanent attachment of 20% enterprise discount',
      'Approve updated net invoice statement',
    ],
    status: 'Pending',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
];
