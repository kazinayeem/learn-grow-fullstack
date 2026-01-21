/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
    FaDownload,
    FaChevronDown
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
    const [selectedLesson, setSelectedLesson] = useState<LessonFromApi | null>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [openingLessonId, setOpeningLessonId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

    useEffect(() => {
        if (typeof window !== "undefined") {
            const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
            setIsTouchDevice(touch);
        }
    }, []);

    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
        };
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
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
        setTimeout(() => setOpeningLessonId(null), 200);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLesson(null);
        setOpeningLessonId(null);
        document.body.style.overflow = '';
    };

    const toggleModule = (idx: number) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(idx)) {
                newSet.delete(idx);
            } else {
                newSet.add(idx);
            }
            return newSet;
        });
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
                // Error already handled by RTK Query
            }
        }
    };

    if (modules.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
                <div className="text-center py-8">
                    <p className="text-gray-500">No course content available yet.</p>
                </div>
            </div>
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
            <div className="flex flex-col gap-2 sm:gap-3">
                {modules.map((module, idx) => {
                    const totalDuration = module.lectures.reduce((acc, l) => acc + (l.duration || 0), 0);
                    const completedCount = module.lectures.filter(l => l.isCompleted).length;
                    const moduleProgress = module.lectures.length > 0
                        ? Math.round((completedCount / module.lectures.length) * 100)
                        : 0;
                    const isExpanded = expandedModules.has(idx);

                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleModule(idx)}
                                className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2 sm:gap-3 sm:pr-4">
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        <FaChevronDown 
                                            className={`text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-2">{module.title}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-0.5 sm:mt-1">{module.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-shrink-0 ml-8 sm:ml-0">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium">
                                            {module.lectures.length}L
                                        </span>
                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium">
                                            {formatDuration(totalDuration)}
                                        </span>
                                        {hasAccess && (
                                            <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs sm:text-sm font-medium">
                                                {moduleProgress}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                            {isExpanded && (
                                <div className="border-t border-gray-200">
                                    <div className="space-y-2 sm:space-y-3 pb-3 sm:pb-4 px-2 sm:px-0">
                                        {hasAccess && (
                                            <div className="px-4 pt-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                                        style={{ width: `${moduleProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
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
                                                            <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                                                                Preview
                                                            </span>
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

                                                        <span className={`px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium capitalize ${isRealLocked ? "bg-gray-100 text-gray-500" : ""}`}>
                                                            {lesson.type || "video"}
                                                        </span>

                                                        {!hasAccess && isRealLocked && (
                                                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                                <FaLock size={12} />
                                                                Enroll to Unlock
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {!isRealLocked && (
                                                    <button
                                                        type="button"
                                                        className="flex-shrink-0 flex items-center gap-1 bg-blue-600 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all touch-manipulation"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleLessonClick(lesson as any);
                                                        }}
                                                        onTouchEnd={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleLessonClick(lesson as any);
                                                        }}
                                                    >
                                                        <FaPlay className="text-xs" />
                                                        <span>
                                                            {openingLessonId === (lesson._id || lesson.id)
                                                                ? "Opening..."
                                                                : isCompleted
                                                                    ? "Review"
                                                                    : "Start"}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                    );

                                    return isTouchDevice ? (
                                        React.cloneElement(lessonRow, { key: lesson.id })
                                    ) : (
                                        <div key={lesson.id} className="relative group">
                                            {lessonRow}
                                            {isRealLocked && (
                                                <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                                    {lockReason}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                        <div className="border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isModalOpen && selectedLesson && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => handleCloseModal()} />
                    <div className="relative z-[10001] w-full max-w-5xl mx-4 sm:mx-6 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-start justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-md bg-gray-100 text-sm capitalize text-gray-700">{selectedLesson.type}</span>
                                    {selectedLesson.isCompleted && (
                                        <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-sm flex items-center gap-1">
                                            <FaCheckCircle /> Completed
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="px-4 sm:px-6 py-4 max-h-[80vh] overflow-y-auto space-y-4">
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
                                            <button
                                                type="button"
                                                onClick={() => window.open(selectedLesson.contentUrl, "_blank")}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                                            >
                                                <FaExpand />
                                                Open
                                            </button>
                                            <a
                                                href={selectedLesson.contentUrl}
                                                download
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition"
                                            >
                                                <FaDownload />
                                                Download
                                            </a>
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

                        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition"
                            >
                                Close
                            </button>
                            {selectedLesson && !selectedLesson.isCompleted && hasAccess && (
                                <button
                                    type="button"
                                    onClick={handleMarkComplete}
                                    disabled={isCompleting}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                                >
                                    {isCompleting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Loading...
                                        </>
                                    ) : "Complete & Continue"}
                                </button>
                            )}
                            {selectedLesson?.isCompleted && (
                                <button
                                    type="button"
                                    disabled
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-green-700 bg-green-50 cursor-not-allowed flex items-center gap-2"
                                >
                                    <FaCheckCircle />
                                    Completed
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
