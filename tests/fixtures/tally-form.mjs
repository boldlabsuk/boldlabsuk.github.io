export function inputBlocks(label, type, isRequired, settings = {}) {
  return [
    { type: 'TITLE', payload: { safeHTMLSchema: [[label]] } },
    { type, payload: { isRequired, ...settings } },
  ]
}

export function configuredTallyPayload() {
  return {
    formId: 'A7aa0W',
    name: 'BOLD Expression of Interest',
    integrations: [],
    blocks: [
      {
        type: 'FORM_TITLE',
        payload: {
          title: 'BOLD Expression of Interest',
          button: { label: 'Express interest' },
        },
      },
      { type: 'HIDDEN_FIELDS', payload: { hiddenFields: [{ name: 'route' }] } },
      ...inputBlocks('Full name', 'INPUT_TEXT', true),
      ...inputBlocks('Email', 'INPUT_EMAIL', true),
      ...inputBlocks('Your connection to BOLD’s research', 'TEXTAREA', true),
      ...inputBlocks('Profile links (optional)', 'TEXTAREA', false),
      ...inputBlocks('CV (optional)', 'FILE_UPLOAD', false, {
        allowedFiles: { 'application/*': ['.pdf'] },
        hasMaxFileSize: true,
        maxFileSize: 10,
        maxFileSizeUnit: 'MB',
      }),
      { type: 'PAGE_BREAK', payload: { isThankYouPage: true } },
      {
        type: 'TEXT',
        payload: {
          safeHTMLSchema: [
            [
              'Thank you for expressing your interest in BOLD. ' +
                'We may be in touch if a relevant opportunity arises.',
            ],
          ],
        },
      },
    ],
  }
}
