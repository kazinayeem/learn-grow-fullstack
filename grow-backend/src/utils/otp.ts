import nodemailer from "nodemailer";
import { ENV } from "@/config/env";
import { getSMTPTransporter } from "@/modules/settings/service/smtp.service";
import { SMTPConfig } from "@/modules/settings/model/smtpConfig.model";

/**
 * Get from email from database configuration
 */
const getFromEmailConfig = async (): Promise<{ fromEmail: string; fromName: string }> => {
  const smtpConfig = await SMTPConfig.findOne({ isActive: true }).select("fromEmail fromName").lean();
  if (!smtpConfig) {
    throw new Error("SMTP configuration not found. Please configure email settings.");
  }
  return {
    fromEmail: smtpConfig.fromEmail,
    fromName: smtpConfig.fromName || "Learn & Grow",
  };
};

/**
 * Send Course Approval Email to Instructor
 */
export const sendCourseApprovalEmail = async (
  email: string,
  instructorName: string,
  courseTitle: string,
  courseId: string
): Promise<boolean> => {
  try {
    const transporter = await getSMTPTransporter();
    const { fromEmail, fromName } = await getFromEmailConfig();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `🎉 Your Course "${courseTitle}" has been Approved!`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🎉 Congratulations!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px;">Hello ${instructorName},</p>
            <p style="font-size: 16px;">Great news! Your course has been approved by our admin team and is now live on the platform.</p>
            
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
              <h2 style="margin: 0 0 10px 0; color: #059669;">📚 ${courseTitle}</h2>
              <p style="color: #666; margin: 0;">Course ID: ${courseId}</p>
            </div>

            <p style="font-size: 16px;">Your course is now visible to students and ready to enroll. Here's what you can do next:</p>
            
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Publish Modules:</strong> Make sure to publish your modules and lessons so students can access them</li>
              <li><strong>Monitor Enrollments:</strong> Track student progress and engagement</li>
              <li><strong>Update Content:</strong> Keep your course content fresh and up-to-date</li>
              <li><strong>Engage Students:</strong> Respond to student questions and feedback</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${ENV.FRONTEND_URL || 'http://localhost:3000'}/instructor/courses/${courseId}" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Your Course
              </a>
            </div>

            <p style="color: #666;">Thank you for contributing to our learning community!</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Learn & Grow. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Course approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending course approval email:", error);
    return false;
  }
};

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Email
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  name: string = "User"
): Promise<boolean> => {
  try {
    const transporter = await getSMTPTransporter();
    const { fromEmail, fromName } = await getFromEmailConfig();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Your OTP for Learn & Grow - Email Verification",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>Learn & Grow</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <p>Hello ${name},</p>
            <p>Your One-Time Password (OTP) for email verification is:</p>
            <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #667eea;">
              <h2 style="margin: 0; color: #667eea; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
            </div>
            <p style="color: #666;">This OTP will expire in 5 minutes.</p>
            <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 2026 Learn & Grow. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

/**
 * Send OTP via SMS (Twilio)
 */
export const sendOTPSMS = async (
  phoneNumber: string,
  otp: string
): Promise<boolean> => {
  try {
    if (!ENV.TWILIO_ACCOUNT_SID || !ENV.TWILIO_AUTH_TOKEN) {
      console.warn("Twilio credentials not configured");
      return false;
    }

    // Uncomment when Twilio SDK is properly configured
    // const twilio = require("twilio");
    // const client = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your Learn & Grow OTP is: ${otp}. Valid for 5 minutes.`,
    //   from: ENV.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber,
    // });

    console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
};

/** * Send Welcome Email on Registration
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  role: string
): Promise<boolean> => {
  try {
    const transporter = await getSMTPTransporter();
    const { fromEmail, fromName } = await getFromEmailConfig();

    const roleMessages: Record<string, string> = {
      student: "Start learning with our wide range of courses!",
      instructor: "Your instructor account has been created. Please wait for admin approval to start creating courses.",
      guardian: "Monitor your child's learning progress and stay connected.",
      admin: "You now have full access to manage the platform."
    };

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Welcome to Learn & Grow! 🎉",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🎓 Welcome to Learn & Grow!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <h2>Hello ${name}! 👋</h2>
            <p style="font-size: 16px; line-height: 1.6;">Thank you for registering as a <strong>${role}</strong> on Learn & Grow platform.</p>
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #666;">${roleMessages[role] || "Welcome aboard!"}</p>
            </div>
            ${role === 'instructor' ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>⏳ Approval Required:</strong><br>
                  Your account will be reviewed by our administrators. You'll receive an email once your instructor account is approved.
                </p>
              </div>
            ` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ENV.FRONTEND_URL}" style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Learn & Grow. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return false;
  }
};

/** Send guardian credentials to the student's email */
export const sendGuardianCredentialsEmail = async (
  studentEmail: string,
  studentName: string,
  guardianEmail: string,
  guardianPassword: string
): Promise<boolean> => {
  try {
    const transporter = await getSMTPTransporter();
    const { fromEmail, fromName } = await getFromEmailConfig();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: studentEmail,
      subject: "Guardian Account Created – Credentials Inside",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Guardian Account Created</h2>
            <p style="margin: 8px 0 0;">Share these credentials with your guardian</p>
          </div>
          <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px; color: #111827;">Hi ${studentName || "there"},</p>
            <p style="font-size: 14px; color: #374151; line-height: 1.6;">We created a guardian account linked to your profile. Please share the credentials below with your parent/guardian.</p>
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #111827;">Guardian Login</p>
              <ul style="list-style: none; padding: 0; margin: 0; color: #374151; font-size: 14px;">
                <li><strong>Email:</strong> ${guardianEmail}</li>
                <li><strong>Password:</strong> ${guardianPassword}</li>
              </ul>
            </div>
            <p style="font-size: 14px; color: #374151;">For security, ask your guardian to change the password after first login.</p>
            <a href="${ENV.FRONTEND_URL || "http://localhost:3000"}/login" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Open Login</a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send guardian credentials email:", error);
    return false;
  }
};

/**
 * Send Instructor Approval Email
 */
export const sendInstructorApprovalEmail = async (
  email: string,
  name: string,
  isApproved: boolean
): Promise<boolean> => {
  try {
    const transporter = await getSMTPTransporter();
    const { fromEmail, fromName } = await getFromEmailConfig();

    const subject = isApproved 
      ? "🎉 Your Instructor Account Has Been Approved!"
      : "Application Status Update";

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; padding: 30px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">${isApproved ? '✅' : '❌'} Instructor Application</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <h2>Hello ${name}!</h2>
            ${isApproved ? `
              <p style="font-size: 16px; line-height: 1.6;">Great news! Your instructor account has been <strong>approved</strong> by our administrators. 🎉</p>
              <div style="background: #d1fae5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46;">
                  <strong>You can now:</strong><br>
                  ✓ Create and publish courses<br>
                  ✓ Manage course content and modules<br>
                  ✓ Upload videos and materials<br>
                  ✓ Schedule live classes<br>
                  ✓ Track student progress
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ENV.FRONTEND_URL}/instructor/courses" style="display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Create Your First Course</a>
              </div>
            ` : `
              <p style="font-size: 16px; line-height: 1.6;">We regret to inform you that your instructor application has been <strong>declined</strong> at this time.</p>
              <div style="background: #fee2e2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #991b1b;">
                  If you believe this is an error or would like to reapply, please contact our support team.
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ENV.FRONTEND_URL}/contact" style="display: inline-block; padding: 15px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Contact Support</a>
              </div>
            `}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Learn & Grow. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Instructor approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send instructor approval email:", error);
    return false;
  }
};

/** * Calculate OTP expiration time (5 minutes from now)
 */
export const getOTPExpirationTime = (): Date => {
  return new Date(Date.now() + 5 * 60 * 1000);
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date | undefined): boolean => {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
};
