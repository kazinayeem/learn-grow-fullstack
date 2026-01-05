import { SMTPConfig } from "../model/smtpConfig.model";
import nodemailer from "nodemailer";
import { ENV } from "@/config/env";

/**
 * Get active SMTP config (exclude password)
 */
export const getSMTPConfig = async () => {
  try {
    const config = await SMTPConfig.findOne({ isActive: true }).select("-password").lean();
    
    if (!config) {
      // Return env-based defaults if no DB config
      return {
        success: true,
        message: "Using default SMTP config from environment",
        data: {
          host: ENV.EMAIL_HOST || "",
          port: ENV.EMAIL_PORT || 587,
          secure: ENV.EMAIL_PORT === 465,
          user: ENV.EMAIL_USER || "",
          fromName: "Learn & Grow",
          fromEmail: ENV.EMAIL_USER || "",
          replyTo: ENV.EMAIL_USER || "",
          isActive: false, // Indicates it's from env, not DB
          source: "env",
        },
      };
    }

    return {
      success: true,
      message: "SMTP config retrieved",
      data: {
        ...config,
        source: "database",
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get SMTP config" };
  }
};

/**
 * Update or create SMTP config (admin only)
 */
export const updateSMTPConfig = async (data: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
}) => {
  try {
    const { host, port, secure, user, password, fromName, fromEmail, replyTo } = data;

    // Validation
    if (!host || !port || !user || !fromName || !fromEmail) {
      return { success: false, message: "Missing required SMTP fields" };
    }

    // Find existing active config
    const existing = await SMTPConfig.findOne({ isActive: true });

    let config;
    if (existing) {
      // Update existing - only update password if provided
      const updateData: any = { host, port, secure, user, fromName, fromEmail, replyTo };
      if (password) {
        updateData.password = password;
      }
      config = await SMTPConfig.findByIdAndUpdate(
        existing._id,
        { $set: updateData },
        { new: true, select: "-password" }
      );
    } else {
      // Create new - password required
      if (!password) {
        return { success: false, message: "Password required for new SMTP config" };
      }
      config = await SMTPConfig.create({
        host,
        port,
        secure,
        user,
        password,
        fromName,
        fromEmail,
        replyTo,
        isActive: true,
      });
      // Remove password from response
      config = await SMTPConfig.findById(config._id).select("-password");
    }

    return {
      success: true,
      message: "SMTP config updated successfully",
      data: config,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update SMTP config" };
  }
};

/**
 * Test SMTP connection with provided or stored config
 */
export const testSMTPConnection = async (testEmail?: string) => {
  try {
    // Get config with password
    const configDoc = await SMTPConfig.findOne({ isActive: true }).select("+password").lean();
    
    let transportConfig;
    if (configDoc) {
      transportConfig = {
        host: configDoc.host,
        port: configDoc.port,
        secure: configDoc.secure,
        auth: {
          user: configDoc.user,
          pass: configDoc.password,
        },
      };
    } else {
      // Fallback to env
      transportConfig = {
        host: ENV.EMAIL_HOST,
        port: ENV.EMAIL_PORT,
        secure: ENV.EMAIL_PORT === 465,
        auth: {
          user: ENV.EMAIL_USER,
          pass: ENV.EMAIL_PASSWORD,
        },
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Verify connection
    await transporter.verify();

    // If testEmail provided, send test message
    if (testEmail) {
      const fromName = configDoc?.fromName || "Learn & Grow";
      const fromEmail = configDoc?.fromEmail || ENV.EMAIL_USER;
      
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: testEmail,
        subject: "SMTP Test - Learn & Grow",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6;">SMTP Configuration Test</h2>
            <p>This is a test email to verify your SMTP settings are working correctly.</p>
            <p>If you received this email, your SMTP configuration is valid and operational.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Learn & Grow Platform</strong><br>
              ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        text: "SMTP configuration test successful. Your email settings are working correctly.",
      });

      return {
        success: true,
        message: `SMTP test successful. Test email sent to ${testEmail}`,
      };
    }

    return {
      success: true,
      message: "SMTP connection verified successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `SMTP test failed: ${error.message}`,
    };
  }
};

/**
 * Get SMTP transporter for sending emails (used by other services)
 */
export const getSMTPTransporter = async () => {
  try {
    const configDoc = await SMTPConfig.findOne({ isActive: true }).select("+password").lean();

    if (configDoc) {
      return nodemailer.createTransport({
        host: configDoc.host,
        port: configDoc.port,
        secure: configDoc.secure,
        auth: {
          user: configDoc.user,
          pass: configDoc.password,
        },
      });
    }

    // Fallback to env
    return nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: ENV.EMAIL_PORT === 465,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Failed to create SMTP transporter:", error);
    // Return env-based transport as last resort
    return nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: ENV.EMAIL_PORT === 465,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
    });
  }
};
