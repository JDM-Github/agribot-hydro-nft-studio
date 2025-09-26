import type { RequestHandler } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    VERIFICATION_CODE_EXPIRY_MIN,
    VERIFICATION_MAX_ATTEMPTS
} from '$env/static/private';

const STORE_TTL_MIN = Number(VERIFICATION_CODE_EXPIRY_MIN || 10);
const MAX_ATTEMPTS = Number(VERIFICATION_MAX_ATTEMPTS || 5);

type Entry = { code: string; expiresAt: number; attempts: number };
const verificationStore = new Map<string, Entry>();

setInterval(() => {
    const now = Date.now();
    for (const [email, entry] of verificationStore.entries()) {
        if (entry.expiresAt <= now) verificationStore.delete(email);
    }
}, 60_000).unref();

function generateCode() {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

function createTransporter() {
    if (!SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP_USER/SMTP_PASS not configured in environment');
    }

    return nodemailer.createTransport({
        host: SMTP_HOST || 'smtp.gmail.com',
        port: Number(SMTP_PORT || 465),
        secure: SMTP_SECURE ? SMTP_SECURE === 'true' : true,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const email = String(body?.email || '').trim().toLowerCase();
        if (!email) {
            return new Response(JSON.stringify({ success: false, message: 'Email is required' }), { status: 400 });
        }

        const code = generateCode();
        const expiresAt = Date.now() + STORE_TTL_MIN * 60_000;
        verificationStore.set(email, { code, expiresAt, attempts: 0 });

        const transporter = createTransporter();
        const mailOptions = {
            from: `"AGRI-BOT" <${SMTP_USER}>`,
            to: email,
            subject: '🌱 AGRI-BOT Verification Code',
            text: `Hi,\n\nYour AGRI-BOT verification code is: ${code}\nThis code will expire in ${STORE_TTL_MIN} minutes.\n\n- AGRI-BOT Team`,
            html: `
<html>
    <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; color: #333; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 10px; border: 2px solid #4CAF50;">
            <h2 style="color: #4CAF50; text-align: center;">🌱 AGRI-BOT Verification</h2>
            <p>Hi there,</p>
            <p>Thank you for registering with <strong>AGRI-BOT</strong>. To complete your registration, please use the verification code below:</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <p style="font-size: 26px; font-weight: bold; letter-spacing: 3px; color: #333;">${code}</p>
            </div>

            <p>This code will expire in <strong>${STORE_TTL_MIN} minutes</strong>. Please enter it as soon as possible.</p>
            
            <hr style="border: 1px solid #eee; margin: 25px 0;">

            <p style="font-size: 0.9em; color: #555; text-align: center;">
                🚀 AGRI-BOT Team<br>
                <span style="font-size: 0.8em;">Automating agriculture, one step at a time</span>
            </p>
        </div>
    </body>
</html>
    `
        };
        await transporter.sendMail(mailOptions);

        return new Response(
            JSON.stringify({ success: true, message: 'Verification code sent', code }),
            { status: 200 }
        );
    } catch (err: any) {
        console.error('send-verification error:', err?.message || err);
        return new Response(
            JSON.stringify({ success: false, message: 'Failed to send verification code' }),
            { status: 500 }
        );
    }
};

export { verificationStore, MAX_ATTEMPTS };
