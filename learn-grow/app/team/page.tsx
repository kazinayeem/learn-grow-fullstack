"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Avatar, Chip, Spinner } from "@nextui-org/react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";
import { useGetAllTeamMembersQuery } from "@/redux/api/teamApi";
import { apiRequest } from "@/lib/api";

type ApprovedInstructor = {
    _id: string;
    name: string;
    role: string;
    profileImage?: string;
};

interface TeamMember {
    _id: string;
    name: string;
    role: string;
    image: string;
    linkedIn?: string;
    twitter?: string;
    bio?: string;
    showOnHome: boolean;
}

export default function TeamPage() {
    const { data: apiData, isLoading: contentLoading } = useGetSiteContentQuery("team");
    const { data: teamData, isLoading: teamLoading } = useGetAllTeamMembersQuery();
    const [approvedInstructors, setApprovedInstructors] = useState<ApprovedInstructor[] | null>(null);
    const [loadingInstructors, setLoadingInstructors] = useState<boolean>(true);

    // Use only API data - no default fallback
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : null;

    // Get team members to show on home page
    const teamMembers = (teamData?.data && Array.isArray(teamData.data))
        ? teamData.data.filter((member: TeamMember) => member.showOnHome)
        : [];

    useEffect(() => {
        let mounted = true;
        const fetchApproved = async () => {
            try {
                const res = await apiRequest.get<{ success: boolean; data?: ApprovedInstructor[] }>("/users/instructors/approved");
                if (mounted && res?.success) {
                    setApprovedInstructors(res.data || []);
                }
            } catch (_e) {
                if (mounted) setApprovedInstructors([]);
            } finally {
                if (mounted) setLoadingInstructors(false);
            }
        };
        fetchApproved();
        return () => { mounted = false; };
    }, []);

    if (contentLoading || teamLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading Team..." /></div>;
    }

    // Show message if no data available
    if (!data && teamMembers.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md">
                    <CardBody className="text-center p-8">
                        <p className="text-lg text-gray-600 mb-4">Team information is not available yet.</p>
                        <p className="text-sm text-gray-500">Please check back later or contact support.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Default hero section if data is not available
    const hero = data?.hero || { 
        tag: "Our Team", 
        title: "Meet Our Amazing Team", 
        subtitle: "Dedicated professionals committed to your success" 
    };
    const leadership = data?.leadership || [];
    const instructors = data?.instructors || [];
    const operations = data?.operations || [];

    // Show team members from database if available
    const displayTeamMembers = teamMembers.length > 0 ? teamMembers : instructors;
    
    // Group team members by role
    const membersByRole = displayTeamMembers.reduce((acc: Record<string, any[]>, member: any) => {
        const role = member.role || "Other";
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(member);
        return acc;
    }, {});
    
    // Get unique roles that have members
    const rolesWithMembers = Object.keys(membersByRole).sort();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <div
                className="text-white py-20 px-4 sm:px-6"
                style={{
                    background: 'linear-gradient(135deg, #121064 0%, #1e1b8f 50%, #2d1ba8 100%)'
                }}
            >
                <div className="container mx-auto max-w-7xl text-center">
                    <Chip className="mb-4 bg-white/10 text-white border border-white/20" variant="flat">{hero.tag}</Chip>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 break-words overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {hero.title}
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto break-words overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {hero.subtitle}
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
                {/* Leadership */}
                <div className="mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Leadership</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {leadership.map((member, index) => (
                            <Card key={index} className="shadow-lg h-full">
                                <CardBody className="p-8 text-center flex flex-col items-center h-full">
                                    <Avatar
                                        src={member.img}
                                        className="w-32 h-32 mx-auto mb-6"
                                        isBordered
                                        color="primary"
                                    />
                                    <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                                    <div className="mb-4 flex justify-center w-full">
                                        <Chip color="primary" variant="flat">
                                            {member.role}
                                        </Chip>
                                    </div>
                                    <p className="text-gray-600 mb-6 flex-grow">{member.bio}</p>
                                    <div className="flex justify-center gap-4 mt-auto">
                                        <a href={member.linkedin} className="text-blue-600 hover:text-blue-800 text-2xl">
                                            <FaLinkedin />
                                        </a>
                                        <a href={member.twitter} className="text-blue-400 hover:text-blue-600 text-2xl">
                                            <FaTwitter />
                                        </a>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Team Members from Database - Grouped by Role */}
                {rolesWithMembers.length === 0 ? (
                    <Card>
                        <CardBody className="text-center p-8">
                            <p className="text-gray-600">No team members to display yet. Please add team members from the admin panel.</p>
                        </CardBody>
                    </Card>
                ) : (
                    rolesWithMembers.map((role: string) => (
                        <div key={role} className="mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-blue-600">{role}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {membersByRole[role].map((member: any, index: number) => (
                                    <Card key={member._id || index} className="hover:shadow-lg transition-shadow h-full">
                                        <CardBody className="text-center p-6 flex flex-col items-center h-full">
                                            <Avatar
                                                src={member.image || member.img || undefined}
                                                name={member.name}
                                                className="w-24 h-24 mx-auto mb-4"
                                                isBordered
                                                color="success"
                                            />
                                            <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                                            {member.bio && <p className="text-sm text-gray-500 flex-grow">{member.bio}</p>}
                                            {(member.linkedIn || member.twitter) && (
                                                <div className="flex justify-center gap-3 mt-auto pt-4">
                                                    {member.linkedIn && (
                                                        <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                            <FaLinkedin size={18} />
                                                        </a>
                                                    )}
                                                    {member.twitter && (
                                                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                                                            <FaTwitter size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}

                {/* Operations Team */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">Operations & Support</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {operations.map((member, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardBody className="flex flex-row items-center gap-4 p-6">
                                    <Avatar
                                        src={member.img}
                                        className="w-20 h-20"
                                        isBordered
                                        color="warning"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg">{member.name}</h3>
                                        <p className="text-gray-600">{member.role}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Join Team CTA */}
                <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <CardBody className="p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Want to Join Our Team?</h2>
                        <p className="text-xl mb-8 text-purple-100">
                            We're always looking for passionate educators and tech enthusiasts.
                        </p>
                        <a
                            href="/careers"
                            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            View Open Positions →
                        </a>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
