import mongoose from "mongoose";
import { TeamMember } from "../src/modules/team/model/team.model.js";
import { ENV } from "../src/config/env.js";

async function deleteOneTeamMember() {
  try {
    await mongoose.connect(ENV.MONGO_URI);

    const result = await TeamMember.findByIdAndDelete(
      "696401826e19b4d9f6eb3bd1"
    );

    if (!result) {
      console.log("❌ Team member not found");
    } else {
      console.log("✅ Team member deleted:", result._id);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteOneTeamMember();
