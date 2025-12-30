import mongoose from "mongoose";
import { EventGuest } from "../modules/event/model/event-guest.model";
import { Event } from "../modules/event/model/event.model";
import { EventRegistration } from "../modules/event/model/event-registration.model";
import { User } from "../modules/user/model/user.model";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

// Generate random data
function generateRandomString(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomItem<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

const firstNames = [
  "John", "Jane", "Michael", "Sarah", "David", "Emma", "James", "Lisa",
  "Robert", "Mary", "William", "Jennifer", "Richard", "Patricia", "Thomas",
  "Linda", "Charles", "Barbara", "Mohammad", "Nayeem", "Ali", "Fatima",
  "Ahmed", "Zainab", "Hassan", "Aisha", "Ibrahim", "Mariam"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller",
  "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "Khan",
  "Ahmed", "Hassan", "Ali", "Rahman", "Ibrahim"
];

const roles = ["Guest", "Host", "Speaker", "Mentor", "Judge"];
const organizations = [
  "Tech Academy", "Innovation Hub", "Learning Center", "Digital Institute",
  "Code School", "Data Academy", "Web University", "Cloud Academy"
];

async function seedEventGuestsAndEvents() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing event guests and events...");
    await EventGuest.deleteMany({});
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});

    // ===== CREATE 100 EVENT GUESTS =====
    console.log("👥 Creating 100 event guests...");
    const guestData = [];
    for (let i = 1; i <= 100; i++) {
      guestData.push({
        fullName: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
        email: `host${i}@learngrow.com`,
        phone: `+880${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        role: getRandomItem(roles),
        organization: getRandomItem(organizations),
        designation: "Senior " + getRandomItem(["Educator", "Coach", "Facilitator", "Coordinator"]),
        bio: `Experienced professional with expertise in various domains. Passionate about education and skill development.`,
        profileImage: `https://i.pravatar.cc/150?img=${i}`,
        isActive: true,
      });
    }
    const createdGuests = await EventGuest.insertMany(guestData);
    console.log(`✅ Created ${createdGuests.length} event guests`);

    // ===== CREATE 500 EVENTS =====
    console.log("📅 Creating 500 events...");
    
    // Find or create admin user for createdBy
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("👤 Creating admin user for events...");
      adminUser = await User.create({
        name: "Event Admin",
        phone: "+8801234567890",
        email: "admin@learngrow.com",
        role: "admin",
        password: "admin123", // Will be hashed by pre-save hook
        isVerified: true,
      });
      console.log("✅ Admin user created");
    }
    
    const eventTypes = ["Workshop", "Seminar", "Competition", "Bootcamp", "Webinar"];
    const modes = ["Online", "Offline"];
    const statuses = ["Upcoming", "Ongoing", "Completed"];
    const platformTypes = ["Zoom", "Google Meet", "Microsoft Teams", "Custom"];

    const eventData = [];
    const baseDate = new Date();

    for (let i = 1; i <= 500; i++) {
      const eventDate = new Date(baseDate);
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 90)); // Random date in next 90 days
      
      const selectedGuests: any[] = [];
      const guestCount = Math.floor(Math.random() * 5) + 1; // 1-5 guests per event
      for (let j = 0; j < guestCount; j++) {
        const randomGuest = getRandomItem(createdGuests);
        if (!selectedGuests.includes(randomGuest._id)) {
          selectedGuests.push(randomGuest._id);
        }
      }

      const mode = getRandomItem(modes);
      const isOnline = mode === "Online";

      eventData.push({
        title: `${getRandomItem(eventTypes)} #${i}: ${generateRandomString(10).charAt(0).toUpperCase()}${generateRandomString(15)}`,
        type: getRandomItem(eventTypes),
        shortDescription: `Join us for an amazing ${getRandomItem(eventTypes).toLowerCase()} session covering essential topics and practical insights.`,
        detailedDescription: `<p>This is a comprehensive ${mode.toLowerCase()} ${getRandomItem(eventTypes).toLowerCase()} designed for professionals and enthusiasts.</p><p>Learn best practices, network with experts, and grow your skills in this interactive session.</p><p>Topics covered: Industry trends, practical techniques, Q&A session, and networking opportunities.</p>`,
        bannerImage: `https://picsum.photos/800/400?random=${i}`,
        eventDate,
        startTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${getRandomItem(["00", "30"])}`,
        endTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${getRandomItem(["00", "30"])}`,
        mode,
        venueName: isOnline ? null : `Venue ${i}`,
        venueAddress: isOnline ? null : `Address ${i}, City, Country`,
        googleMapLink: isOnline ? null : `https://maps.google.com/?q=venue+${i}`,
        platformType: isOnline ? getRandomItem(platformTypes) : null,
        meetingLink: isOnline ? `https://zoom.us/j/${Math.floor(Math.random() * 1000000000000)}` : null,
        platformInstructions: isOnline ? "Please join 5 minutes early. Test your audio and video before the session starts." : null,
        maxSeats: Math.floor(Math.random() * 200) + 50,
        registeredCount: 0,
        isRegistrationOpen: Math.random() > 0.3, // 70% open, 30% closed
        status: getRandomItem(statuses),
        guests: selectedGuests,
        createdBy: adminUser._id,
      });
    }

    const createdEvents = await Event.insertMany(eventData);
    console.log(`✅ Created ${createdEvents.length} events`);

    // ===== CREATE SAMPLE REGISTRATIONS =====
    console.log("📝 Creating sample registrations for events...");
    const registrationData = [];
    let registrationCount = 0;

    for (const event of createdEvents) {
      // 10-50 random registrations per event
      const regCount = Math.floor(Math.random() * 40) + 10;
      
      for (let j = 0; j < regCount; j++) {
        registrationData.push({
          event: event._id,
          fullName: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
          email: `user${registrationCount}@example.com`,
          phoneNumber: `+880${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          registeredAt: new Date(),
          notificationSent: Math.random() > 0.5,
        });
        registrationCount++;
      }

      // Update event registered count
      await Event.findByIdAndUpdate(event._id, { registeredCount: regCount });
    }

    if (registrationData.length > 0) {
      await EventRegistration.insertMany(registrationData);
      console.log(`✅ Created ${registrationCount} event registrations`);
    }

    // ===== SUMMARY =====
    console.log("\n📊 ===== SEEDING COMPLETE =====");
    console.log(`✅ Event Guests Created: ${createdGuests.length}`);
    console.log(`✅ Events Created: ${createdEvents.length}`);
    console.log(`✅ Registrations Created: ${registrationCount}`);
    console.log("\n🎯 Sample Data Created Successfully!");
    console.log("   - 100 event hosts/guests");
    console.log("   - 500 events (mix of Online/Offline, various types)");
    console.log("   - Sample registrations for all events");
    console.log("\n💡 You can now test the application with real data!");

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seeding
seedEventGuestsAndEvents();
