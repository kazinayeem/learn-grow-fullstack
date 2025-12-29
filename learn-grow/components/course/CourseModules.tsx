/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
    Card,
    CardBody,
    Button,
    Accordion,
    AccordionItem,
    Chip,
    Progress,
} from "@nextui-org/react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateLectureProgress } from "@/redux/slices/courseContentSlice";

interface LessonFromApi {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    orderIndex?: number;
    isFreePreview?: boolean;
    isPreview?: boolean;
    duration?: number;
    type?: string;
    contentUrl?: string;
    isPublished?: boolean;
}

interface ModuleFromApi {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    lessons?: LessonFromApi[];
    orderIndex?: number;
    isPublished?: boolean;
}

interface CourseModulesProps {
    courseId: string;
    isEnrolled: boolean;
    modulesFromApi?: ModuleFromApi[];
}

export default function CourseModules({ courseId, isEnrolled, modulesFromApi }: CourseModulesProps) {
    // const router = useRouter();
    const dispatch = useDispatch();
    // Prefer API modules (with lessons) when provided; fallback to redux mock data
    const modules = modulesFromApi && modulesFromApi.length > 0
        ? modulesFromApi
            .map((m, idx) => ({
                id: m._id || m.id || `module-${idx}`,
                title: m.title,
                description: m.description,
                order: m.orderIndex ?? idx,
                isPublished: m.isPublished,
                lectures: (m.lessons || []).map((l, lIdx) => ({
                    id: l._id || l.id || `lesson-${idx}-${lIdx}`,
                    title: l.title,
                    description: l.description,
                    order: l.orderIndex ?? lIdx,
                    isPreview: l.isFreePreview ?? l.isPreview ?? false,
                    duration: l.duration || 5,
                    type: l.type,
                    contentUrl: l.contentUrl,
                    isPublished: l.isPublished,
                })),
            }))
            .sort((a, b) => a.order - b.order)
        : useSelector((state: RootState) =>
            state.courseContent.modules
                .filter((m) => m.courseId === courseId)
                .sort((a, b) => a.order - b.order)
        );

    const lectureProgress = useSelector((state: RootState) => state.courseContent.lectureProgress);
    const userId = typeof window !== "undefined" && localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!)._id
        : null;

    const getLectureProgress = (lectureId: string) => {
        return lectureProgress.find((p) => p.lectureId === lectureId && p.userId === userId);
    };

    const getModuleProgress = (moduleId: string) => {
        const moduleLectures = modules.find((m) => m.id === moduleId)?.lectures || [];
        if (moduleLectures.length === 0) return 0;

        const completedCount = moduleLectures.filter((lecture) => {
            const progress = getLectureProgress(lecture.id);
            return progress?.completed;
        }).length;

        return Math.round((completedCount / moduleLectures.length) * 100);
    };

    const handleWatchLecture = (lecture: any, moduleId: string) => {
        if (!isEnrolled && !lecture.isPreview) {
            alert("Please enroll in this course to watch this lecture");
            return;
        }

        const targetUrl = lecture.contentUrl || lecture.videoUrl;
        if (targetUrl) {
            window.open(targetUrl, "_blank");
        } else {
            alert("No content URL provided for this lesson");
            return;
        }

        const totalDurationSeconds = (lecture.duration || 1) * 60;

        const progress = {
            id: `PROG-${Date.now()}`,
            userId: userId || "guest",
            lectureId: lecture.id,
            moduleId,
            courseId,
            watchedDuration: 0,
            totalDuration: totalDurationSeconds,
            completed: false,
            lastWatchedAt: new Date().toISOString(),
        };

        dispatch(updateLectureProgress(progress));
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes || Number.isNaN(minutes)) return "-";
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    if (modules.length === 0) {
        return (
            <Card>
                <CardBody className="text-center py-8">
                    <p className="text-default-500">No course content available yet.</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="text-sm text-default-500">
                    {modules.length} Module{modules.length > 1 ? "s" : ""} •{" "}
                    {modules.reduce((acc, m) => acc + m.lectures.length, 0)} Lectures
                </div>
            </div>

            <Accordion variant="splitted">
                {modules.map((module) => {
                    const moduleProgress = getModuleProgress(module.id);
                    const totalDuration = module.lectures.reduce((acc, l) => acc + (l.duration || 0), 0);

                    return (
                        <AccordionItem
                            key={module.id}
                            aria-label={module.title}
                            title={
                                <div className="flex justify-between items-center w-full pr-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{module.title}</h3>
                                        <p className="text-sm text-default-500">{module.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Chip size="sm" variant="flat">
                                            {module.lectures.length} Lectures
                                        </Chip>
                                        <Chip size="sm" variant="flat">
                                            {formatDuration(totalDuration)}
                                        </Chip>
                                        {moduleProgress > 0 && (
                                            <Chip color="success" size="sm" variant="flat">
                                                {moduleProgress}%
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            }
                        >
                            <div className="space-y-2 pb-4">
                                {module.lectures
                                    .sort((a, b) => a.order - b.order)
                                    .map((lecture) => {
                                        const progress = getLectureProgress(lecture.id);
                                        const isCompleted = progress?.completed || false;
                                        const canWatch = isEnrolled || lecture.isPreview;

                                        return (
                                            <Card
                                                key={lecture.id}
                                                isPressable={canWatch}
                                                className={`${!canWatch ? "opacity-60" : ""} hover:shadow-md transition-shadow`}
                                            >
                                                <CardBody>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold">{lecture.title}</h4>
                                                                {lecture.isPreview && (
                                                                    <Chip size="sm" color="primary" variant="flat">
                                                                        Preview
                                                                    </Chip>
                                                                )}
                                                                {isCompleted && (
                                                                    <Chip size="sm" color="success" variant="flat">
                                                                        ✓ Completed
                                                                    </Chip>
                                                                )}
                                                                {('isPublished' in lecture && (lecture as any).isPublished === false) && (
                                                                    <Chip size="sm" color="warning" variant="flat">
                                                                        Draft
                                                                    </Chip>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-default-600 mb-2">
                                                                {lecture.description}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs text-default-500">
                                                                <span>{('type' in lecture && (lecture as any).type) ? (lecture as any).type.toUpperCase() : "CONTENT"}</span>
                                                                <span>⏱️ {formatDuration(lecture.duration)}</span>
                                                            </div>
                                                            {progress && !isCompleted && (
                                                                <Progress
                                                                    value={(progress.watchedDuration / progress.totalDuration) * 100}
                                                                    size="sm"
                                                                    className="mt-2"
                                                                    color="primary"
                                                                />
                                                            )}
                                                        </div>
                                                        {/* Avoid nested button: use a div styled as a button if Card isPressable */}
                                                        {canWatch ? (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${isCompleted ? "bg-success text-white" : "bg-primary text-white"} ${!canWatch ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                                                onClick={() => handleWatchLecture(lecture, module.id)}
                                                                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleWatchLecture(lecture, module.id); }}
                                                                aria-disabled={!canWatch}
                                                            >
                                                                {isCompleted ? "Rewatch" : canWatch ? "Watch" : "🔒 Locked"}
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                color={isCompleted ? "success" : "primary"}
                                                                variant={canWatch ? "solid" : "flat"}
                                                                isDisabled={!canWatch}
                                                            >
                                                                {isCompleted ? "Rewatch" : canWatch ? "Watch" : "🔒 Locked"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
                            </div>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
