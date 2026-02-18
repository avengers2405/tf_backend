import sgMail from '@sendgrid/mail';
import jwtService from './jwtService.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() {
    this.frontendUrl = process.env.EMAIL_ACTION_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    this.senderEmail = process.env.SENDER_EMAIL;
  }

  async sendAuthMagicLinkEmail(payload) {
    try {
      const msg = {
        to: payload.email,
        from: this.senderEmail,
        subject: 'Verify your account',
        html: this.generateAuthMagicLinkTemplate(payload.magicLink),
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Failed to send auth magic-link email:', error);
      return false;
    }
  }

  async sendConfirmationEmail(payload) {
    try {
      const confirmationUrl = `${this.frontendUrl}/email-action?token=${encodeURIComponent(payload.token)}`;

      console.log(payload.student_email);

      const msg = {
        to: payload.student_email,
        from: this.senderEmail,
        subject: `Company Drive Confirmation - ${payload.company_name}`,
        html: this.generateEmailTemplate(
          payload.student_name,
          payload.company_name,
          confirmationUrl
        ),
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${payload.student_email}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  generateEmailTemplate(studentName, companyName, confirmationUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #fff;
            text-align: center; /* Center all content */
          }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { 
            display: inline-block; 
            background-color: #28a745; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
          }
          .footer { text-align: center; padding: 10px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Company Drive Notification</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            <p>Great news! You are eligible for the <strong>${companyName}</strong> company drive.</p>
            <p>Please confirm your interest by clicking the button below:</p>
            <a href="${confirmationUrl}" class="button">Confirm Interest</a>
            <p>This link will expire at the registration deadline.</p>
            <p>Best regards,<br>TNP Portal</p>
          </div>
          <div class="footer">
            <p>This is an automated email.</p>
            <p>Reply Supported Hahaha.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

  generateAuthMagicLinkTemplate(magicLink) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button {
              display: inline-block;
              background-color: #0d6efd;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Verify your account</h2>
            <p>Click the button below to verify your account.</p>
            <p><a href="${magicLink}" class="button">Verify Email</a></p>
            <p>If the button does not work, use this link:</p>
            <p><a href="${magicLink}">${magicLink}</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService();