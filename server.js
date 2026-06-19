const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'kayandkay@emails.com';

const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify()
    .then(() => console.log('SMTP transporter ready'))
    .catch(err => console.warn('SMTP transporter not ready:', err && err.message));

app.post('/send', async (req, res) => {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing name, email or message' });

    try {
        // Load templates if present
        const templatesDir = path.join(__dirname, 'templates');
        let businessHtml = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>`;
        let businessText = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

        let autoreplyHtml = `<p>Hi ${name},</p><p>Thank you for contacting <strong>Kay and Kay</strong>. We received your message and will reply soon.</p><p>— Kay and Kay</p>`;
        let autoreplyText = `Hi ${name},\n\nThank you for contacting Kay and Kay. We received your message and will reply soon.\n\n— Kay and Kay`;

        try {
            const businessPath = path.join(templatesDir, 'business.html');
            const autoPath = path.join(templatesDir, 'autoreply.html');
            const now = new Date().toLocaleString();
            if (fs.existsSync(businessPath)) {
                businessHtml = fs.readFileSync(businessPath, 'utf8')
                    .replace(/{{name}}/g, name)
                    .replace(/{{email}}/g, email)
                    .replace(/{{message}}/g, message.replace(/\n/g, '<br>'))
                    .replace(/{{date}}/g, now);
                businessText = businessHtml.replace(/<[^>]+>/g, '');
            }
            if (fs.existsSync(autoPath)) {
                autoreplyHtml = fs.readFileSync(autoPath, 'utf8')
                    .replace(/{{name}}/g, name)
                    .replace(/{{email}}/g, email)
                    .replace(/{{message}}/g, message.replace(/\n/g, '<br>'))
                    .replace(/{{date}}/g, now);
                autoreplyText = autoreplyHtml.replace(/<[^>]+>/g, '');
            }
        } catch (err) {
            console.warn('Template load error:', err && err.message);
        }

        // Send to business
        const bizInfo = await transporter.sendMail({
            from: `"Kay and Kay" <${process.env.SMTP_USER}>`,
            to: BUSINESS_EMAIL,
            subject: `New Inquiry from ${name}`,
            text: businessText,
            html: businessHtml,
        });
        console.log('Business email sent:', bizInfo && bizInfo.messageId);

        // Autoreply to visitor
        const autoInfo = await transporter.sendMail({
            from: `"Kay and Kay" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Thank you for contacting Kay and Kay',
            text: autoreplyText,
            html: autoreplyHtml,
        });
        console.log('Autoreply sent:', autoInfo && autoInfo.messageId, 'to', email);

        res.json({ ok: true });
    } catch (err) {
        console.error('Error sending emails:', err && err.message);
        res.status(500).json({ error: 'Failed to send emails', details: err && err.message });
    }
});

app.listen(PORT, () => console.log(`Email server listening on port ${PORT}`));
