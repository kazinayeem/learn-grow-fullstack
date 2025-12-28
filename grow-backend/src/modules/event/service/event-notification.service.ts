import * as nodemailer from "nodemailer";
import { Event } from "../model/event.model";
import { EventRegistration } from "../model/event-registration.model";
import { EventGuest } from "../model/event-guest.model";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send registration confirmation email
export const sendRegistrationConfirmation = async (
  registration: any,
  event: any
) => {
  const guests = await EventGuest.find({ _id: { $in: event.guests } });
  
  const guestList = guests
    .map((g) => `${g.fullName} (${g.role})`)
    .join(", ");
  
  const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  let locationInfo = "";
  if (event.mode === "Offline") {
    locationInfo = `
      <h3>📍 Venue Details</h3>
      <p><strong>Venue:</strong> ${event.venueName}</p>
      <p><strong>Address:</strong> ${event.venueAddress}</p>
      ${event.googleMapLink ? `<p><a href="${event.googleMapLink}">View on Google Maps</a></p>` : ""}
    `;
  } else {
    locationInfo = `
      <h3>💻 Online Event</h3>
      <p><strong>Platform:</strong> ${event.platformType || "To be announced"}</p>
      ${event.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${event.meetingLink}">${event.meetingLink}</a></p>` : "<p>Meeting link will be sent closer to the event date.</p>"}
      ${event.platformInstructions ? `<p><strong>Instructions:</strong> ${event.platformInstructions}</p>` : ""}
    `;
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${registration.fullName}</strong>,</p>
          
          <p>Thank you for registering for <strong>${event.title}</strong>!</p>
          
          <div class="info-box">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Type:</strong> ${event.type}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
            <p><strong>Mode:</strong> ${event.mode}</p>
          </div>
          
          ${guestList ? `
          <div class="info-box">
            <h3>👥 Guest Speakers/Hosts</h3>
            <p>${guestList}</p>
          </div>
          ` : ""}
          
          <div class="info-box">
            ${locationInfo}
          </div>
          
          <p><strong>Your Registration Details:</strong></p>
          <ul>
            <li>Name: ${registration.fullName}</li>
            <li>Email: ${registration.email}</li>
            <li>Phone: ${registration.phoneNumber}</li>
          </ul>
          
          ${!event.meetingLink && event.mode === "Online" ? `
          <p><em>Note: The meeting link will be sent to you via email before the event starts.</em></p>
          ` : ""}
          
          <div class="footer">
            <p>See you at the event!</p>
            <p>Best regards,<br><strong>Learn & Grow Team</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Learn & Grow" <noreply@learngrow.com>',
    to: registration.email,
    subject: `Registration Confirmed: ${event.title}`,
    html: htmlContent,
  });
};

// Send meeting link to all registered users (when admin adds it)
export const sendMeetingLinkToAllAttendees = async (eventId: string) => {
  const event = await Event.findById(eventId).populate("guests");
  
  if (!event || event.mode !== "Online" || !event.meetingLink) {
    throw new Error("Invalid event or meeting link not available");
  }
  
  const registrations = await EventRegistration.find({
    event: eventId,
    notificationSent: false,
  });
  
  if (registrations.length === 0) {
    return { sent: 0, message: "No pending notifications" };
  }
  
  const guests = event.guests as any[];
  const guestList = guests
    .map((g) => `${g.fullName} (${g.role})`)
    .join(", ");
  
  const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const htmlTemplate = (name: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
        .meeting-link { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔗 Meeting Link Available!</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>The meeting link for <strong>${event.title}</strong> is now available!</p>
          
          <div class="meeting-link">
            <p><strong>Join the Event:</strong></p>
            <a href="${event.meetingLink}" class="button">🎥 Join Meeting</a>
            <p style="margin-top: 10px; font-size: 14px;">Or copy this link: <br><a href="${event.meetingLink}">${event.meetingLink}</a></p>
          </div>
          
          <div class="info-box">
            <h3>📅 Event Reminder</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
            <p><strong>Platform:</strong> ${event.platformType}</p>
          </div>
          
          ${guestList ? `
          <div class="info-box">
            <h3>👥 Featured Guests</h3>
            <p>${guestList}</p>
          </div>
          ` : ""}
          
          ${event.platformInstructions ? `
          <div class="info-box">
            <h3>📋 Platform Instructions</h3>
            <p>${event.platformInstructions}</p>
          </div>
          ` : ""}
          
          <p><strong>⏰ Important:</strong> Please join a few minutes early to ensure your setup is working properly.</p>
          
          <div class="footer">
            <p>We look forward to seeing you!</p>
            <p>Best regards,<br><strong>Learn & Grow Team</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const emailPromises = registrations.map((registration) =>
    transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Learn & Grow" <noreply@learngrow.com>',
      to: registration.email,
      subject: `Meeting Link: ${event.title}`,
      html: htmlTemplate(registration.fullName),
    })
  );
  
  await Promise.all(emailPromises);
  
  // Mark notifications as sent
  await EventRegistration.updateMany(
    { _id: { $in: registrations.map((r) => r._id) } },
    { notificationSent: true }
  );
  
  return { sent: registrations.length, message: "Meeting links sent successfully" };
};
