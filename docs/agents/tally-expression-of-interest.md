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

The Tally form should remain generic. The website owns Opportunity Route
Selection, so the live Tally form must not include a visible `Desired role`
field and should not depend on route-specific conditional sections for the MVP.

## Current status

The live form exists and the public embed confirms the form ID, title, hidden
`route` field, generic baseline fields, and CV/resume upload field. Issue #24 is
not complete in the public form yet: the public payload still exposes a visible
`Desired role` field, does not visibly communicate PDF-only upload or the 10 MB
upload limit, does not expose the required confirmation copy, and does not expose
integration evidence.

Completing the setup requires access to the BOLD-owned Tally workspace. Agents
without that access can verify the public embed contract, but cannot configure
fields, conditional logic, file-upload rules, confirmation behavior, owner email
notifications, or Google Sheets integration.

Issue #24 comments report that the BOLD-owned account owns the form, Google
Sheets integration is connected, and self email notifications are enabled to the
same account acting as the intake email. Those owner-side settings are not
exposed in the unauthenticated public payload, so they still need confirmation
inside the Tally workspace before the issue can be treated as complete.

Fresh public verification on 2026-06-23 confirms this is still the active
blocker: every accepted route embed returns HTTP 200 with the shared form ID and
hidden `route` field, but the visible `Desired role` field and remaining public
configuration gaps mean the form is not ready.

Run `node scripts/verify-tally-expression-of-interest.mjs` to repeat the public
verification. The script exits nonzero until the public payload exposes the
generic baseline fields, PDF CV/resume guidance, confirmation copy, no visible
`Desired role` field, and integration evidence needed for issue #24.

## Tally owner setup checklist

Use this checklist in the Tally workspace before treating issue #24 as complete:

- Add the shared baseline fields listed below.
- Keep `route` as a hidden or pre-filled field populated from the website embed
  URL.
- Remove any visible `Desired role` field.
- Do not add route-specific conditional sections for the MVP; route-specific
  context belongs on the website above the embedded form.
- Configure the CV/resume upload as PDF-only with the 10 MB free-plan limit
  communicated in the form.
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
- Desired timing
- What the respondent wants to work on with BOLD
- Current application or Formal Application Path status
- Relevant BOLD people or groups

The form must not ask for detailed immigration or visa status, demographic
questions, or equal-opportunities monitoring questions in the MVP.

## CV/resume upload rules

- Accept PDF only.
- Communicate Tally's free-plan upload limit of 10 MB per file.

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

The public Tally payloads at these URLs currently expose the same visible form
structure:

- `https://tally.so/embed/A7aa0W?route=phd-students`
- `https://tally.so/embed/A7aa0W?route=visiting-students`
- `https://tally.so/embed/A7aa0W?route=masters-students`
- `https://tally.so/embed/A7aa0W?route=research-engineers`
- `https://tally.so/embed/A7aa0W?route=fellows`
- `https://tally.so/embed/A7aa0W?route=collaborators`

The exposed structure is:

- form title: `BOLD Expression of Interest`
- form ID: `A7aa0W`
- workspace ID: `3NbqgN`
- one hidden field named `route`
- one visible `Desired role` field, which should be removed
- generic visible baseline fields for name, email, current role/title, current
  organization/institution, location/time zone, fit statement, relevant links,
  Research Direction Interest, practical constraints, desired timing, intended
  work with BOLD, Formal Application Path status, and relevant BOLD people or
  groups
- one CV/resume upload field
- no required route-specific conditional sections
- no visible PDF-only or 10 MB upload-limit guidance
- no visible confirmation copy
- `integrations` is exposed as an empty array

The unauthenticated Tally forms API at `https://api.tally.so/forms/A7aa0W`
returned `401 Unauthorized`, so completing the live form configuration requires
Tally owner access. The empty public embed `integrations` array is not enough to
confirm whether owner-side Google Sheets sync or email notifications are
configured.

The verifier script was run against the live embed routes on 2026-06-23 and
returned the same blocker for every route: HTTP 200 with form `A7aa0W`, hidden
field `route`, generic baseline blocks, a `FILE_UPLOAD` block, a prohibited
visible `Desired role` field, missing visible PDF-only and 10 MB upload-limit
guidance, missing confirmation copy, and `integrations=0`.
