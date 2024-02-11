import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const sendMail = async function sendMail(email,verficationToken) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const verifyUrl = `https://backend-t-u090.onrender.com/auth/verify-email?email=${encodeURIComponent(email)}&verficationToken=${verficationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <h2 style="color: #333; text-align: center;">TrekTripper Email Verification</h2>
      <p style="color: #666; text-align: center;">Hey there! You're one step away from completing your registration.</p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
      </div>

      <p style="color: #666; text-align: center; margin-top: 20px;">If the button above doesn't work, you can also click on the link below:</p>
      <p style="color: #4CAF50; text-align: center; font-weight: bold; margin-top: 10px;"><a href="${verifyUrl}" style="color: #4CAF50; text-decoration: none;">${verifyUrl}</a></p>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">Thank you for choosing TrekTripper!</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: 'E-Shop',
    to: email,
    subject: 'Verify Your Email, From TrekTripper',
    html: html,
  });

  console.log('message sent', info.messageId);
};

export default sendMail;
