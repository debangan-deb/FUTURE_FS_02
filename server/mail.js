
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail(to, subject, html) {
  await transporter.sendMail({
    from: `"ShopNext" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
export async function sendOTP(email, otp) {
  const html = `<h3>Your OTP for registration is:</h3>
                <h2>${otp}</h2>
                <p>It is valid for 5 minutes.</p>`;
  await sendMail(email, "OTP Verification - ShopNext", html);
}
