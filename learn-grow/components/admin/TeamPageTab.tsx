"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Divider,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { FaSave, FaUndo, FaPlus, FaTrash } from "react-icons/fa";
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from "@/redux/api/siteContentApi";
import { defaultTeamData } from "@/lib/teamData";
import toast from "react-hot-toast";

interface TeamData {
  hero: { title: string; subtitle: string; tag: string };
  leadership: {
    cLevel: Array<{ name: string; role: string; bio: string; img: string; linkedin: string; twitter: string }>;
    teamLeads: Array<{ name: string; role: string; bio: string; img: string; linkedin: string; twitter: string }>;
  };
  instructors: Array<{ name: string; role: string; specialization: string; img: string; students: number }>;
  executives: Array<{ name: string; role: string; department: string; img: string; linkedin: string }>;
}

export default function TeamPageTab() {
  const [teamData, setTeamData] = useState<TeamData>(defaultTeamData);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: apiData, isLoading } = useGetSiteContentQuery("team");
  const [updateContent] = useUpdateSiteContentMutation();

  // Load content from API
  useEffect(() => {
    if (apiData?.data?.content && typeof apiData.data.content === "object") {
      setTeamData(apiData.data.content);
      setHasChanges(false);
    }
  }, [apiData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateContent({
        page: "team",
        content: teamData,
      }).unwrap();
      toast.success("Team page updated successfully!");
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default content?")) {
      setTeamData(defaultTeamData);
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading Team page content..." color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {hasChanges && <Alert color="warning" title="You have unsaved changes" />}

      <Tabs color="primary" variant="bordered" className="w-full">
        {/* Hero Section */}
        <Tab title="Hero Section" className="w-full">
          <Card className="shadow-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 mt-4">
            <CardBody className="p-6 space-y-4">
              <Input
                label="Hero Title"
                placeholder="Enter hero title"
                value={teamData.hero.title}
                onChange={(e) => {
                  setTeamData({ ...teamData, hero: { ...teamData.hero, title: e.target.value } });
                  setHasChanges(true);
                }}
                size="lg"
                variant="bordered"
              />
              <Input
                label="Hero Tag"
                placeholder="e.g., Our Team"
                value={teamData.hero.tag}
                onChange={(e) => {
                  setTeamData({ ...teamData, hero: { ...teamData.hero, tag: e.target.value } });
                  setHasChanges(true);
                }}
                size="lg"
                variant="bordered"
              />
              <Textarea
                label="Hero Subtitle"
                placeholder="Enter hero subtitle"
                value={teamData.hero.subtitle}
                onChange={(e) => {
                  setTeamData({ ...teamData, hero: { ...teamData.hero, subtitle: e.target.value } });
                  setHasChanges(true);
                }}
                minRows={3}
                variant="bordered"
              />
            </CardBody>
          </Card>
        </Tab>

        {/* Leadership Section - C-Level */}
        <Tab title="Leadership - C-Level" className="w-full">
          <Card className="shadow-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 mt-4">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-700">Executive Leadership (CEO, CTO, COO)</h3>
                <Button
                  isIconOnly
                  color="success"
                  variant="flat"
                  onPress={() => {
                    setTeamData({
                      ...teamData,
                      leadership: {
                        ...teamData.leadership,
                        cLevel: [...teamData.leadership.cLevel, { name: "", role: "", bio: "", img: "", linkedin: "", twitter: "" }],
                      },
                    });
                    setHasChanges(true);
                  }}
                >
                  <FaPlus />
                </Button>
              </div>
              <div className="space-y-4">
                {teamData.leadership.cLevel.map((member, index) => (
                  <MemberCard
                    key={index}
                    member={member}
                    index={index}
                    type="cLevel"
                    onUpdate={(updated) => {
                      const newCLevel = [...teamData.leadership.cLevel];
                      newCLevel[index] = updated;
                      setTeamData({
                        ...teamData,
                        leadership: { ...teamData.leadership, cLevel: newCLevel },
                      });
                      setHasChanges(true);
                    }}
                    onDelete={() => {
                      const newCLevel = teamData.leadership.cLevel.filter((_, i) => i !== index);
                      setTeamData({
                        ...teamData,
                        leadership: { ...teamData.leadership, cLevel: newCLevel },
                      });
                      setHasChanges(true);
                    }}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Leadership Section - Team Leads */}
        <Tab title="Leadership - Team Leads" className="w-full">
          <Card className="shadow-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 mt-4">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-700">Team Leads</h3>
                <Button
                  isIconOnly
                  color="success"
                  variant="flat"
                  onPress={() => {
                    setTeamData({
                      ...teamData,
                      leadership: {
                        ...teamData.leadership,
                        teamLeads: [...teamData.leadership.teamLeads, { name: "", role: "", bio: "", img: "", linkedin: "", twitter: "" }],
                      },
                    });
                    setHasChanges(true);
                  }}
                >
                  <FaPlus />
                </Button>
              </div>
              <div className="space-y-4">
                {teamData.leadership.teamLeads.map((member, index) => (
                  <MemberCard
                    key={index}
                    member={member}
                    index={index}
                    type="teamLeads"
                    onUpdate={(updated) => {
                      const newTeamLeads = [...teamData.leadership.teamLeads];
                      newTeamLeads[index] = updated;
                      setTeamData({
                        ...teamData,
                        leadership: { ...teamData.leadership, teamLeads: newTeamLeads },
                      });
                      setHasChanges(true);
                    }}
                    onDelete={() => {
                      const newTeamLeads = teamData.leadership.teamLeads.filter((_, i) => i !== index);
                      setTeamData({
                        ...teamData,
                        leadership: { ...teamData.leadership, teamLeads: newTeamLeads },
                      });
                      setHasChanges(true);
                    }}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Instructors Section */}
        <Tab title="Instructors" className="w-full">
          <Card className="shadow-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mt-4">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-700">Instructors</h3>
                <Button
                  isIconOnly
                  color="success"
                  variant="flat"
                  onPress={() => {
                    setTeamData({
                      ...teamData,
                      instructors: [...teamData.instructors, { name: "", role: "", specialization: "", img: "", students: 0 }],
                    });
                    setHasChanges(true);
                  }}
                >
                  <FaPlus />
                </Button>
              </div>
              <div className="space-y-4">
                {teamData.instructors.map((instructor, index) => (
                  <InstructorCard
                    key={index}
                    instructor={instructor}
                    index={index}
                    onUpdate={(updated) => {
                      const newInstructors = [...teamData.instructors];
                      newInstructors[index] = updated;
                      setTeamData({ ...teamData, instructors: newInstructors });
                      setHasChanges(true);
                    }}
                    onDelete={() => {
                      const newInstructors = teamData.instructors.filter((_, i) => i !== index);
                      setTeamData({ ...teamData, instructors: newInstructors });
                      setHasChanges(true);
                    }}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Executives Section */}
        <Tab title="Executives" className="w-full">
          <Card className="shadow-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 mt-4">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-orange-700">Executives</h3>
                <Button
                  isIconOnly
                  color="success"
                  variant="flat"
                  onPress={() => {
                    setTeamData({
                      ...teamData,
                      executives: [...teamData.executives, { name: "", role: "", department: "", img: "", linkedin: "" }],
                    });
                    setHasChanges(true);
                  }}
                >
                  <FaPlus />
                </Button>
              </div>
              <div className="space-y-4">
                {teamData.executives.map((executive, index) => (
                  <ExecutiveCard
                    key={index}
                    executive={executive}
                    index={index}
                    onUpdate={(updated) => {
                      const newExecutives = [...teamData.executives];
                      newExecutives[index] = updated;
                      setTeamData({ ...teamData, executives: newExecutives });
                      setHasChanges(true);
                    }}
                    onDelete={() => {
                      const newExecutives = teamData.executives.filter((_, i) => i !== index);
                      setTeamData({ ...teamData, executives: newExecutives });
                      setHasChanges(true);
                    }}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <Divider />

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <Button
          color="warning"
          variant="flat"
          startContent={<FaUndo />}
          onPress={handleReset}
          size="lg"
          className="min-h-[44px] font-semibold"
        >
          Reset to Default
        </Button>
        <Button
          color="success"
          startContent={<FaSave />}
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={!hasChanges || isSaving}
          size="lg"
          className="flex-1 min-h-[44px] font-semibold"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// Helper Components
function MemberCard({ member, index, type, onUpdate, onDelete }: any) {
  return (
    <Card className="bg-white border border-gray-200">
      <CardBody className="p-4 space-y-3">
        <Input
          label="Name"
          placeholder="Full Name"
          value={member.name}
          onChange={(e) => onUpdate({ ...member, name: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Role"
          placeholder="e.g., CEO, Technical Lead"
          value={member.role}
          onChange={(e) => onUpdate({ ...member, role: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Textarea
          label="Bio"
          placeholder="Brief biography"
          value={member.bio}
          onChange={(e) => onUpdate({ ...member, bio: e.target.value })}
          minRows={2}
          variant="bordered"
        />
        <Input
          label="Image URL"
          placeholder="https://example.com/image.jpg"
          value={member.img}
          onChange={(e) => onUpdate({ ...member, img: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="LinkedIn URL"
          placeholder="https://linkedin.com/..."
          value={member.linkedin}
          onChange={(e) => onUpdate({ ...member, linkedin: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Twitter URL"
          placeholder="https://twitter.com/..."
          value={member.twitter}
          onChange={(e) => onUpdate({ ...member, twitter: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Button color="danger" variant="flat" startContent={<FaTrash />} onPress={onDelete} size="sm">
          Delete
        </Button>
      </CardBody>
    </Card>
  );
}

function InstructorCard({ instructor, index, onUpdate, onDelete }: any) {
  return (
    <Card className="bg-white border border-gray-200">
      <CardBody className="p-4 space-y-3">
        <Input
          label="Name"
          placeholder="Full Name"
          value={instructor.name}
          onChange={(e) => onUpdate({ ...instructor, name: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Role"
          placeholder="e.g., Senior Instructor"
          value={instructor.role}
          onChange={(e) => onUpdate({ ...instructor, role: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Specialization"
          placeholder="e.g., Python, JavaScript, React"
          value={instructor.specialization}
          onChange={(e) => onUpdate({ ...instructor, specialization: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Image URL"
          placeholder="https://example.com/image.jpg"
          value={instructor.img}
          onChange={(e) => onUpdate({ ...instructor, img: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          type="number"
          label="Students Taught"
          placeholder="500"
          value={String(instructor.students)}
          onChange={(e) => onUpdate({ ...instructor, students: parseInt(e.target.value) || 0 })}
          size="sm"
          variant="bordered"
        />
        <Button color="danger" variant="flat" startContent={<FaTrash />} onPress={onDelete} size="sm">
          Delete
        </Button>
      </CardBody>
    </Card>
  );
}

function ExecutiveCard({ executive, index, onUpdate, onDelete }: any) {
  return (
    <Card className="bg-white border border-gray-200">
      <CardBody className="p-4 space-y-3">
        <Input
          label="Name"
          placeholder="Full Name"
          value={executive.name}
          onChange={(e) => onUpdate({ ...executive, name: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Role"
          placeholder="e.g., Head of Student Success"
          value={executive.role}
          onChange={(e) => onUpdate({ ...executive, role: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Department"
          placeholder="e.g., Student Services"
          value={executive.department}
          onChange={(e) => onUpdate({ ...executive, department: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="Image URL"
          placeholder="https://example.com/image.jpg"
          value={executive.img}
          onChange={(e) => onUpdate({ ...executive, img: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Input
          label="LinkedIn URL"
          placeholder="https://linkedin.com/..."
          value={executive.linkedin}
          onChange={(e) => onUpdate({ ...executive, linkedin: e.target.value })}
          size="sm"
          variant="bordered"
        />
        <Button color="danger" variant="flat" startContent={<FaTrash />} onPress={onDelete} size="sm">
          Delete
        </Button>
      </CardBody>
    </Card>
  );
}
