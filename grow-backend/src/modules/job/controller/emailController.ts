import { Request, Response } from "express";
import { emailService } from "../service/emailService";

/**
 * Send email to job applicant
 */
export async function sendEmail(req: Request, res: Response) {
    try {
      const { applicationId, subject, message } = req.body;
      const { recipientEmail, recipientName } = req.body;

      if (!applicationId || !recipientEmail || !recipientName || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const result = await emailService.sendApplicationEmail(
        applicationId,
        recipientEmail,
        recipientName,
        subject,
        message
      );

      res.status(200).json({
        success: true,
        message: "Email sent successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Send email error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send email",
      });
    }
}

/**
 * Get email history for an application
 */
export async function getEmailHistory(req: Request, res: Response) {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    const emails = await emailService.getEmailHistory(applicationId);

    res.status(200).json({
      success: true,
      data: emails,
    });
  } catch (error: any) {
    console.error("Get email history error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch email history",
    });
  }
}

/**
 * Get latest email for an application
 */
export async function getLatestEmail(req: Request, res: Response) {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    const email = await emailService.getLatestEmail(applicationId);

    res.status(200).json({
      success: true,
      data: email,
    });
  } catch (error: any) {
    console.error("Get latest email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch latest email",
    });
  }
}

/**
 * Test email configuration
 */
export async function testConnection(req: Request, res: Response) {
  try {
    const isConnected = await emailService.testEmailConnection();

    if (isConnected) {
      return res.status(200).json({
        success: true,
        message: "Email service is configured correctly",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Email service configuration test failed",
      });
    }
  } catch (error: any) {
    console.error("Email test error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to test email service",
    });
  }
}
