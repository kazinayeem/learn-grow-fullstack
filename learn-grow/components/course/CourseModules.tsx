/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    Accordion,
    AccordionItem,
    Chip,
    Progress,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";
import { useCompleteLessonMutation } from "@/redux/api/courseApi";
import {
    FaLock,
    FaCheckCircle,
    FaPlay,
    FaClock,
    FaVideo,
    FaFilePdf,
    FaBook,
    FaExpand,
    FaDownload
} from "react-icons/fa";

interface LessonFromApi {
    _id: string;
    id?: string;
    title: string;
    description?: string;
    orderIndex?: number;
    isFreePreview?: boolean;
    duration?: number;
    type?: "video" | "pdf" | "quiz" | "assignment" | "article";
    contentUrl?: string;
    isPublished?: boolean;
    // New fields
    isLocked?: boolean;
    lockReason?: string;
    isCompleted?: boolean;
}

interface ModuleFromApi {
    _id: string;
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
    canViewPreview?: boolean;
}

export default function CourseModules({ courseId, isEnrolled, modulesFromApi, hasAccess = false, canViewPreview = false }: CourseModulesProps) {
    const [completeLesson, { isLoading: isCompleting }] = useCompleteLessonMutation();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedLesson, setSelectedLesson] = useState<LessonFromApi | null>(null);

    // Prefer API modules (with lessons) when provided
    const modules = modulesFromApi && modulesFromApi.length > 0
        ? modulesFromApi.map((m) => ({
            id: m._id || m.id,
            title: m.title,
            description: m.description,
            order: m.orderIndex ?? 0,
            isPublished: m.isPublished,
            lectures: (m.lessons || []).map((l) => ({
                ...l,
                id: l._id || l.id, // normalization
                isPreview: l.isFreePreview ?? false,
            })).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
        })).sort((a, b) => (a.order || 0) - (b.order || 0))
        : [];

    const formatDuration = (minutes?: number) => {
        if (!minutes || Number.isNaN(minutes)) return "-";
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getLessonIcon = (type: string) => {
        switch (type) {
            case "video":
                return <FaVideo className="text-red-500" />;
            case "pdf":
                return <FaFilePdf className="text-blue-500" />;
            case "article":
                return <FaBook className="text-green-500" />;
            default:
                return <FaBook />;
        }
    };

    const handleLessonClick = (lesson: LessonFromApi) => {
        if (!hasAccess && !lesson.isFreePreview) return;

        // If locked but not preview (and we have access?? actually if locked we generally can't access, 
        // unless logic says otherwise, but backend sets isLocked based on sequence)
        if (lesson.isLocked) return;

        setSelectedLesson(lesson);
        onOpen();
    };

    const handleMarkComplete = async () => {
        if (selectedLesson && !selectedLesson.isCompleted) {
            try {
                // The ID might need to be purely the _id
                const idToComplete = selectedLesson._id || selectedLesson.id;
                if (idToComplete) {
                    await completeLesson(idToComplete).unwrap();
                }
            } catch (error) {
                console.error("Failed to complete lesson:", error);
            }
        }
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
                    {modules.reduce((acc, m) => acc + m.lectures.length, 0)} Lessons
                </div>
            </div>

            <Accordion variant="splitted" defaultExpandedKeys={["0"]}>
                {modules.map((module, idx) => {
                    const totalDuration = module.lectures.reduce((acc, l) => acc + (l.duration || 0), 0);
                    const completedCount = module.lectures.filter(l => l.isCompleted).length;
                    const moduleProgress = module.lectures.length > 0
                        ? Math.round((completedCount / module.lectures.length) * 100)
                        : 0;

                    return (
                        <AccordionItem
                            key={idx.toString()}
                            aria-label={module.title}
                            title={
                                <div className="flex justify-between items-center w-full pr-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{module.title}</h3>
                                        <p className="text-sm text-default-500">{module.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Chip size="sm" variant="flat">
                                            {module.lectures.length} Lessons
                                        </Chip>
                                        <Chip size="sm" variant="flat">
                                            {formatDuration(totalDuration)}
                                        </Chip>
                                        {hasAccess && (
                                            <Chip color="success" size="sm" variant="flat">
                                                {moduleProgress}%
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            }
                        >
                            <div className="space-y-3 pb-4">
                                {hasAccess && <Progress value={moduleProgress} color="success" size="sm" className="mb-2" />}

                                {module.lectures.map((lesson) => {
                                    // Logic for display
                                    // If user can preview (free course or has access), show free preview + full content if has access
                                    // If cannot preview and not free preview, show locked
                                    const isRealLocked = canViewPreview ? !!lesson.isLocked : (!lesson.isFreePreview);
                                    const lockReason = canViewPreview ? lesson.lockReason : "Enroll to access this lesson";
                                    const isCompleted = !!lesson.isCompleted;

                                    return (
                                        <Tooltip key={lesson.id} content={isRealLocked ? lockReason : "Click to view"} isDisabled={!isRealLocked} placement="top">
                                            <div
                                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isRealLocked
                                                    ? "bg-gray-50 border-gray-200 opacity-70 cursor-not-allowed"
                                                    : "bg-white border-gray-200 hover:border-primary hover:shadow-md cursor-pointer"
                                                    } ${isCompleted ? "bg-green-50 border-green-200" : ""}`}
                                                onClick={() => !isRealLocked && handleLessonClick(lesson as any)}
                                            >
                                                {/* Status Icon */}
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isRealLocked
                                                    ? "bg-gray-200"
                                                    : isCompleted
                                                        ? "bg-success-100"
                                                        : "bg-primary-100"
                                                    }`}>
                                                    {isRealLocked ? (
                                                        <FaLock className="text-gray-500" />
                                                    ) : isCompleted ? (
                                                        <FaCheckCircle className="text-success" />
                                                    ) : (
                                                        getLessonIcon(lesson.type || "article")
                                                    )}
                                                </div>

                                                {/* Lesson Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-semibold text-base ${isRealLocked ? "text-gray-500" : "text-gray-900"}`}>
                                                            {lesson.title}
                                                        </h4>
                                                        {lesson.isFreePreview && (
                                                            <Chip size="sm" color="primary" variant="flat">
                                                                Preview
                                                            </Chip>
                                                        )}
                                                    </div>

                                                    {lesson.description && (
                                                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                                            {lesson.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className={`flex items-center gap-1 ${isRealLocked ? "text-gray-400" : "text-gray-500"}`}>
                                                            <FaClock />
                                                            {formatDuration(lesson.duration)}
                                                        </span>

                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            className={`text-xs capitalize ${isRealLocked ? "bg-gray-100 text-gray-500" : ""}`}
                                                        >
                                                            {lesson.type || "video"}
                                                        </Chip>

                                                        {!hasAccess && isRealLocked && (
                                                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                                <FaLock size={12} />
                                                                Enroll to Unlock
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {!isRealLocked && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary rounded-lg text-sm font-medium">
                                                        <FaPlay className="text-xs" />
                                                        <span>{isCompleted ? "Review" : "Start"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {/* Lesson Viewer Modal */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="5xl"
                scrollBehavior="inside"
                backdrop="blur"
            >
                <ModalContent>
                    <ModalHeader>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">{selectedLesson?.title}</h2>
                            <div className="flex items-center gap-2">
                                <Chip size="sm" variant="flat" className="capitalize">
                                    {selectedLesson?.type}
                                </Chip>
                                {selectedLesson?.isCompleted && (
                                    <Chip size="sm" color="success" variant="flat" startContent={<FaCheckCircle />}>
                                        Completed
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        {selectedLesson && (
                            <div className="space-y-4">
                                {selectedLesson.description && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700">{selectedLesson.description}</p>
                                    </div>
                                )}

                                {/* Content Display */}
                                {selectedLesson.type === "video" && selectedLesson.contentUrl && (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                        {selectedLesson.contentUrl.includes("youtube.com") || selectedLesson.contentUrl.includes("youtu.be") ? (
                                            <iframe
                                                src={selectedLesson.contentUrl.replace("watch?v=", "embed/")}
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        ) : selectedLesson.contentUrl.includes("vimeo.com") ? (
                                            <iframe
                                                src={selectedLesson.contentUrl}
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="autoplay; fullscreen; picture-in-picture"
                                            />
                                        ) : (
                                            <video
                                                src={selectedLesson.contentUrl}
                                                controls
                                                className="w-full h-full"
                                            />
                                        )}
                                    </div>
                                )}

                                {selectedLesson.type === "pdf" && selectedLesson.contentUrl && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FaFilePdf className="text-3xl text-red-500" />
                                                <div>
                                                    <p className="font-semibold">PDF Document</p>
                                                    <p className="text-sm text-gray-600">Click to view or download</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    color="primary"
                                                    variant="flat"
                                                    startContent={<FaExpand />}
                                                    onPress={() => window.open(selectedLesson.contentUrl, "_blank")}
                                                >
                                                    Open
                                                </Button>
                                                <Button
                                                    color="secondary"
                                                    variant="flat"
                                                    startContent={<FaDownload />}
                                                    as="a"
                                                    href={selectedLesson.contentUrl}
                                                    download
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                        <iframe
                                            src={`${selectedLesson.contentUrl}#toolbar=0`}
                                            className="w-full h-[600px] border rounded-lg"
                                        />
                                    </div>
                                )}

                                {selectedLesson.type === "article" && selectedLesson.contentUrl && (
                                    <div className="prose max-w-none">
                                        <iframe
                                            src={selectedLesson.contentUrl}
                                            className="w-full h-[600px] border rounded-lg"
                                        />
                                    </div>
                                )}

                                {!selectedLesson.contentUrl && (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaBook className="text-6xl mx-auto mb-4 text-gray-300" />
                                        <p>Content not available yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Close
                        </Button>
                        {selectedLesson && !selectedLesson.isCompleted && hasAccess && (
                            <Button
                                color="primary"
                                onPress={handleMarkComplete}
                                isLoading={isCompleting}
                            >
                                Complete & Continue
                            </Button>
                        )}
                        {selectedLesson?.isCompleted && (
                            <Button color="success" variant="flat" disabled>
                                Completed
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
