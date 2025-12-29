"use client";

import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab, Button, Chip } from "@nextui-org/react";
import QuizList from "@/components/quiz/QuizList";
import { useGetAssignmentsByCourseQuery } from "@/redux/api/assignmentApi";
import { FaFileAlt, FaCalendarAlt, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface UnifiedAssessmentViewProps {
  courseId: string;
}

export default function UnifiedAssessmentView({ courseId }: UnifiedAssessmentViewProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const router = useRouter();
  
  // Fetch assignments for this course
  const { data: assignmentsResp, isLoading: assignmentsLoading } = useGetAssignmentsByCourseQuery(courseId);
  const assignments = assignmentsResp?.data || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case "assignment":
        return "Assignment";
      case "project":
        return "Project";
      default:
        return "Task";
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case "assignment":
        return "primary";
      case "project":
        return "success";
      default:
        return "default";
    }
  };

  const AssignmentsList = () => {
    if (assignmentsLoading) {
      return (
        <Card>
          <CardBody className="text-center py-8">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading assignments...</p>
          </CardBody>
        </Card>
      );
    }

    if (assignments.length === 0) {
      return (
        <Card>
          <CardBody className="text-center py-12">
            <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No assignments or projects available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Your instructor will add assignments and projects here
            </p>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {assignments.map((assignment: any) => (
          <Card 
            key={assignment._id} 
            className="hover:shadow-lg transition-shadow"
          >
            <CardBody className="p-4">
              <div className="flex items-start justify-between">
                <div 
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                  onClick={() => router.push(`/assignment/${assignment._id}`)}
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaFileAlt className="text-2xl text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">{assignment.title}</h4>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color={getAssignmentTypeColor(assignment.assessmentType) as any}
                      >
                        {getAssignmentTypeLabel(assignment.assessmentType)}
                      </Chip>
                      <Chip 
                        size="sm" 
                        variant="dot" 
                        color={assignment.status === "published" ? "success" : "warning"}
                      >
                        {assignment.status}
                      </Chip>
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {assignment.dueDate && (
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                      )}
                      {assignment.maxScore && (
                        <div className="flex items-center gap-1">
                          <span>📊</span>
                          <span>Max Score: {assignment.maxScore}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  color="primary" 
                  size="sm"
                  onPress={() => router.push(`/assignment/${assignment._id}`)}
                >
                  View Details
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        color="primary"
        variant="underlined"
        className="mb-4"
      >
        <Tab key="all" title="📚 All Assessments">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📝</span> Quizzes & Exams
              </h3>
              <QuizList courseId={courseId} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📄</span> Assignments & Projects
              </h3>
              <AssignmentsList />
            </div>
          </div>
        </Tab>

        <Tab key="quizzes" title="📝 Quizzes & Exams">
          <QuizList courseId={courseId} />
        </Tab>

        <Tab key="assignments" title="📄 Assignments & Projects">
          <AssignmentsList />
        </Tab>
      </Tabs>
    </div>
  );
}
