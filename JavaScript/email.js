document.addEventListener('DOMContentLoaded', () => {
    // ===== EmailJS setup =====
    // 1) Create a free account at https://www.emailjs.com
    // 2) Add an email service (Gmail, Outlook, etc.) and create a template
    // 3) Copy your User ID, Service ID and Template ID into the placeholders below

    // Replace these with your EmailJS values (or leave placeholders to use the mailto fallback)
    const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID';
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

    // Fallback recipient for mailto when EmailJS is not configured — change to your real receiving address
    const BUSINESS_EMAIL = 'kayandkay@emails.com';

    if (window.emailjs) {
        emailjs.init(EMAILJS_USER_ID);
    } else {
        console.warn('EmailJS SDK not loaded. Check that https://cdn.emailjs.com/sdk/2.3.2/email.min.js is reachable.');
    }

    // ==========================================
    // CONTACT FORM: send using EmailJS (no backend)
    // ==========================================
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        // Create a small status element to show success/error
        let statusEl = document.createElement('div');
        statusEl.id = 'contactStatus';
        Object.assign(statusEl.style, {marginTop: '12px', fontWeight: '600'});
        contactForm.appendChild(statusEl);

        // If IDs look like placeholders, we'll use a mailto: fallback so users can still send messages
        const idsArePlaceholders = EMAILJS_USER_ID.startsWith('YOUR_') || EMAILJS_SERVICE_ID.startsWith('YOUR_') || EMAILJS_TEMPLATE_ID.startsWith('YOUR_');
        if (idsArePlaceholders) console.warn('EmailJS IDs not set — using mailto fallback.');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            statusEl.textContent = 'Sending...';

            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const message = contactForm.querySelector('#message').value.trim();

            if (!name || !email || !message) {
                statusEl.textContent = 'Please fill all fields.';
                return;
            }

            // Try server-side send first
            try {
                const resp = await fetch('/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message }),
                });

                if (resp.ok) {
                    statusEl.style.color = 'green';
                    statusEl.textContent = 'Message sent — we will reply soon.';
                    contactForm.reset();
                    return;
                } else {
                    const err = await resp.json().catch(() => ({}));
                    console.warn('Server send failed', err);
                }
            } catch (err) {
                console.warn('Server send unreachable or failed:', err && err.message);
            }

            const templateParams = {
                from_name: name,
                from_email: email,
                message: message,
            };

            if (window.emailjs && !idsArePlaceholders) {
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                    .then(() => {
                        statusEl.style.color = 'green';
                        statusEl.textContent = 'Message sent — we will reply soon.';
                        contactForm.reset();
                    }, (err) => {
                        console.error('EmailJS error:', err);
                        statusEl.style.color = 'crimson';
                        statusEl.textContent = 'Sending failed — please try again or email us directly.';
                    });
                return;
            }

            const subject = encodeURIComponent(`New Inquiry from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            const mailto = `mailto:${BUSINESS_EMAIL}?cc=${encodeURIComponent(email)}&subject=${subject}&body=${body}`;
            statusEl.style.color = 'black';
            statusEl.textContent = 'Opening your email client...';
            window.location.href = mailto;
        });
    }

    // ==========================================
    // The rest of your existing features (image modal, nav hover)
    // ==========================================
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    Object.assign(modal.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'none', justifyContent: 'center',
        alignItems: 'center', zIndex: '1000', cursor: 'zoom-out'
    });

    const modalImg = document.createElement('img');
    Object.assign(modalImg.style, {
        maxWidth: '85%', maxHeight: '85%', borderRadius: '8px',
        border: '3px solid white', boxShadow: '0px 4px 15px rgba(0,0,0,0.5)'
    });

    modal.appendChild(modalImg);
    document.body.appendChild(modal);

    const accommodationImages = document.querySelectorAll('.accommodation img, .services img, main img');
    accommodationImages.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            modalImg.src = img.src;
            modal.style.display = 'flex';
        });
    });

    modal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    const navLinks = document.querySelectorAll('nav a, .navbar a');
    navLinks.forEach(link => {
        link.style.transition = 'transform 0.2s ease, color 0.2s ease';
        link.addEventListener('mouseenter', () => link.style.transform = 'scale(1.1)');
        link.addEventListener('mouseleave', () => link.style.transform = 'scale(1.0)');
    });
});
