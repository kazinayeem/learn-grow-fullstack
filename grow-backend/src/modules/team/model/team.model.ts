import mongoose, { Schema, Document } from "mongoose";

interface ITeamMember extends Document {
    name: string;
    role: string;
    image: string; // Base64 encoded image
    imageSize: number; // Size in bytes
    linkedIn?: string;
    twitter?: string;
    bio?: string;
    showOnHome: boolean; // Toggle for home page display
    userId?: string; // Reference to User if imported from instructors
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
    },
    {
        timestamps: true,
    }
);

const TeamMember = mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

export { TeamMember, ITeamMember };
