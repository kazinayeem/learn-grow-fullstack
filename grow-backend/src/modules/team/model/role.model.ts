import mongoose, { Schema, Document } from "mongoose";

interface IRole extends Document {
    name: string;
    position: number; // For ordering roles
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: [true, "Role name is required"],
            trim: true,
            unique: true,
        },
        position: {
            type: Number,
            required: true,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create index for efficient sorting by position
RoleSchema.index({ position: 1 });

const Role = mongoose.model<IRole>("Role", RoleSchema);

export { Role, IRole };
