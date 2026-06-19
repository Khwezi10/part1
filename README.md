Kay and Kay — Email Send Server

This project adds a small Node/Express server to send contact form messages reliably using SMTP (nodemailer).

Setup

1. Copy `.env.example` to `.env` and fill in your SMTP provider details:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user@example.com
SMTP_PASS=your_smtp_password
BUSINESS_EMAIL=kayandkay@emails.com
PORT=3000
```

2. Install dependencies and start the server:

```bash
npm install
npm start
```

3. Serve the website files (the frontend) and ensure the contact form posts to the server. By default the frontend will POST to `/send` on the same origin. When running locally, run the server from the project root and serve static files from the same folder, for example:

```bash
# from project folder
# start the email server
npm start
# in another terminal, run a static server (Python example)
python -m http.server 8000
# then open http://localhost:8000/contact.html
```

Notes
- The server sends two emails for each submission: one to the business (`BUSINESS_EMAIL`) and an automatic reply to the visitor's email.
- If you prefer not to run a server, you can use EmailJS for client-side sends. To enable that, add EmailJS IDs to `JavaScript/email.js`.

Security
- Do not commit your real `.env` credentials. Use `.env` locally and keep it out of version control.

Troubleshooting
- Check server logs for SMTP errors. If the transporter isn't ready, verify SMTP_HOST/PORT/USER/PASS and whether your provider requires an App Password or OAuth.
- If mail goes to spam, configure proper SPF/DKIM records for your sending domain.
