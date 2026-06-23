# Tally Expression of Interest Form

Agent-facing setup notes for issue #24 and follow-on website implementation.

## Live form contract

- Form name: BOLD Expression of Interest
- Form URL: `https://tally.so/r/A7aa0W`
- Form ID: `A7aa0W`
- Embed URL template: `https://tally.so/embed/A7aa0W?route={routeValue}`
- Route parameter name: `route`

Accepted route values:

| Opportunity Route | Route value |
| --- | --- |
| PhD Students | `phd-students` |
| Visiting Students | `visiting-students` |
| Master's Students | `masters-students` |
| Research Engineers | `research-engineers` |
| Fellows and Experienced Researchers | `fellows` |
| Collaborators | `collaborators` |

The website implementation should use one shared Tally form and pass the selected
Opportunity Route through the `route` hidden field or prefill parameter.

## Current status

The live form exists and the public embed confirms the form ID, title, and hidden
`route` field. The rest of issue #24 is not complete in the public form yet:
baseline fields, CV/resume upload, route-specific conditional sections, and
confirmation copy are not publicly visible.

Completing the setup requires access to the BOLD-owned Tally workspace. Agents
without that access can verify the public embed contract, but cannot configure
fields, conditional logic, file-upload rules, confirmation behavior, owner email
notifications, or Google Sheets integration.

## Tally owner setup checklist

Use this checklist in the Tally workspace before treating issue #24 as complete:

- Add the shared baseline fields listed below.
- Keep `route` as a hidden or pre-filled field populated from the website embed
  URL.
- Add route-specific conditional sections for all accepted route values.
- Configure the CV/resume upload as PDF-only with the 10 MB free-plan limit
  communicated in the form.
- Require CV/resume upload for PhD Students, Visiting Students, Master's
  Students, Research Engineers, and Fellows and Experienced Researchers.
- Keep CV/resume upload optional for Collaborators.
- Avoid detailed immigration or visa questions, demographic questions, and
  equal-opportunities monitoring questions.
- Configure the non-promissory confirmation state below.
- Send form-owner notifications to the BOLD intake address.
- Sync submissions into one Google Sheet used as the Expression of Interest
  Register.
- Confirm the `route` value appears as a filterable column in the register.
- Confirm respondents can submit without a Tally or Google account.

## Required shared fields

The form should collect this baseline for every Expression of Interest:

- Full name
- Email
- Current role/title
- Current organization/institution
- Location/time zone
- Route of interest, hidden or pre-filled from `route`
- Required fit statement, prompted as 200-400 words on why BOLD, the route, and
  the research or technical fit
- Relevant links, such as website, Google Scholar, GitHub, LinkedIn, papers,
  projects, or portfolios
- Free-form Research Direction Interest
- PDF CV/resume upload
- Optional location, timing, or eligibility constraints
- Consent for BOLD to store and review the submission
- Optional future-opportunities opt-in

The form must not ask for detailed immigration or visa status, demographic
questions, or equal-opportunities monitoring questions in the MVP.

## CV/resume upload rules

- Accept PDF only.
- Communicate Tally's free-plan upload limit of 10 MB per file.
- Require CV/resume upload for `phd-students`, `visiting-students`,
  `masters-students`, `research-engineers`, and `fellows`.
- Make CV/resume upload optional for `collaborators`.

## Route-specific conditional sections

Each route should show 3-5 conditional questions:

- PhD Students: current/proposed programme and institution, intended start
  timing, research interests, possible supervisors or groups, formal application
  stage.
- Visiting Students: current institution and programme, proposed visit dates and
  duration, possible BOLD host or group, focused project idea, funding or timing
  constraints.
- Master's Students: current Master's programme, project window, technical or
  research interests, relevant coursework or prior projects, desired project
  shape.
- Research Engineers: systems or infrastructure areas of interest, examples of
  ML systems/research infrastructure/evaluation/data tooling/platform work,
  relevant code or project links, availability and working mode constraints.
- Fellows and Experienced Researchers: current role and institution, research
  agenda, proposed contribution to BOLD, representative outputs,
  visiting/collaboration/longer-term interest and timing.
- Collaborators: individual/group/company/institutional interest type, proposed
  collaboration and scientific motivation, expected outputs, relevant people,
  timing, and any funding, data, or partnership considerations.

## Confirmation and integrations

The confirmation state should be non-promissory:

> BOLD has received your Expression of Interest. We review Expressions of
> Interest periodically and will contact you if there is a strong fit with
> current BOLD priorities, supervision capacity, or open opportunities. Formal
> applications may still need to happen through university, departmental,
> placement, or employment processes.

Operational requirements:

- Form owner email notifications go to the BOLD intake address.
- Submissions sync into one Google Sheet used as the Expression of Interest
  Register.
- The `route` value is captured as a filterable column in that register.
- Respondents do not need a Tally or Google account to submit.

## Public verification on 2026-06-23

The public Tally payload at `https://tally.so/embed/A7aa0W?route=phd-students`
currently exposes:

- form title: `BOLD Expression of Interest`
- form ID: `A7aa0W`
- workspace ID: `3NbqgN`
- one hidden field named `route`
- no visible baseline fields
- no CV/resume upload field
- no route-specific conditional sections
- no public integration metadata

The unauthenticated Tally forms API returned `401 Unauthorized`, so completing
the live form configuration requires Tally owner access.
