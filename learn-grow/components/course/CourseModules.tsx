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
    hasAccess?: boolean;
}

export default function CourseModules({ courseId, isEnrolled, modulesFromApi, hasAccess = false }: CourseModulesProps) {
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
        if (!hasAccess && !lecture.isPreview) {
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
                            <div className="space-y-3 pb-4">
                                {module.lectures
                                    .sort((a, b) => a.order - b.order)
                                    .map((lecture) => {
                                        const progress = getLectureProgress(lecture.id);
                                        const isCompleted = progress?.completed || false;
                                        const canWatch = hasAccess || lecture.isPreview;
                                        const isLocked = !canWatch;

                                        return (
                                            <div
                                                key={lecture.id}
                                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                                    isLocked 
                                                        ? "bg-gray-50 border-gray-200" 
                                                        : "bg-white border-gray-200 hover:border-primary hover:shadow-md cursor-pointer"
                                                }`}
                                                onClick={() => canWatch && handleWatchLecture(lecture, module.id)}
                                            >
                                                {/* Lock Icon or Status Icon */}
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                    isLocked 
                                                        ? "bg-gray-200" 
                                                        : isCompleted 
                                                            ? "bg-success-100" 
                                                            : "bg-primary-100"
                                                }`}>
                                                    {isLocked ? (
                                                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : isCompleted ? (
                                                        <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Lesson Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-semibold text-base ${isLocked ? "text-gray-500" : "text-gray-900"}`}>
                                                            {lecture.title}
                                                        </h4>
                                                        {lecture.isPreview && (
                                                            <Chip size="sm" color="primary" variant="flat">
                                                                Preview
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    
                                                    {lecture.description && (
                                                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                                            {lecture.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className={`flex items-center gap-1 ${isLocked ? "text-gray-400" : "text-gray-500"}`}>
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            </svg>
                                                            {formatDuration(lecture.duration)}
                                                        </span>
                                                        
                                                        <Chip 
                                                            size="sm" 
                                                            variant="flat" 
                                                            className={`text-xs ${isLocked ? "bg-gray-100 text-gray-500" : ""}`}
                                                        >
                                                            {('type' in lecture && (lecture as any).type) ? (lecture as any).type : "video"}
                                                        </Chip>
                                                        
                                                        {isLocked && (
                                                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                </svg>
                                                                Login to Enroll
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {progress && !isCompleted && !isLocked && (
                                                        <Progress
                                                            value={(progress.watchedDuration / progress.totalDuration) * 100}
                                                            size="sm"
                                                            className="mt-2"
                                                            color="primary"
                                                        />
                                                    )}
                                                </div>
                                            </div>
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
