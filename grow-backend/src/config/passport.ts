import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "@/modules/user/model/user.model";
import { generateTokens } from "@/utils/jwt";
import { ENV } from "@/config/env";

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
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Create new user from Google profile
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        // Check if email already exists
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link Google to existing user
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user - default role is student
        user = await User.create({
          googleId: profile.id,
          name,
          email,
          role: "student",
          isVerified: true, // Google verified
        });

        return done(null, user);
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
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
