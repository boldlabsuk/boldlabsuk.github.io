# Tally for Expression of Interest Intake

The first Opportunities intake flow will keep the website static and use Tally as the external form backend for Expression of Interest submissions, with Tally as the MVP system of record, Google Sheets sync for lightweight review, and email notifications to the intake address. This was chosen over Google Forms, Typeform, Fillout, and a custom serverless endpoint because it gives the MVP file uploads, structured exports, and a more professional applicant experience on a free plan without adding a server to the website.

The website should embed the form inside each BOLD Expression of Interest Page rather than sending applicants to a third-party form page. The MVP should use one shared Tally form with a hidden or pre-filled route field, so intake stays centralized without maintaining separate forms per route.

Issue #24 superseded the initial route-specific conditional-section decision: the website now owns Opportunity Route selection and route-specific context, while the shared Tally form remains generic for the MVP.

The live form URL, route parameter contract, setup checklist, and current public verification notes are documented in `docs/agents/tally-expression-of-interest.md`.
