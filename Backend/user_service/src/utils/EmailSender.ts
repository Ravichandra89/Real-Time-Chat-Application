import nodemailer from "nodemailer";
import crypto from "crypto";
import apiResponse from "./apiResponse";
import prisma from "../config/prisma.config";

const otp_expiry = 10;

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Sending the email
const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending Email", error);
    throw new Error("Error sending Email");
  }
};

const sendOtpEmail = async (email: string): Promise<string> => {
  const otp = generateOtp();
  const subject = "Your OTP for Password Reset";
  const text = `Your OTP to reset your password is: ${otp}. Please use it within the next 10 minutes.`;

  try {
    await sendEmail(email, subject, text);
    return otp;
  } catch (error) {
    console.error("Error sending OTP email", error);
    throw new Error("Error sending Email");
  }
};

export { sendOtpEmail, generateOtp };
