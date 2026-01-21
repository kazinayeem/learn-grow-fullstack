/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [selectedLesson, setSelectedLesson] = useState<LessonFromApi | null>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [openingLessonId, setOpeningLessonId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
            setIsTouchDevice(touch);
        }
    }, []);

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
        const id = lesson._id || lesson.id;
        setOpeningLessonId(id || null);

        if (!hasAccess && !lesson.isFreePreview) {
            setOpeningLessonId(null);
            return;
        }

        if (lesson.isLocked) {
            setOpeningLessonId(null);
            return;
        }

        setSelectedLesson(lesson);
    };

    // Effect to ensure modal opens when selectedLesson is set
    useEffect(() => {
        if (selectedLesson && !isOpen) {
            onOpen();
        }
        if (selectedLesson) {
            const id = selectedLesson._id || selectedLesson.id;
            setOpeningLessonId((prev) => (prev === id ? null : prev));
        }
    }, [selectedLesson, isOpen, onOpen]);

    const handleMarkComplete = async () => {
        if (selectedLesson && !selectedLesson.isCompleted) {
            try {
                // The ID might need to be purely the _id
                const idToComplete = selectedLesson._id || selectedLesson.id;
                if (idToComplete) {
                    await completeLesson(idToComplete).unwrap();
                }
            } catch (error) {
                // Error already handled by RTK Query
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
        <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header section - Responsive layout */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4 md:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Course Content</h2>
                <div className="text-xs sm:text-sm text-default-500 flex gap-2 sm:gap-4 flex-wrap">
                    <span className="whitespace-nowrap">{modules.length} Module{modules.length > 1 ? "s" : ""}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">
                        {modules.reduce((acc, m) => acc + m.lectures.length, 0)} Lessons
                    </span>
                </div>
            </div>

            {/* Accordion for modules - Responsive */}
            <Accordion 
                variant="splitted" 
                defaultExpandedKeys={["0"]}
                className="gap-2 sm:gap-3"
            >
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
                            className="text-xs sm:text-sm md:text-base"
                            title={
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2 sm:gap-3 sm:pr-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-2">{module.title}</h3>
                                        <p className="text-xs sm:text-sm text-default-500 line-clamp-1 mt-0.5 sm:mt-1">{module.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-shrink-0">
                                        <Chip size="sm" variant="flat" className="text-xs sm:text-sm">
                                            {module.lectures.length}L
                                        </Chip>
                                        <Chip size="sm" variant="flat" className="text-xs sm:text-sm">
                                            {formatDuration(totalDuration)}
                                        </Chip>
                                        {hasAccess && (
                                            <Chip color="success" size="sm" variant="flat" className="text-xs sm:text-sm">
                                                {moduleProgress}%
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            }
                        >
                            <div className="space-y-2 sm:space-y-3 pb-3 sm:pb-4 px-2 sm:px-0">
                                {hasAccess && <Progress value={moduleProgress} color="success" size="sm" className="mb-2 sm:mb-3" />}

                                {module.lectures.map((lesson) => {
                                    // Logic for display
                                    const isRealLocked = canViewPreview ? !!lesson.isLocked : (!lesson.isFreePreview);
                                    const lockReason = canViewPreview ? lesson.lockReason : "Enroll to access this lesson";
                                    const isCompleted = !!lesson.isCompleted;

                                    const lessonRow = (
                                            <div
                                                className={`flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 rounded-lg border transition-all text-xs sm:text-sm md:text-base touch-manipulation pointer-events-auto ${isRealLocked
                                                    ? "bg-gray-50 border-gray-200 opacity-70 cursor-not-allowed"
                                                    : "bg-white border-gray-200 hover:border-primary hover:shadow-md cursor-pointer active:scale-[0.98]"
                                                    } ${isCompleted ? "bg-green-50 border-green-200" : ""}`}
                                                 onClick={(e) => {
                                                     if ((e.target as HTMLElement).closest('button')) return;
                                                     if (!isRealLocked) {
                                                         handleLessonClick(lesson as any);
                                                     }
                                                 }}
                                                 onTouchEnd={(e) => {
                                                     if ((e.target as HTMLElement).closest('button')) return;
                                                     if (!isRealLocked) {
                                                         handleLessonClick(lesson as any);
                                                     }
                                                 }}
                                                role="button"
                                                tabIndex={isRealLocked ? -1 : 0}
                                                aria-label={`${lesson.title} - ${isRealLocked ? 'Locked' : 'Click to view'}`}
                                                onKeyDown={(e) => {
                                                    if (!isRealLocked && (e.key === 'Enter' || e.key === ' ')) {
                                                        e.preventDefault();
                                                        handleLessonClick(lesson as any);
                                                    }
                                                }}
                                            >
                                                {/* Status Icon - Smaller on mobile */}
                                                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl ${isRealLocked
                                                    ? "bg-gray-200"
                                                    : isCompleted
                                                        ? "bg-success-100"
                                                        : "bg-primary-100"
                                                    }`}>
                                                    {isRealLocked ? (
                                                        <FaLock className="text-gray-500 text-sm sm:text-base" />
                                                    ) : isCompleted ? (
                                                        <FaCheckCircle className="text-success text-sm sm:text-base" />
                                                    ) : (
                                                        <span className="text-sm sm:text-base">{getLessonIcon(lesson.type || "article")}</span>
                                                    )}
                                                </div>

                                                {/* Lesson Content - Responsive layout */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                                                        <h4 className={`font-semibold line-clamp-2 sm:line-clamp-1 text-xs sm:text-sm md:text-base ${isRealLocked ? "text-gray-500" : "text-gray-900"}`}>
                                                            {lesson.title}
                                                        </h4>
                                                        {lesson.isFreePreview && (
                                                            <Chip size="sm" color="primary" variant="flat" className="text-xs">
                                                                Preview
                                                            </Chip>
                                                        )}
                                                    </div>

                                                    {lesson.description && (
                                                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-1">
                                                            {lesson.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                                        <span className={`flex items-center gap-1 ${isRealLocked ? "text-gray-400" : "text-gray-500"}`}>
                                                            <FaClock className="flex-shrink-0" />
                                                            <span className="whitespace-nowrap">{formatDuration(lesson.duration)}</span>
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
                                                    <Button
                                                        isIconOnly={false}
                                                        className="flex-shrink-0 bg-primary text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-600 active:scale-95 transition-all min-h-fit touch-manipulation"
                                                        onPress={() => handleLessonClick(lesson as any)}
                                                    >
                                                        <FaPlay className="text-xs mr-1" />
                                                        <span>
                                                            {openingLessonId === (lesson._id || lesson.id)
                                                                ? "Opening..."
                                                                : isCompleted
                                                                    ? "Review"
                                                                    : "Start"}
                                                        </span>
                                                    </Button>
                                                )}
                                            </div>
                                    );

                                    return isTouchDevice ? (
                                        React.cloneElement(lessonRow, { key: lesson.id })
                                    ) : (
                                        <Tooltip 
                                            key={lesson.id} 
                                            content={isRealLocked ? lockReason : "Click to view"} 
                                            isDisabled={!isRealLocked} 
                                            placement="top"
                                            classNames={{
                                                base: "pointer-events-auto",
                                                content: "pointer-events-auto",
                                            }}
                                        >
                                            {lessonRow}
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
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedLesson(null);
                        setOpeningLessonId(null);
                        onClose();
                    }
                }}
                size="5xl"
                scrollBehavior="inside"
                backdrop="blur"
                placement="center"
                portalContainer={typeof window !== 'undefined' ? document.body : undefined}
                classNames={{
                    wrapper: "pointer-events-auto z-[9999]",
                    backdrop: "pointer-events-auto z-[9998]",
                    base: "pointer-events-auto z-[10000]",
                    closeButton: "pointer-events-auto",
                }}
                isDismissable={true}
                isKeyboardDismissDisabled={false}
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
                        <Button 
                            variant="light" 
                            onPress={() => {
                                setSelectedLesson(null);
                                onOpenChange(false);
                            }}
                        >
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
