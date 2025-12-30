import nodemailer, { Transporter } from "nodemailer";
import { EmailLog } from "../model/emailLog.model";
import { ENV } from "@/config/env";
import mongoose from "mongoose";

// Create reusable transporter
let transporter: Transporter;

// Initialize nodemailer
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: ENV.EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

export const emailService = {
  /**
   * Send email to job applicant
   */
  async sendApplicationEmail(
    applicationId: string,
    recipientEmail: string,
    recipientName: string,
    subject: string,
    message: string
  ): Promise<any> {
    try {
      // Create email log record
      const emailLog = await EmailLog.create({
        applicationId: new mongoose.Types.ObjectId(applicationId),
        recipientEmail,
        recipientName,
        subject,
        message,
        status: "pending",
      });

      const transporter = getTransporter();

      // Convert HTML message to email-friendly format
      const htmlMessage = message.replace(/\n/g, "<br>");

      const mailOptions = {
        from: `"Learn & Grow" <${ENV.EMAIL_USER}>`,
        to: recipientEmail,
        subject,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Hello ${recipientName},</h2>
                <div style="margin: 20px 0; padding: 20px; border-left: 4px solid #3b82f6; background-color: #f0f9ff;">
                  ${htmlMessage}
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                  <strong>Learn & Grow Team</strong><br>
                  This is an automated message from our career portal.
                </p>
              </div>
            </body>
          </html>
        `,
        text: message,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      // Update email log with success
      emailLog.status = "sent";
      emailLog.sentAt = new Date();
      await emailLog.save();

      return {
        success: true,
        emailLogId: emailLog._id,
        messageId: info.messageId,
      };
    } catch (error: any) {
      // Update email log with error
      try {
        await EmailLog.findByIdAndUpdate(error?.emailLogId, {
          status: "failed",
          error: error.message,
        });
      } catch {}

      throw new Error(`Failed to send email: ${error.message}`);
    }
  },

  /**
   * Get email history for an application
   */
  async getEmailHistory(applicationId: string): Promise<any[]> {
    try {
      const emails = await EmailLog.find({
        applicationId: new mongoose.Types.ObjectId(applicationId),
      })
        .sort({ createdAt: -1 })
        .lean();

      return emails;
    } catch (error: any) {
      throw new Error(`Failed to fetch email history: ${error.message}`);
    }
  },

  /**
   * Get latest email for an application
   */
  async getLatestEmail(applicationId: string): Promise<any | null> {
    try {
      const email = await EmailLog.findOne({
        applicationId: new mongoose.Types.ObjectId(applicationId),
      })
        .sort({ createdAt: -1 })
        .lean();

      return email || null;
    } catch (error: any) {
      throw new Error(`Failed to fetch latest email: ${error.message}`);
    }
  },

  /**
   * Test email configuration
   */
  async testEmailConnection(): Promise<boolean> {
    try {
      const transporter = getTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      console.error("Email connection test failed:", error);
      return false;
    }
  },
};
