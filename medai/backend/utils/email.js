/**
 * Email Utility — Nodemailer
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    await transporter.sendMail({
      from: `"MedAI Health Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
    // Don't throw — email failures shouldn't break API
  }
};
