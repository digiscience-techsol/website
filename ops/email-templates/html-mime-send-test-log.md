# HTML MIME Send Test Log

## Test Metadata

- Intended sender: `subscription@digisciencetechsol.com`
- Actual sender after sender correction: Not sent from required sender
- Recipient: `rajivjobnaukri@gmail.com`
- Subject: `AI readiness review for legal document workflows — HTML render test`
- Prospect/customer sent: No
- CAM form submitted: No
- LinkedIn used: No

## Route Checks

- Gmail API / Gmail connector raw MIME send: Checked. Available Gmail connector exposes `send_email`, `create_draft`, and `send_draft`, but no raw MIME send action was exposed through available tools.
- Gmail connector authenticated sender: Checked. Current Gmail connector profile is `rajivjobnaukri@gmail.com`, not `subscription@digisciencetechsol.com`. No sender override is exposed.
- Google Workspace account signal: Checked. Google Calendar profile shows `subscription@digisciencetechsol.com`, but the available Gmail send connector is not authenticated as that sender.
- Outlook/Microsoft authenticated sender: Checked. Outlook email connector profile is `rajiv.gupta@digisciencetechsol.com`, not `subscription@digisciencetechsol.com`. Exposed Outlook send/draft actions support plain-text bodies only.
- SharePoint/Microsoft profile signal: Checked. SharePoint profile shows `subscription@digisciencetechsol.com`, but SharePoint tools do not provide email send capability.
- Gmail connector normal send with HTML body: Previously used for founder-only send test before the sender correction. Do not use again for this requirement because it sends from the authenticated personal Gmail account.
- Microsoft Graph / Outlook HTML send: Checked. No exposed Outlook HTML send action is available; exposed Outlook email actions support `text_content` only.
- Python SMTP: Checked for safe local SMTP configuration. No SMTP/Mail environment variables found.
- Himalaya: Checked. `himalaya` is installed, but no configuration was found at `/data/.config/himalaya/config.toml`.
- Browser Gmail compose with rich HTML paste: Checked. OpenClaw browser reached Google sign-in screen, so sending from `subscription@digisciencetechsol.com` and visual browser verification require founder authentication.

## Send Result

- Method used: Gmail connector `send_email` with full HTML document body
- Content-Type used: Raw MIME action was not exposed. Connector accepted an HTML document in `body`; exact transmitted MIME headers are not exposed by the connector.
- Sent: Yes
- Gmail message ID: `19e645ed2912ba15`
- Gmail thread ID: `19e645ed2912ba15`
- Received body rendered as HTML: Not visually confirmed. Gmail connector readback returned extracted text/Markdown from the sent message, while browser-based Gmail verification stopped at Google sign-in.
- Screenshot path: `ops/email-templates/cam-prospect-production-email-v1-gmail-render.png`
- Blocker: OpenClaw browser reached the Google sign-in screen for Gmail. Visual confirmation of the received Gmail body requires founder authentication in the browser/noVNC session, or a connector/tool route that exposes rendered Gmail HTML.

## Sender Correction Result

- Required sender: `subscription@digisciencetechsol.com`
- New email sent after sender correction: No
- Reason: No available send route is currently authenticated as `subscription@digisciencetechsol.com` with true HTML MIME send capability.
- Actual sender after correction: None
- Required next action: authenticate `subscription@digisciencetechsol.com` in browser/noVNC or connect an email-send tool/API route for that mailbox with HTML MIME support.

## Notes

The earlier test email was sent only to `rajivjobnaukri@gmail.com` from the authenticated Gmail connector before the sender correction. No prospect/customer outreach was sent, CAM form was not submitted, and LinkedIn was not used.

Do not mark this as FIXED unless the actual sender is `subscription@digisciencetechsol.com` and the Gmail body itself is verified as rendering the designed HTML layout.