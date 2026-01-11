"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Avatar,
    Chip,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Image,
} from "@nextui-org/react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";
import { useGetAllTeamMembersQuery, useGetAllRolesQuery } from "@/redux/api/teamApi";
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
    position: number;
}

// Team Member Card Component - Compact Design
function TeamMemberCard({ member, onViewMore }: { member: any; onViewMore: (member: any) => void }) {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            className="cursor-pointer"
            onClick={() => onViewMore(member)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card
                className={`
                    bg-white overflow-hidden rounded-2xl
                    border border-gray-200 
                    transition-all duration-300 ease-out
                    shadow-md
                    ${isHovered 
                        ? 'shadow-lg scale-105 border-blue-300' 
                        : 'hover:shadow-md'
                    }
                `}
            >
                {/* Header Background with Gradient */}
                <div className={`
                    h-24 bg-gradient-to-br from-blue-500 to-purple-600
                    relative overflow-hidden transition-all duration-300
                `}>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full -mr-12 -mt-12"></div>
                </div>

                {/* Profile Image - Overlaid */}
                <div className="px-4 pb-3 flex justify-center -mt-12 relative z-10">
                    <div className={`
                        transition-all duration-300
                        ${isHovered ? 'scale-110' : 'scale-100'}
                    `}>
                        {member.image && member.image !== "placeholder" ? (
                            <Image
                                src={
                                    member.image.startsWith("http")
                                        ? member.image
                                        : `data:image/jpeg;base64,${member.image}`
                                }
                                alt={member.name}
                                width={80}
                                height={80}
                                className="rounded-full border-4 border-white shadow-lg object-cover w-20 h-20"
                            />
                        ) : (
                            <Avatar
                                name={member.name}
                                className="w-20 h-20 border-4 border-white shadow-lg text-sm"
                                color="primary"
                            />
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <CardBody className="px-4 py-3 text-center flex flex-col items-center gap-2">
                    {/* Name */}
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                        {member.name}
                    </h3>

                    {/* Role Badge */}
                    <div className="
                        bg-gradient-to-r from-blue-100 to-blue-200 
                        text-blue-800 
                        px-3 py-0.5 
                        rounded-full 
                        text-xs 
                        font-semibold 
                        uppercase 
                        tracking-wider
                        border border-blue-300
                    ">
                        {member.role}
                    </div>

                    {/* Social Links - Compact */}
                    {(member.linkedIn || member.twitter) && (
                        <div className="flex gap-2 justify-center pt-1">
                            {member.linkedIn && (
                                <a
                                    href={member.linkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        flex items-center justify-center
                                        w-8 h-8
                                        rounded-full
                                        bg-gray-200
                                        text-gray-700
                                        transition-all duration-300
                                        hover:bg-blue-600 hover:text-white hover:scale-110
                                    "
                                    onClick={(e) => e.stopPropagation()}
                                    title="LinkedIn"
                                >
                                    <FaLinkedin size={14} />
                                </a>
                            )}
                            {member.twitter && (
                                <a
                                    href={member.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        flex items-center justify-center
                                        w-8 h-8
                                        rounded-full
                                        bg-gray-200
                                        text-gray-700
                                        transition-all duration-300
                                        hover:bg-sky-500 hover:text-white hover:scale-110
                                    "
                                    onClick={(e) => e.stopPropagation()}
                                    title="Twitter"
                                >
                                    <FaTwitter size={14} />
                                </a>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default function TeamPage() {
    const { data: apiData, isLoading: contentLoading } = useGetSiteContentQuery("team");
    const { data: teamData, isLoading: teamLoading } = useGetAllTeamMembersQuery();
    const { data: rolesData } = useGetAllRolesQuery();
    const [approvedInstructors, setApprovedInstructors] = useState<ApprovedInstructor[] | null>(null);
    const [loadingInstructors, setLoadingInstructors] = useState<boolean>(true);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use only API data - no default fallback
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : null;

    // Get team members to show on home page, sorted by role position and member position
    const roles = rolesData?.data || [];
    const getRolePosition = (roleName: string) => {
        const role = roles.find((r: any) => r.name === roleName);
        return role?.position || 999; // Put unknown roles at the end
    };

    const teamMembers = (teamData?.data && Array.isArray(teamData.data))
        ? teamData.data
            .filter((member: TeamMember) => member.showOnHome)
            .sort((a: TeamMember, b: TeamMember) => {
                // Sort by role position first, then by member position within role
                const rolePositionA = getRolePosition(a.role);
                const rolePositionB = getRolePosition(b.role);
                
                if (rolePositionA !== rolePositionB) {
                    return rolePositionA - rolePositionB;
                }
                return (a.position || 0) - (b.position || 0);
            })
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
    
    // Get unique roles that have members, sorted by role position
    const rolesWithMembers = Object.keys(membersByRole).sort((a, b) => {
        const posA = getRolePosition(a);
        const posB = getRolePosition(b);
        return posA - posB;
    });

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
                            <Card key={index} className="shadow-lg h-full hover:shadow-xl transition-shadow">
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
                            <div className="mt-10 flex justify-center">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                    {membersByRole[role].map((member: any, index: number) => (
                                        <TeamMemberCard
                                            key={member._id || index}
                                            member={member}
                                            onViewMore={(member) => {
                                                setSelectedMember(member);
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
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

            {/* Member Detail Modal - Premium Design */}
            <Modal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                size="md"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    backdrop: "bg-black/40 backdrop-opacity-40",
                    wrapper: "z-50",
                    base: "bg-white rounded-3xl overflow-hidden",
                    closeButton: "text-gray-500 hover:text-gray-700 transition-colors",
                }}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                ease: "easeOut",
                            },
                        },
                        exit: {
                            y: 50,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn",
                            },
                        },
                    },
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            {/* Modal Header with Gradient */}
                            <div className="bg-gradient-to-br from-blue-500 via-blue-400 to-purple-500 pt-8 pb-16 px-6 relative overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 mb-0"></div>
                            </div>

                            {/* Profile Section - Overlaid on Header */}
                            <div className="px-6 pb-6 -mt-12 relative z-10 flex flex-col items-center text-center">
                                {selectedMember?.image && selectedMember.image !== "placeholder" ? (
                                    <Image
                                        src={
                                            selectedMember.image.startsWith("http")
                                                ? selectedMember.image
                                                : `data:image/jpeg;base64,${selectedMember.image}`
                                        }
                                        alt={selectedMember?.name}
                                        width={120}
                                        height={120}
                                        className="rounded-full border-4 border-white shadow-2xl object-cover w-32 h-32 mb-4"
                                    />
                                ) : (
                                    <Avatar
                                        name={selectedMember?.name}
                                        className="w-32 h-32 border-4 border-white shadow-2xl mb-4 text-lg"
                                        color="primary"
                                    />
                                )}
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedMember?.name}</h2>
                                <div className="
                                    bg-gradient-to-r from-blue-50 to-blue-100 
                                    text-blue-700 
                                    px-4 py-2 
                                    rounded-full 
                                    text-sm 
                                    font-bold 
                                    uppercase 
                                    tracking-wide
                                    border border-blue-200
                                ">
                                    {selectedMember?.role}
                                </div>
                            </div>

                            <ModalBody className="py-6 px-6">
                                <div className="space-y-6">
                                    {/* Bio / About */}
                                    {selectedMember?.bio && (
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                About
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                {selectedMember.bio}
                                            </p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                                    {/* Social Links - Premium Style */}
                                    {(selectedMember?.linkedIn || selectedMember?.twitter) && (
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                Connect
                                            </h3>
                                            <div className="flex gap-3 flex-wrap">
                                                {selectedMember.linkedIn && (
                                                    <a
                                                        href={selectedMember.linkedIn}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-sm border border-blue-200 hover:border-blue-600"
                                                    >
                                                        <FaLinkedin size={18} />
                                                        LinkedIn
                                                    </a>
                                                )}
                                                {selectedMember.twitter && (
                                                    <a
                                                        href={selectedMember.twitter}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-500 hover:text-white transition-all duration-300 font-semibold text-sm border border-sky-200 hover:border-sky-500"
                                                    >
                                                        <FaTwitter size={18} />
                                                        Twitter
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ModalBody>

                            <ModalFooter className="bg-gray-50 border-t border-gray-200 py-4">
                                <Button 
                                    onPress={onClose} 
                                    className="
                                        bg-gradient-to-r from-blue-600 to-blue-700
                                        text-white
                                        font-semibold
                                        rounded-lg
                                        px-6
                                        hover:from-blue-700 hover:to-blue-800
                                        transition-all duration-300
                                    "
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
