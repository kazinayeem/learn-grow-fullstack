import { Role, IRole } from "../model/role.model";
import { TeamMember } from "../model/team.model";

class RoleService {
    // Get all roles
    async getAllRoles() {
        try {
            const roles = await Role.find({ isActive: true }).sort({ position: 1 });
            return { success: true, data: roles };
        } catch (error) {
            throw error;
        }
    }

    // Get single role
    async getRoleById(id: string) {
        try {
            const role = await Role.findById(id);
            if (!role) {
                return { success: false, message: "Role not found" };
            }
            return { success: true, data: role };
        } catch (error) {
            throw error;
        }
    }

    // Create role
    async createRole(data: { name: string }) {
        try {
            // Check if role already exists
            const existingRole = await Role.findOne({ name: data.name });
            if (existingRole) {
                return { success: false, message: "Role already exists" };
            }

            // Get the highest position and add 1
            const highestPositionRole = await Role.findOne().sort({ position: -1 });
            const position = highestPositionRole ? highestPositionRole.position + 1 : 1;

            const newRole = new Role({
                name: data.name,
                position,
                isActive: true,
            });

            await newRole.save();
            return { success: true, data: newRole, message: "Role created successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Update role
    async updateRole(id: string, data: Partial<IRole>) {
        try {
            const role = await Role.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            });

            if (!role) {
                return { success: false, message: "Role not found" };
            }

            return { success: true, data: role, message: "Role updated successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Reorder roles (bulk position update)
    async reorderRoles(roleOrders: { id: string; position: number }[]) {
        try {
            const updatePromises = roleOrders.map((order) =>
                Role.findByIdAndUpdate(order.id, { position: order.position }, { new: true })
            );

            await Promise.all(updatePromises);

            const updatedRoles = await Role.find({ isActive: true }).sort({ position: 1 });
            return { success: true, data: updatedRoles, message: "Roles reordered successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Delete role (soft delete - mark as inactive)
    async deleteRole(id: string) {
        try {
            // Check if any team members use this role
            const membersWithRole = await TeamMember.countDocuments({ role: id });
            if (membersWithRole > 0) {
                return {
                    success: false,
                    message: `Cannot delete role. ${membersWithRole} team member(s) are assigned to this role.`,
                };
            }

            const role = await Role.findByIdAndUpdate(
                id,
                { isActive: false },
                { new: true }
            );

            if (!role) {
                return { success: false, message: "Role not found" };
            }

            return { success: true, message: "Role deleted successfully" };
        } catch (error) {
            throw error;
        }
    }

    // Seed default roles
    async seedDefaultRoles() {
        try {
            const defaultRoles = [
                { name: "Founder & CEO", position: 1 },
                { name: "Co-Founder", position: 2 },
                { name: "Head of Content", position: 3 },
                { name: "Lead Instructor", position: 4 },
                { name: "Senior Instructor", position: 5 },
                { name: "Instructor", position: 6 },
                { name: "Course Developer", position: 7 },
                { name: "Technical Lead", position: 8 },
                { name: "Operations Manager", position: 9 },
                { name: "Support Manager", position: 10 },
            ];

            const existingRoles = await Role.countDocuments();
            if (existingRoles === 0) {
                await Role.insertMany(defaultRoles);
                return { success: true, message: "Default roles seeded successfully" };
            }

            return { success: true, message: "Roles already exist" };
        } catch (error) {
            throw error;
        }
    }
}

export default new RoleService();
