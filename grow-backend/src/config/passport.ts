import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "@/modules/user/model/user.model";
import { StudentProfile } from "@/modules/user/model/studentProfile.model";
import { GuardianProfile } from "@/modules/user/model/guardianProfile.model";
import { ENV } from "@/config/env";
import { sendGuardianCredentialsEmail, sendWelcomeEmail } from "@/utils/otp";

// Only configure Google OAuth if credentials are provided
if (ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: ENV.GOOGLE_CLIENT_ID,
        clientSecret: ENV.GOOGLE_CLIENT_SECRET,
        callbackURL: ENV.GOOGLE_CALLBACK_URL,
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists by Google ID
        let user = await User.findOne({ googleId: profile.id });
        let isNewUser = false;

        if (user) {
          const expressUser = { id: user._id.toString(), email: user.email, role: user.role };
          return done(null, expressUser as any);
        }

        // Check if email already exists
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link Google to existing user
            user.googleId = profile.id;
            await user.save();
            const expressUser = { id: user._id.toString(), email: user.email, role: user.role };
            return done(null, expressUser as any);
          }
        }

        // Create new student user
        user = await User.create({
          googleId: profile.id,
          name,
          email,
          role: "student",
          isVerified: true,
          isNewGoogleUser: false,
        });

        // Auto-create guardian account and send credentials
        (async () => {
          try {
            const guardianPasswordPlain = crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
            const guardianPassword = await bcrypt.hash(guardianPasswordPlain, 10);
            const suffix = user._id.toString().slice(-6);
            const guardianEmail = email
              ? email.replace("@", `+guardian_${suffix}@`)
              : `guardian-${suffix}@learnandgrow.local`;

            // Create guardian account (1:1 relationship)
            const guardian = await User.create({
              name: `${name || "Student"}'s Guardian`,
              email: guardianEmail,
              password: guardianPassword,
              role: "guardian",
              isVerified: true,
            });

            // Create StudentProfile with guardianId link
            await StudentProfile.findOneAndUpdate(
              { userId: user._id },
              { $setOnInsert: { userId: user._id }, $set: { guardianId: guardian._id } },
              { upsert: true }
            );

            // Create GuardianProfile with studentId link
            await GuardianProfile.findOneAndUpdate(
              { userId: guardian._id },
              { $setOnInsert: { userId: guardian._id }, $set: { studentId: user._id } },
              { upsert: true }
            );

            // Add student to guardian's children array
            guardian.children = [user._id] as any;
            await guardian.save();

            if (email) {
              sendGuardianCredentialsEmail(email, name || "Student", guardianEmail, guardianPasswordPlain).catch((err) =>
                console.error("Failed to send guardian credentials (Google signup):", err)
              );
            }
          } catch (err) {
            console.error("Guardian auto-create (Google signup) failed:", err);
          }
        })();

        // Send welcome email (non-blocking)
        if (email) {
          sendWelcomeEmail(email, name || "Student", "student").catch((err) =>
            console.error("Welcome email (Google signup) failed:", err)
          );
        }

        const expressUser = { id: user._id.toString(), email: user.email || '', role: user.role };
        return done(null, expressUser as any);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
  );
} else {
  console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.');
}

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      const expressUser = { id: user._id.toString(), email: user.email, role: user.role };
      done(null, expressUser as any);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
