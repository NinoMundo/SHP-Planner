# SHP Planner Implementation Plan

This plan covers Supabase integration, rules-based document selection, PDF generation, and email delivery for the SHP Planner app.

## Goals
- Capture form submissions in Supabase.
- Determine required documents based on citizenship and current residency.
- Generate a branded SHP PDF plan (timeline + checklist + documents).
- Email the PDF to the user.

## Proposed Architecture
- Node.js (Express) server as the API layer.
- Supabase for persistence and reference data.
- Server-side PDF generation.
- Email provider for delivery.

## Data Model (Supabase)
Tables (suggested):
- `submissions`
  - `id` (uuid, pk)
  - `created_at` (timestamp)
  - `citizenship_country` (text)
  - `current_residency_country` (text)
  - `purpose` (text)
  - `arrival_date` (date)
  - `departure_date` (date, nullable)
  - `email` (text)
  - `plan_payload` (jsonb) – stored snapshot used to build PDF
- `document_rules`
  - `id` (uuid, pk)
  - `country_code` (text)
  - `country_name` (text)
  - `rule_type` (text: citizenship | residency)
  - `documents` (text[]) or `documents` (jsonb)
  - `notes` (text, nullable)
- `documents_catalog`
  - `id` (uuid, pk)
  - `document_name` (text)
  - `description` (text, nullable)
- `email_logs`
  - `id` (uuid, pk)
  - `submission_id` (uuid, fk -> submissions)
  - `to_email` (text)
  - `status` (text)
  - `provider_id` (text, nullable)
  - `error` (text, nullable)
  - `created_at` (timestamp)

## API Endpoints
- `POST /api/plan`
  - Input: form payload
  - Output: plan + document list (current flow)
- `POST /api/submit`
  - Input: form payload + email
  - Flow: validate -> resolve document rules -> save submission -> build PDF -> send email
  - Output: confirmation + submission id

## Business Logic
- Resolve documents by:
  - Citizenship country rules + current residency country rules
  - Merge and deduplicate documents
  - Add standard Paraguay residency documents
- Timeline steps:
  - Use current reference data and dates relative to planned arrival

## PDF Generation
- Server-side generation with a lightweight renderer.
- Branded layout: SHP header, user details, timeline, checklist, documents.
- Attach to email as PDF.

## Email Delivery
- Use one provider (Resend/SendGrid/Postmark/SES).
- Sender: `Sweet Home Paraguay <noreply@...>`
- Attach generated PDF.

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EMAIL_PROVIDER_KEY`
- `EMAIL_FROM`

## Execution Steps (Implementation Order)
1) Add Supabase client and `.env` loader.
2) Create SQL schema/migrations for tables.
3) Add country/document rules seed data.
4) Add `/api/submit` endpoint for persistence + document lookup.
5) Implement PDF generation.
6) Implement email send + logging.
7) Add basic admin endpoint or report (optional).

## Open Questions
- Which email provider should we use?
- Do we need a public admin view for submissions?
- How should country rules be structured (CSV import, manual UI, or JSON seed)?
- Any required branding assets for the PDF?
