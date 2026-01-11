import mongoose, { Schema, Document } from "mongoose";

interface ITeamMember extends Document {
    name: string;
    role: string;
    image: string; // Image URL
    imageSize: number; // Size in bytes (deprecated, kept for backward compatibility)
    linkedIn?: string;
    twitter?: string;
    bio?: string;
    showOnHome: boolean; // Toggle for home page display
    userId?: string; // Reference to User if imported from instructors
    position: number; // Position within the role for ordering
    createdAt: Date;
    updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        role: {
            type: String,
            required: [true, "Role is required"],
            trim: true,
        },
        image: {
            type: String,
            required: false,
            default: "placeholder",
        },
        imageSize: {
            type: Number,
            required: false,
            default: 0,
        },
        linkedIn: {
            type: String,
            default: "",
        },
        twitter: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        showOnHome: {
            type: Boolean,
            default: true,
        },
        userId: {
            type: String,
            default: null,
        },
        position: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Create compound index for efficient sorting by role and position
TeamMemberSchema.index({ role: 1, position: 1 });

const TeamMember = mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

export { TeamMember, ITeamMember };
