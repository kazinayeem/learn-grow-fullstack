"use client";

import React, { useMemo } from "react";
import { Spinner } from "@nextui-org/react";
import TeamClient from "@/components/TeamClient";
import { useGetAllTeamMembersQuery, useGetAllRolesQuery } from "@/redux/api/teamApi";

export default function TeamPage() {
    const { data: teamData, isLoading: teamLoading } = useGetAllTeamMembersQuery({});
    const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery({});

    // Organize team members by role/category
    const organizedTeam = useMemo(() => {
        if (!teamData?.data || !Array.isArray(teamData.data)) {
            return { hero: {}, leadership: { cLevel: [], teamLeads: [] }, instructors: [], executives: [] };
        }

        const leadership = { cLevel: [], teamLeads: [] };
        const instructors = [];
        const executives = [];

        // Sort members by position
        const sortedMembers = [...teamData.data].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

        sortedMembers.forEach((member: any) => {
            const teamMember = {
                _id: member._id,
                image: member.image,
                name: member.name,
                role: member.role,
                bio: member.bio,
                linkedIn: member.linkedIn,
                twitter: member.twitter,
                showOnHome: member.showOnHome,
                position: member.position,
            };

            const roleLower = (member.role || "").toLowerCase();

            // Categorize by role keywords
            // Line 1: C-Level Executives (CEO, CTO, COO, CFO, etc.)
            if (roleLower.includes("ceo") || roleLower.includes("cto") || roleLower.includes("coo") || 
                roleLower.includes("cfo") || roleLower.includes("founder")) {
                leadership.cLevel.push(teamMember);
            }
            // Line 2: Team Leads & Managers (Operations Manager, Technical Lead, Marketing Head, etc.)
            else if (roleLower.includes("manager") || roleLower.includes("lead") || 
                     roleLower.includes("head") || roleLower.includes("director")) {
                leadership.teamLeads.push(teamMember);
            }
            // Section 2: Instructors
            else if (roleLower.includes("instructor") || roleLower.includes("teacher") || 
                     roleLower.includes("educator") || roleLower.includes("trainer")) {
                instructors.push(teamMember);
            }
            // Section 3: Executives & Other Roles
            else {
                executives.push(teamMember);
            }
        });

        // Sort C-Level: CEO roles first, then CTO, then COO
        leadership.cLevel.sort((a: any, b: any) => {
            const aRole = (a.role || "").toLowerCase();
            const bRole = (b.role || "").toLowerCase();
            
            // CEO priority (1)
            if (aRole.includes("ceo") && !bRole.includes("ceo")) return -1;
            if (!aRole.includes("ceo") && bRole.includes("ceo")) return 1;
            
            // CTO priority (2)
            if (aRole.includes("cto") && !bRole.includes("cto")) return -1;
            if (!aRole.includes("cto") && bRole.includes("cto")) return 1;
            
            // COO priority (3)
            if (aRole.includes("coo") && !bRole.includes("coo")) return -1;
            if (!aRole.includes("coo") && bRole.includes("coo")) return 1;
            
            // Others (CFO, Founder, etc.)
            return 0;
        });

        return {
            hero: {
                tag: "Our Team",
                title: "Meet Our Experts",
                subtitle: "A talented team dedicated to transforming education",
            },
            leadership,
            instructors,
            executives,
        };
    }, [teamData]);

    if (teamLoading || rolesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading team members..." />
            </div>
        );
    }

    return <TeamClient content={organizedTeam} />;
}
