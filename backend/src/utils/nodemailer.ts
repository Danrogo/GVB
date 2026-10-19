// src/utils/nodemailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (email: string, name: string) => {
  await transporter.sendMail({
    from: '"GVB" <noreply@goodvibes.co.ke>',
    to: email,
    subject: `Welcome ${name}! Your GVB Account is Ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #0f0f0f; color: white; border-radius: 16px;">
        <h1 style="color: #f59e0b; text-align: center;">Welcome to DRIVELUX, ${name}!</h1>
        <p style="font-size: 18px;">Your premium car rental journey starts now.</p>
        <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <p>Book luxury cars • Instant confirmation • 24/7 support</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}" style="background: #f59e0b; color: black; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px;">
            Start Driving Now
          </a>
        </div>
      </div>
    `,
  });
};