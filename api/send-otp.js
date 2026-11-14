// =========================================================================
// VERCEL SERVERLESS FUNCTION: /api/send-otp.js (100% FREE EMAIL OTP)
// Supports:
// 1. Google Apps Script Gmail Web App (GOOGLE_SCRIPT_OTP_URL) - 100% Free
// 2. Brevo Free Email API (BREVO_API_KEY) - 300 Free Emails/Day
// 3. Automatic Demo OTP fallback if neither is configured yet
// =========================================================================

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, otp, schoolCode, scriptUrl } = req.body || {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || !otp) {
        return res.status(400).json({ error: 'Invalid email address or OTP' });
    }

    // Method 1: Google Apps Script Gmail Webhook (Free via your Gmail)
    const gasUrl = process.env.GOOGLE_SCRIPT_OTP_URL || scriptUrl;
    if (gasUrl && gasUrl.startsWith('https://script.google.com/')) {
        try {
            const gasRes = await fetch(gasUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: String(otp), schoolCode: schoolCode || '' })
            });
            const gasData = await gasRes.json();
            if (gasData && gasData.sent) {
                return res.status(200).json({ sent: true, provider: 'gmail-script' });
            }
        } catch (err) {
            // Fall through to next provider or demo mode
        }
    }

    // Method 2: Brevo Free Email API (300 emails/day free)
    const brevoKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;
    if (brevoKey && senderEmail) {
        try {
            const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': brevoKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'TN Schools Exam Portal', email: senderEmail },
                    to: [{ email: email }],
                    subject: `தேர்வு அறை மேலாண்மை தளம் - உங்கள் OTP எண்: ${otp}`,
                    htmlContent: `
                        <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #cbd5e1;border-radius:10px;padding:20px;">
                            <h2 style="color:#1e3a8a;margin-top:0;">🏫 TN Schools Exam Portal</h2>
                            <p>வணக்கம்,</p>
                            <p>உங்கள் 6 இலக்க சரிபார்ப்பு எண் (OTP):</p>
                            <div style="font-size:28px;font-weight:bold;letter-spacing:6px;background:#eff6ff;color:#1d4ed8;padding:12px;text-align:center;border-radius:8px;border:1px dashed #93c5fd;">
                                ${otp}
                            </div>
                            ${schoolCode ? `<p style="margin-top:12px;">உங்கள் பள்ளி குறியீடு (School Code): <b>${schoolCode}</b></p>` : ''}
                            <p style="font-size:12px;color:#64748b;margin-top:16px;">நன்றி,<br>TN Schools Exam Seating Management System</p>
                        </div>
                    `
                })
            });
            if (brevoRes.ok) {
                return res.status(200).json({ sent: true, provider: 'brevo' });
            }
        } catch (err) {}
    }

    // Fallback: Demo OTP mode when email provider URL/key is not yet configured
    return res.status(200).json({
        sent: false,
        demo: true,
        message: 'Email OTP provider not yet configured; using Demo OTP mode.'
    });
}
