import { TeamMember, ITeamMember } from "../model/team.model";
import { User } from "../../user/model/user.model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";

const extractCloudinaryPublicId = (url?: string) => {
    if (!url || !url.includes("res.cloudinary.com")) return "";
    return (
        url
            .split("/upload/")[1]
            ?.replace(/^v\d+\//, "")
            ?.replace(/\.[^/.]+$/, "") || ""
    );
};

const looksLikeBase64 = (value?: string) => {
    if (!value) return false;
    if (value.startsWith("data:image/")) return true;
    if (value.startsWith("http") || value === "placeholder") return false;
    return /^[A-Za-z0-9+/=\r\n]+$/.test(value);
};

const uploadTeamImageIfNeeded = async (image?: string, filePrefix: string = "team") => {
    if (!image || image === "placeholder") {
        return { image: image || "placeholder", imagePublicId: "" };
    }

    if (image.startsWith("http")) {
        // Keep existing Cloudinary URLs, but migrate external URLs into Cloudinary.
        if (!image.includes("res.cloudinary.com")) {
            try {
                const response = await fetch(image);
                if (response.ok) {
                    const buffer = Buffer.from(await response.arrayBuffer());
                    const uploaded = await uploadToCloudinary(
                        buffer,
                        `${filePrefix}-${Date.now()}`,
                        "team/members"
                    );
                    return { image: uploaded.url, imagePublicId: uploaded.publicId };
                }
            } catch (error) {
                console.log("Could not migrate external image URL to Cloudinary:", error);
            }
        }

        return {
            image,
            imagePublicId: extractCloudinaryPublicId(image),
        };
    }

    if (looksLikeBase64(image)) {
        const base64Payload = image.startsWith("data:image/")
            ? image.split(",")[1] || ""
            : image;

        const buffer = Buffer.from(base64Payload, "base64");
        const uploaded = await uploadToCloudinary(
            buffer,
            `${filePrefix}-${Date.now()}`,
            "team/members"
        );

        return { image: uploaded.url, imagePublicId: uploaded.publicId };
    }

    return { image, imagePublicId: "" };
};

class TeamService {
    // Get all team members
    async getAllTeamMembers() {
        try {
            const members = await TeamMember.find().sort({ role: 1, position: 1 });
            return { success: true, data: members };
        } catch (error) {
            throw error;
        }
    }

    // Get team members to display on home (showOnHome = true)
    async getHomeTeamMembers() {
        try {
            const members = await TeamMember.find({ showOnHome: true }).sort({ role: 1, position: 1 });
            return { success: true, data: members };
        } catch (error) {
            throw error;
        }
    }

    // Get single team member
    async getTeamMemberById(id: string) {
        try {
            const member = await TeamMember.findById(id);
            if (!member) {
                return { success: false, message: "Team member not found" };
            }
            return { success: true, data: member };
        } catch (error) {
            throw error;
        }
    }

    // Create team member
    async createTeamMember(data: {
        name: string;
        role: string;
        image: string;
        linkedIn?: string;
        twitter?: string;
        bio?: string;
    }) {
        try {
            const uploadedImage = await uploadTeamImageIfNeeded(data.image, `team-${data.name}`);

            const newMember = new TeamMember({
                ...data,
                image: uploadedImage.image,
                imagePublicId: uploadedImage.imagePublicId,
                imageSize: 0,
                showOnHome: true,
            });

            await newMember.save();
            return { success: true, data: newMember, message: "Team member created successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Update team member
    async updateTeamMember(id: string, data: Partial<ITeamMember>) {
        try {
            const currentMember = await TeamMember.findById(id);
            if (!currentMember) {
                return { success: false, message: "Team member not found" };
            }

            let nextImage = currentMember.image;
            let nextImagePublicId = currentMember.imagePublicId || extractCloudinaryPublicId(currentMember.image);

            if (typeof data.image === "string") {
                const uploadedImage = await uploadTeamImageIfNeeded(data.image, `team-${currentMember.name}`);
                nextImage = uploadedImage.image;
                const uploadedPublicId = uploadedImage.imagePublicId;

                // Delete previous Cloudinary asset when image is replaced
                if (nextImage !== currentMember.image && nextImagePublicId) {
                    try {
                        await deleteFromCloudinary(nextImagePublicId);
                    } catch (cleanupError) {
                        console.log("Could not delete previous team image:", cleanupError);
                    }
                }

                nextImagePublicId = uploadedPublicId;
            }

            const member = await TeamMember.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            });

            if (!member) return { success: false, message: "Team member not found" };

            if (typeof data.image === "string") {
                member.image = nextImage;
                member.imagePublicId = nextImagePublicId;
                member.imageSize = 0;
                await member.save();
            }

            return { success: true, data: member, message: "Team member updated successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Toggle show on home
    async toggleShowHome(id: string, showOnHome: boolean) {
        try {
            const member = await TeamMember.findByIdAndUpdate(id, { showOnHome }, { new: true });

            if (!member) {
                return { success: false, message: "Team member not found" };
            }

            return { success: true, data: member, message: "Team member visibility updated" };
        } catch (error) {
            throw error;
        }
    }

    // Delete team member
    async deleteTeamMember(id: string) {
        try {
            const member = await TeamMember.findById(id);

            if (!member) {
                return { success: false, message: "Team member not found" };
            }

            const publicId = member.imagePublicId || extractCloudinaryPublicId(member.image);
            if (publicId) {
                try {
                    await deleteFromCloudinary(publicId);
                } catch (cleanupError) {
                    console.log("Could not delete team image from Cloudinary:", cleanupError);
                }
            }

            await TeamMember.findByIdAndDelete(id);

            return { success: true, message: "Team member deleted successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Import instructors from User collection
    async importInstructors(instructorIds: string[]) {
        try {
            const instructors = await User.find({
                _id: { $in: instructorIds },
                role: "instructor",
            }).select("_id name profileImage bio");

            if (instructors.length === 0) {
                return { success: false, message: "No instructors found with provided IDs" };
            }

            // Create team members from instructors
            const newMembers = [];
            const skippedInstructors = [];
            
            for (const instructor of instructors) {
                // Skip if already exists
                const existing = await TeamMember.findOne({ userId: instructor._id.toString() });
                if (existing) {
                    skippedInstructors.push(instructor.name);
                    continue;
                }
                
                const uploadedImage = await uploadTeamImageIfNeeded(
                    instructor.profileImage || "placeholder",
                    `team-import-${instructor._id}`
                );
                
                // Create team member (even if no image)
                const newMember = new TeamMember({
                    name: instructor.name,
                    role: "Instructor",
                    image: uploadedImage.image || "placeholder",
                    imagePublicId: uploadedImage.imagePublicId || "",
                    imageSize: 0,
                    bio: instructor.bio || "",
                    userId: instructor._id.toString(),
                    showOnHome: true,
                });
                
                await newMember.save();
                newMembers.push(newMember);
            }

            const message = `${newMembers.length} instructors imported successfully${skippedInstructors.length > 0 ? `. Skipped ${skippedInstructors.length} (already exist)` : ''}`;

            return {
                success: true,
                data: newMembers,
                message: message,
            };
        } catch (error) {
            throw error;
        }
    }

    // Get approved instructors for import
    async getApprovedInstructors() {
        try {
            const instructors = await User.find({
                role: "instructor",
                isApproved: true,
            })
                .select("_id name profileImage bio")
                .sort({ createdAt: -1 });

            return { success: true, data: instructors };
        } catch (error) {
            throw error;
        }
    }

    // Reorder members within a role
    async reorderMembers(memberOrders: { id: string; position: number }[]) {
        try {
            const updatePromises = memberOrders.map((order) =>
                TeamMember.findByIdAndUpdate(order.id, { position: order.position }, { new: true })
            );

            await Promise.all(updatePromises);

            const updatedMembers = await TeamMember.find().sort({ role: 1, position: 1 });
            return { success: true, data: updatedMembers, message: "Members reordered successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Update member position
    async updateMemberPosition(id: string, position: number) {
        try {
            const member = await TeamMember.findByIdAndUpdate(
                id,
                { position },
                { new: true }
            );

            if (!member) {
                return { success: false, message: "Team member not found" };
            }

            return { success: true, data: member, message: "Position updated successfully" };
        } catch (error) {
            throw error;
        }
    }
}

export default new TeamService();
