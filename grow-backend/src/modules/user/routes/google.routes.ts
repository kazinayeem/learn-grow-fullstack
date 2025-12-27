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

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user._id.toString(),
        user.role
      );

      // Save refresh token
      await User.findByIdAndUpdate(user._id, {
        refreshToken,
      });

      // Redirect to frontend with tokens
      const redirectUrl = `${ENV.FRONTEND_URL}/auth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${user.role}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${ENV.FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
);

export default router;
