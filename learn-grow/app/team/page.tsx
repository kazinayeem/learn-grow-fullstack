"use client";

import React, { useMemo } from "react";
import { Spinner } from "@nextui-org/react";
import TeamClient from "@/components/TeamClient";
import { useGetAllTeamMembersQuery } from "@/redux/api/teamApi";

export default function TeamPage() {
    const { data: teamData, isLoading } = useGetAllTeamMembersQuery({});

    // Organize team members by role/category
    const organizedTeam = useMemo(() => {
        if (!teamData?.data || !Array.isArray(teamData.data)) {
            return { hero: {}, leadership: { cLevel: [], teamLeads: [] }, instructors: [], executives: [] };
        }

        const leadership = { cLevel: [], teamLeads: [] };
        const instructors = [];
        const executives = [];

        teamData.data.forEach((member: any) => {
            const teamMember = {
                _id: member._id,
                image: member.image,
                name: member.name,
                role: member.role,
                bio: member.bio,
                linkedIn: member.linkedIn,
                twitter: member.twitter,
                showOnHome: member.showOnHome,
            };

            // Categorize by role
            if (member.role === "CEO" || member.role === "CTO" || member.role === "COO") {
                leadership.cLevel.push(teamMember);
            } else if (member.role === "Team Lead") {
                leadership.teamLeads.push(teamMember);
            } else if (member.role === "Instructor") {
                instructors.push(teamMember);
            } else if (member.role === "Executive") {
                executives.push(teamMember);
            }
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading team members..." />
            </div>
        );
    }

    return <TeamClient content={organizedTeam} />;
}
