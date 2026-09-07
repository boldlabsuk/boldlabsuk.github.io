# Tally Expression of Interest Form

## Current status

The website and published Tally form implement the revised intake contract below.
On 2026-09-07, public verification passed for all five routes. An anonymous
browser submission succeeded with only name, email, the selected route, and the
research note. The exact thank-you wording appeared, and the existing register
recorded the selected `collaborators` route without a CV or profile links.

All 83 pre-existing submissions retained their answer values and file identities;
the nine removed questions remain archived in Tally's question records. Retained
field IDs were preserved. Two clearly labelled verification submissions were
added to the register: one for minimal intake and one after saving notifications.

Google Sheets delivery was independently verified in the existing connection's
Events log for both test submissions on 2026-09-07. The owner also confirmed the
first test row's route and note. Although the screenshot showed self email notifications
enabled, the saved form had null settings. Tally's interface initializes that
state with notifications disabled. Saving `hasSelfEmailNotifications: true`
through the API fixed the persisted configuration; a subsequent read confirmed
it enabled. The default recipient remains the BOLD form owner, and form blocks
and Google Sheets settings were not changed by this fix.

The second anonymous submission completed successfully after that setting was
saved. Background inspection of the signed-in BOLD Gmail inbox confirmed receipt
of the Tally notification, including the selected `collaborators` route, test
name, email, and research note. This completes the submission and email-delivery
checks. The user's active Chrome tab was unchanged during verification.

## Website invitation

> Express your interest in BOLD. We may be in touch if a relevant opportunity arises.

Use a welcoming, research-focused voice. A text hero with a restrained accent
rule introduces the page, followed by a white section containing one
“I’m interested in…” selector and one shared embedded form. Below the complete
intake, a pale blue BOLD Fellows section uses the homepage's typography and
spacing, with the sentence “Explore BOLD Fellowship opportunities through the
University of Oxford.” and a
[View Oxford job advert](https://eng.ox.ac.uk/jobs/job-detail?vacancyID=187853)
button. The section remains below the form when the embed expands.
Keep “Opportunities” in navigation and “Express interest” on the homepage.

## Shared form contract

- Form name: BOLD Expression of Interest
- Form ID: `A7aa0W`
- Form URL: `https://tally.so/r/A7aa0W`
- Embed URL: `https://tally.so/embed/A7aa0W?route={routeValue}`
- Hidden route parameter: `route`

| Selector label | Route value |
| --- | --- |
| PhD research | `phd-students` |
| a student visit | `visiting-students` |
| Master’s research | `masters-students` |
| research engineering | `research-engineers` |
| collaboration or affiliation | `collaborators` |

Collaboration or affiliation includes experienced researchers seeking visits or
longer-term connections. BOLD Fellows is an advert link, not a current intake
option. Retain historical Fellows submissions in the existing register.

## Published form configuration

Keep the same form, existing register, integrations, and field identities where
retained. Configure only these visible inputs:

| Label | Input | Required |
| --- | --- | --- |
| Full name | Short answer (`INPUT_TEXT`) | Yes |
| Email | Email (`INPUT_EMAIL`) | Yes |
| Your connection to BOLD’s research | Long answer (`TEXTAREA`) | Yes |
| Profile links (optional) | Long answer (`TEXTAREA`) | No |
| CV (optional) | File upload (`FILE_UPLOAD`) | No |

The selector supplies the required area of interest through hidden `route`;
there must be no second route or research-area question. Prompt the short note
with “Briefly describe your interests and their connection to BOLD’s research.”
Do not impose the former 200–400-word requirement.

Remove the other recruitment questions from current intake, including role,
institution, location, timing, formal-process status, and relevant people.
Retain historical submission data. Keep CV uploads PDF-only, with a communicated
10 MB limit. Keep the form generic without conditional route-specific sections.

Set the submit button to “Express interest”. Its API schema uses
`FORM_TITLE.payload.button.label` ([Tally block schema](https://developers.tally.so/api-reference/endpoint/forms/post)).
Public input blocks expose `payload.isRequired`; their labels are preceding
`TITLE` blocks with `payload.safeHTMLSchema`.

Set the thank-you page to:

> Thank you for expressing your interest in BOLD. We may be in touch if a relevant opportunity arises.

Do not promise review, contact, or a reply elsewhere in the form. The public
thank-you page begins at `PAGE_BREAK.payload.isThankYouPage`.

## Verification

Run `node scripts/verify-tally-expression-of-interest.mjs` after publishing the
owner-side form changes. It checks all five public embeds and must pass before
reporting the intake as complete. It checks actual input types and required
flags, optional links/CV, the hidden route, upload constraints, submit wording,
and confirmation on the thank-you page. Legacy recruitment fields or response
promises cause failure.

An owner-side submission check must also confirm that a visitor can submit with
only name, email, the website-selected route, and the short note, without a
Tally/Google account, CV, or profile link. Confirm the selected route is recorded
in the existing Expression of Interest Register and existing notification and
Sheets integrations still work. Public payload checks alone cannot prove this.
