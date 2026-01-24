import mongoose from "mongoose";
import { TeamMember } from "../modules/team/model/team.model";
import { ENV } from "../config/env";

const TEAM_MEMBER_ID = "696401826e19b4d9f6eb3bd1"; 

async function deleteTeamMemberById() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect("mongodb://admin:admin123@72.62.194.176:27017/learn_grow?authSource=admin");
    console.log("✅ Connected");

    const deleted = await TeamMember.findByIdAndDelete(TEAM_MEMBER_ID);

    if (!deleted) {
      console.log("❌ No team member found with this ID");
    } else {
      console.log("✅ Team member deleted:", deleted._id.toString());
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting team member:", error);
    process.exit(1);
  }
}

deleteTeamMemberById();
