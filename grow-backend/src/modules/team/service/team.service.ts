import { TeamMember, ITeamMember } from "../model/team.model";
import { User } from "../../user/model/user.model";

class TeamService {
    // Get all team members
    async getAllTeamMembers() {
        try {
            const members = await TeamMember.find().sort({ createdAt: -1 });
            return { success: true, data: members };
        } catch (error) {
            throw error;
        }
    }

    // Get team members to display on home (showOnHome = true)
    async getHomeTeamMembers() {
        try {
            const members = await TeamMember.find({ showOnHome: true }).sort({ createdAt: -1 });
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
            // No need to calculate image size for URLs
            // Set imageSize to 0 for backward compatibility
            const imageSize = 0;

            const newMember = new TeamMember({
                ...data,
                imageSize,
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
            // If image is being updated, validate size
            if (data.image) {
                const imageSize = Buffer.byteLength(data.image, "utf8");
                if (imageSize > 1048576) {
                    return { success: false, message: "Image size must not exceed 1MB" };
                }
                data.imageSize = imageSize;
            }

            const member = await TeamMember.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            });

            if (!member) {
                return { success: false, message: "Team member not found" };
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
            const member = await TeamMember.findByIdAndDelete(id);

            if (!member) {
                return { success: false, message: "Team member not found" };
            }

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
                
                // Handle image - use placeholder if no image
                let imageData = instructor.profileImage || "";
                let imageSize = 0;
                
                if (imageData) {
                    // Remove data URI prefix if present
                    if (imageData.startsWith('data:')) {
                        imageData = imageData.split(',')[1] || imageData;
                    }
                    imageSize = Buffer.byteLength(imageData, "utf8");
                    
                    // Skip if image is too large (>1MB)
                    if (imageSize > 1048576) {
                        console.warn(`Image for ${instructor.name} exceeds 1MB, skipping`);
                        continue;
                    }
                }
                
                // Create team member (even if no image)
                const newMember = new TeamMember({
                    name: instructor.name,
                    role: "Instructor",
                    image: imageData || "placeholder", // Use placeholder if no image
                    imageSize: imageSize,
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
}

export default new TeamService();
