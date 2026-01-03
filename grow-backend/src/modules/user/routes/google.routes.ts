import express from "express";
import passport from "passport";
import { generateTokens } from "@/utils/jwt";
import { User } from "@/modules/user/model/user.model";
import { ENV } from "@/config/env";

const router = express.Router();

/**
 * Google OAuth login route
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/**
 * Google OAuth callback route
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  async (req: any, res) => {
    try {
      const user = req.user as any;

      // Safety check
      if (!user || !user._id) {
        console.error("Google callback: user object is invalid", user);
        res.redirect(`${ENV.FRONTEND_URL}/login?error=authentication_failed`);
        return;
      }

      // Check if this is a new user
      const isNewUser = user.isNewGoogleUser === true;

      // If new user, redirect to role selection instead of generating tokens
      if (isNewUser) {
        // Store user ID temporarily in URL for role selection
        const redirectUrl = `${ENV.FRONTEND_URL}/select-role?userId=${user._id}`;
        res.redirect(redirectUrl);
        return;
      }

      // Generate tokens for existing users
      const { accessToken, refreshToken } = generateTokens(
        user._id.toString(),
        user.role
      );

      // Save refresh token
      await User.findByIdAndUpdate(user._id, {
        refreshToken,
      });

      // Redirect to frontend with tokens
      const roleRedirects: Record<string, string> = {
        student: "/student",
        instructor: "/instructor",
        guardian: "/guardian",
        admin: "/admin",
      };

      const redirectPath = roleRedirects[user.role] || "/student";
      const redirectUrl = `${ENV.FRONTEND_URL}/auth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${user.role}&redirect=${redirectPath}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${ENV.FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
);

export default router;
