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
        // Check if user exists by Google ID
        let user = await User.findOne({ googleId: profile.id });
        let isNewUser = false;

        if (user) {
          return done(null, user);
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
            return done(null, user);
          }
        }

        // Create new user as temporary (role will be selected by user)
        // Store in session that this is a new user needing role selection
        user = await User.create({
          googleId: profile.id,
          name,
          email,
          role: "student", // Default role, user can change during registration
          isVerified: true, // Google verified
        });

        // Mark as new user so frontend knows to ask for role
        user.isNewGoogleUser = true;

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
