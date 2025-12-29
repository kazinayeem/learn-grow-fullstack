"use client";

import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import QuizList from "@/components/quiz/QuizList";

interface UnifiedAssessmentViewProps {
  courseId: string;
}

export default function UnifiedAssessmentView({ courseId }: UnifiedAssessmentViewProps) {
  const [selectedTab, setSelectedTab] = useState("all");

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
            
            {/* Assignments will be added when backend is ready */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📄</span> Assignments & Projects
              </h3>
              <Card>
                <CardBody className="text-center py-8">
                  <p className="text-gray-500">No assignments or projects available yet</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Tab>

        <Tab key="quizzes" title="📝 Quizzes & Exams">
          <QuizList courseId={courseId} />
        </Tab>

        <Tab key="assignments" title="📄 Assignments & Projects">
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500">No assignments or projects available yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Your instructor will add assignments and projects here
              </p>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
