import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const SMTP_HOST = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = Number(process.env.BREVO_SMTP_PORT || 587);
const SMTP_USER = process.env.BREVO_SMTP_LOGIN || process.env.EMAIL;
const SMTP_PASS = process.env.BREVO_SMTP_KEY || process.env.PASSWORD;
const FROM_EMAIL = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL;
const FROM_NAME = process.env.BREVO_SENDER_NAME || "NITS Dashboard";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  family: 4,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendMail = async (email, subject, text) => {
  try {
    if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
      throw new Error(
        "Brevo SMTP credentials are not configured in environment variables",
      );
    }

    const result = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject,
      text,
    });

    console.log("✅ Email sent successfully to:", email);
    return result;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

export default sendMail;
