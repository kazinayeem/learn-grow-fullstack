"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    Button,
    Tabs,
    Tab,
    Chip,
    Progress,
    Input,
    Textarea,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Accordion,
    AccordionItem,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaEdit,
    FaUsers,
    FaBookOpen,
    FaChartLine,
    FaClipboardList,
    FaPlus,
    FaGraduationCap,
    FaEye,
    FaTrash,
    FaVideo,
    FaFileAlt,
    FaEllipsisV,
    FaCheckCircle,
    FaCloudUploadAlt,
    FaLink,
} from "react-icons/fa";

interface Lesson {
    id: string;
    title: string;
    type: "video" | "article" | "quiz";
    description?: string;
    contentUrl?: string;
    isFreePreview?: boolean;
}

interface Module {
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
    resources?: string;
}

export default function InstructorCourseDashboardClient({ params }: { params: { courseId: string } }) {
    const router = useRouter();
    const { courseId } = params;
    const [activeTab, setActiveTab] = useState("overview");

    // Curriculum Management State
    const [modules, setModules] = useState<Module[]>([
        {
            id: "1",
            title: "Introduction to the Course",
            resources: "https://example.com/syllabus.pdf",
            lessons: [
                { id: "101", title: "Welcome & Overview", type: "video", description: "Brief introduction to course text.", isFreePreview: true },
                { id: "102", title: "Setting up your environment", type: "article", description: "Step-by-step guide to installing VS Code." },
            ]
        },
        {
            id: "2",
            title: "HTML Fundamentals",
            lessons: [
                { id: "201", title: "HTML Document Structure", type: "video", description: "Understanding the DOM." },
                { id: "202", title: "Working with Text and lists", type: "video", description: "Tags for text formatting." },
            ]
        }
    ]);

    // Module management
    const { isOpen: isModuleModalOpen, onOpen: onOpenModuleModal, onClose: onCloseModuleModal } = useDisclosure();
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [newModuleDescription, setNewModuleDescription] = useState("");
    const [newModuleResource, setNewModuleResource] = useState("");
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

    // Lesson management
    const { isOpen: isLessonModalOpen, onOpen: onOpenLessonModal, onClose: onCloseLessonModal } = useDisclosure();
    const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
    const [newLesson, setNewLesson] = useState<Partial<Lesson>>({ type: "video" });
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);


    // Hardcoded sample/main courses (same as in page.tsx for consistency)
    const SAMPLE_COURSES = [
        {
            id: "1",
            title: "Web Development Bootcamp",
            description: "The complete guide to becoming a full-stack developer.",
            price: 2000,
            enrolled: 45,
            rating: 4.8,
            status: "published"
        },
        {
            id: "2",
            title: "Python for Kids",
            description: "A fun and interactive introduction to Python programming.",
            price: 1500,
            enrolled: 32,
            rating: 4.9,
            status: "published"
        },
        {
            id: "3",
            title: "Robotics Basics",
            description: "Learn the fundamentals of robotics and electronics.",
            price: 2500,
            enrolled: 18,
            rating: 4.7,
            status: "published"
        },
        {
            id: "4",
            title: "Game Development with Scratch",
            description: "Create your own games using Scratch visual programming.",
            price: 1200,
            enrolled: 60,
            rating: 4.9,
            status: "published"
        }
    ];

    // Find the current course from mock data
    const courseData = SAMPLE_COURSES.find(c => c.id === courseId) || SAMPLE_COURSES[0];

    const course = {
        ...courseData,
        lastUpdated: "2026-12-08",
        progress: 35, // Average student progress
        modules: 12,
        lessons: 48,
        totalDuration: "24h 30m"
    };

    // Assessment Logic
    const assessments = [
        { id: "101", type: "quiz", title: "HTML Basics Quiz", questions: 15, status: "published", submissions: 42 },
        { id: "102", type: "assignment", title: "Build a Portfolio Website", dueDate: "2026-12-20", status: "active", submissions: 12 },
        { id: "103", type: "mid-exam", title: "Mid-Term Exam", questions: 40, status: "draft", submissions: 0 },
        { id: "104", type: "final-exam", title: "Final Course Exam", questions: 60, status: "draft", submissions: 0 },
        { id: "105", type: "project", title: "E-Commerce Platform Project", dueDate: "2026-01-15", status: "active", submissions: 5 },
    ];

    const getStatusColor = (status: string) => status === "published" || status === "active" ? "success" : "warning";

    // --- Curriculum Handlers ---

    const handleSaveModule = () => {
        if (!newModuleTitle.trim()) return;

        if (editingModuleId) {
            setModules(modules.map(m => m.id === editingModuleId ? { ...m, title: newModuleTitle, description: newModuleDescription, resources: newModuleResource } : m));
        } else {
            const newModule: Module = {
                id: Date.now().toString(),
                title: newModuleTitle,
                description: newModuleDescription,
                lessons: [],
                resources: newModuleResource
            };
            setModules([...modules, newModule]);
        }
        setNewModuleTitle("");
        setNewModuleDescription("");
        setNewModuleResource("");
        setEditingModuleId(null);
        onCloseModuleModal();
    };

    const handleDeleteModule = (moduleId: string) => {
        if (confirm("Are you sure you want to delete this module and all its lessons?")) {
            setModules(modules.filter(m => m.id !== moduleId));
        }
    };

    const handleSaveLesson = () => {
        if (!newLesson.title || !currentModuleId) return;

        const lesson: Lesson = {
            id: editingLessonId || Date.now().toString(),
            title: newLesson.title,
            type: newLesson.type || "video",
            description: newLesson.description || "",
            isFreePreview: newLesson.isFreePreview || false,
            contentUrl: newLesson.contentUrl
        };

        setModules(modules.map(m => {
            if (m.id === currentModuleId) {
                if (editingLessonId) {
                    return { ...m, lessons: m.lessons.map(l => l.id === editingLessonId ? lesson : l) };
                } else {
                    return { ...m, lessons: [...m.lessons, lesson] };
                }
            }
            return m;
        }));

        setNewLesson({ type: "video" });
        setEditingLessonId(null);
        onCloseLessonModal();
    };

    const handleDeleteLesson = (moduleId: string, lessonId: string) => {
        if (confirm("Delete this lesson?")) {
            setModules(modules.map(m => {
                if (m.id === moduleId) {
                    return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
                }
                return m;
            }));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Top Navigation */}
            <Button
                variant="light"
                startContent={<FaArrowLeft />}
                onPress={() => router.push("/instructor/courses")}
                className="mb-6"
            >
                Back to Courses
            </Button>

            {/* Course Header */}
            <Card className="mb-8 border-none shadow-md bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                <CardBody className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Chip
                                    color={course.status === "published" ? "success" : "warning"}
                                    variant="solid"
                                    className="border border-white/30"
                                >
                                    {course.status.toUpperCase()}
                                </Chip>
                                <span className="text-blue-100 flex items-center gap-1">
                                    <FaUsers /> {course.enrolled} Enrolled
                                </span>
                                <span className="text-blue-100 flex items-center gap-1">
                                    ⭐ {course.rating}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
                            <p className="text-blue-100 max-w-2xl">{course.description}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                startContent={<FaEdit />}
                                className="bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                            >
                                Edit Details
                            </Button>
                            <Button
                                startContent={<FaEye />}
                                className="bg-white text-blue-900 font-semibold"
                                onPress={() => router.push(`/courses/${courseId}`)}
                            >
                                Preview
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Main Content Tabs */}
            <Tabs
                aria-label="Course Options"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                color="primary"
                variant="underlined"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-primary font-semibold text-lg"
                }}
            >
                {/* Overview Tab */}
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaChartLine />
                            <span>Overview</span>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-gray-500 font-medium mb-2">Student Engagement</h3>
                                <div className="text-4xl font-bold mb-4">87%</div>
                                <Progress value={87} color="success" className="h-2" />
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-gray-500 font-medium mb-2">Completion Rate</h3>
                                <div className="text-4xl font-bold mb-4">12%</div>
                                <Progress value={12} color="warning" className="h-2" />
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-gray-500 font-medium mb-2">Total Revenue</h3>
                                <div className="text-4xl font-bold text-green-600">৳ 90,000</div>
                                <p className="text-xs text-gray-400 mt-1">+15% from last month</p>
                            </CardBody>
                        </Card>
                    </div>
                </Tab>

                {/* Curriculum Tab (Complete implementation) */}
                <Tab
                    key="curriculum"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaBookOpen />
                            <span>Curriculum</span>
                        </div>
                    }
                >
                    <div className="mt-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Course Curriculum</h2>
                                <p className="text-gray-600">Organize your course into modules and lessons.</p>
                            </div>
                            <Button
                                color="primary"
                                startContent={<FaPlus />}
                                onPress={() => {
                                    setNewModuleTitle("");
                                    setNewModuleDescription("");
                                    setNewModuleResource("");
                                    setEditingModuleId(null);
                                    onOpenModuleModal();
                                }}
                            >
                                Add Module
                            </Button>
                        </div>

                        {modules.length === 0 ? (
                            <Card className="border-2 border-dashed border-gray-300">
                                <CardBody className="p-12 text-center text-gray-500">
                                    <FaBookOpen className="text-4xl mx-auto mb-3 text-gray-300" />
                                    <p className="mb-4">No curriculum content yet. Start by adding a module!</p>
                                    <Button color="primary" variant="flat" onPress={onOpenModuleModal}>Create Module</Button>
                                </CardBody>
                            </Card>
                        ) : (
                            <Accordion variant="splitted" defaultExpandedKeys={["1"]}>
                                {modules.map((module) => (
                                    <AccordionItem
                                        key={module.id}
                                        aria-label={module.title}
                                        title={
                                            <div className="flex justify-between items-center w-full pr-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-lg">{module.title}</span>
                                                    {module.resources && (
                                                        <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                                            <FaLink />
                                                            <span>Resources attached</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <span className="text-sm text-gray-500 mr-2">{module.lessons.length} lessons</span>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => {
                                                            setEditingModuleId(module.id);
                                                            setNewModuleTitle(module.title);
                                                            setNewModuleDescription(module.description || "");
                                                            setNewModuleResource(module.resources || "");
                                                            onOpenModuleModal();
                                                        }}
                                                    >
                                                        <FaEdit className="text-gray-500" />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => handleDeleteModule(module.id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </div>
                                        }
                                        subtitle={
                                            <div className="flex flex-col gap-1">
                                                <span className="text-gray-500">{module.lessons.length} lessons</span>
                                                {module.description && <span className="text-xs text-gray-400 max-w-sm truncate">{module.description}</span>}
                                            </div>
                                        }
                                    >
                                        <div className="flex flex-col gap-2 p-2">
                                            {module.lessons.map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-md shadow-sm text-gray-500">
                                                            {lesson.type === "video" ? <FaVideo /> : <FaFileAlt />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{lesson.title}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="capitalize">{lesson.type}</span>
                                                                {lesson.description && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate max-w-[200px]">{lesson.description}</span>
                                                                    </>
                                                                )}
                                                                {lesson.isFreePreview && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-green-600 font-semibold">Free Preview</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => {
                                                                setCurrentModuleId(module.id);
                                                                setEditingLessonId(lesson.id);
                                                                setNewLesson(lesson);
                                                                onOpenLessonModal();
                                                            }}
                                                        >
                                                            <FaEdit className="text-gray-500" />
                                                        </Button>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            onPress={() => handleDeleteLesson(module.id, lesson.id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                className="mt-2"
                                                variant="dashed"
                                                startContent={<FaPlus />}
                                                onPress={() => {
                                                    setCurrentModuleId(module.id);
                                                    setEditingLessonId(null);
                                                    setNewLesson({ type: "video" });
                                                    onOpenLessonModal();
                                                }}
                                            >
                                                Add Lesson
                                            </Button>
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                </Tab>

                {/* Students Tab (Placeholder) */}
                <Tab
                    key="students"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaUsers />
                            <span>Students</span>
                        </div>
                    }
                >
                    <Card className="mt-6">
                        <CardBody className="p-8 text-center text-gray-500">
                            <FaGraduationCap className="text-6xl mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold mb-2">Enrolled Students</h3>
                            <p>View and manage the {course.enrolled} students enrolled in this course.</p>
                        </CardBody>
                    </Card>
                </Tab>

                {/* ASSESSMENTS TAB - The user's request */}
                <Tab
                    key="assessments"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaClipboardList />
                            <span>Assessments</span>
                        </div>
                    }
                >
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Course Assessments</h2>
                                <p className="text-gray-600">Manage quizzes, exams, and assignments for this course.</p>
                            </div>
                            {/* Auto-select this course when creating */}
                            <Button
                                color="primary"
                                size="lg"
                                startContent={<FaPlus />}
                                onPress={() => router.push(`/instructor/quizzes/create?courseId=${courseId}&courseTitle=${encodeURIComponent(course.title)}`)}
                            >
                                Create Assessment
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {assessments.map((assessment) => (
                                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                                    <CardBody className="p-4 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${assessment.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                                                assessment.type === 'mid-exam' ? 'bg-orange-100 text-orange-600' :
                                                    assessment.type === 'final-exam' ? 'bg-red-100 text-red-600' :
                                                        assessment.type === 'project' ? 'bg-green-100 text-green-600' :
                                                            'bg-blue-100 text-blue-600'
                                                }`}>
                                                <FaClipboardList className="text-xl" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg">{assessment.title}</h3>
                                                    <Chip size="sm" variant="flat" color="secondary" className="capitalize">
                                                        {assessment.type.replace("-", " ")}
                                                    </Chip>
                                                    <Chip size="sm" variant="dot" color={getStatusColor(assessment.status) as any}>
                                                        {assessment.status}
                                                    </Chip>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {assessment.type === 'assignment' || assessment.type === 'project'
                                                        ? `Due: ${new Date(assessment.dueDate!).toLocaleDateString()}`
                                                        : `${assessment.questions} Questions`}
                                                    {' • '}
                                                    <span className="font-medium text-primary cursor-pointer hover:underline">
                                                        {assessment.submissions} Submissions
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Submission Button for capable types */}
                                            {(['assignment', 'project', 'mid-exam', 'final-exam'].includes(assessment.type)) && (
                                                <Button size="sm" variant="flat" color="primary">
                                                    View Submissions
                                                </Button>
                                            )}
                                            <Button isIconOnly variant="light" onPress={() => router.push(`/instructor/quizzes/${assessment.id}/edit`)}>
                                                <FaEdit className="text-gray-500" />
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}

                            {assessments.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-4">No assessments created for this course yet.</p>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        onPress={() => router.push(`/instructor/quizzes/create?courseId=${courseId}&courseTitle=${encodeURIComponent(course.title)}`)}
                                    >
                                        Create Your First Assessment
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Tab>
            </Tabs>

            {/* Module Modal */}
            <Modal isOpen={isModuleModalOpen} onClose={onCloseModuleModal} size="2xl">
                <ModalContent>
                    <ModalHeader>{editingModuleId ? "Edit Module" : "Add New Module"}</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Module Title"
                            placeholder="e.g., Introduction to CSS"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            isRequired
                        />
                        <Textarea
                            label="Description"
                            placeholder="Brief summary of this module..."
                            minRows={2}
                            className="mt-4"
                            value={newModuleDescription}
                            onChange={(e) => setNewModuleDescription(e.target.value)}
                        />

                        {/* Module Resource Section */}
                        <div className="mt-4">
                            <label className="text-sm font-medium mb-2 block">Module Resources (Optional)</label>
                            <p className="text-xs text-gray-500 mb-3">Upload lecture notes, slides, or source code for this module.</p>
                            <Tabs
                                aria-label="Module Content Source"
                                size="sm"
                                classNames={{
                                    tabList: "w-full",
                                    cursor: "w-full bg-primary",
                                }}
                            >
                                <Tab key="upload" title={
                                    <div className="flex items-center space-x-2">
                                        <FaCloudUploadAlt />
                                        <span>Upload File</span>
                                    </div>
                                }>
                                    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative group bg-gray-50/50">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    setNewModuleResource(URL.createObjectURL(file));
                                                    alert(`Resources attached: ${file.name}`);
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                                <FaCloudUploadAlt className="text-3xl" />
                                            </div>
                                            <p className="font-semibold">Drop module resources here</p>
                                            <p className="text-xs mt-1">ZIP, PDF, PPTX (Max 50MB)</p>
                                        </div>
                                    </div>
                                    {newModuleResource && newModuleResource.startsWith("blob:") && (
                                        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-center gap-2">
                                            <FaCheckCircle /> File selected
                                        </div>
                                    )}
                                </Tab>
                                <Tab key="url" title={
                                    <div className="flex items-center space-x-2">
                                        <FaLink />
                                        <span>External Link</span>
                                    </div>
                                }>
                                    <Input
                                        className="mt-4"
                                        label="Resource URL"
                                        placeholder={`https://drive.google.com/...`}
                                        startContent={<FaLink className="text-gray-400" />}
                                        value={newModuleResource || ""}
                                        onChange={(e) => setNewModuleResource(e.target.value)}
                                        description="Link to cloud folder, GitHub repo, or slides"
                                    />
                                </Tab>
                            </Tabs>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onCloseModuleModal}>Cancel</Button>
                        <Button color="primary" onPress={handleSaveModule}>Save Module</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Lesson Modal */}
            <Modal isOpen={isLessonModalOpen} onClose={onCloseLessonModal} size="2xl">
                <ModalContent>
                    <ModalHeader>{editingLessonId ? "Edit Lesson" : "Add New Lesson"}</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Lesson Title"
                            placeholder="e.g., CSS Selectors"
                            value={newLesson.title || ""}
                            onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                            isRequired
                        />
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Type</label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        color={newLesson.type === "video" ? "primary" : "default"}
                                        variant={newLesson.type === "video" ? "solid" : "bordered"}
                                        onPress={() => setNewLesson({ ...newLesson, type: "video" })}
                                        startContent={<FaVideo />}
                                    >
                                        Video
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={newLesson.type === "article" ? "primary" : "default"}
                                        variant={newLesson.type === "article" ? "solid" : "bordered"}
                                        onPress={() => setNewLesson({ ...newLesson, type: "article" })}
                                        startContent={<FaFileAlt />}
                                    >
                                        Article
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <Textarea
                                    label="Description"
                                    placeholder="Enter content details..."
                                    minRows={1}
                                    value={newLesson.description || ""}
                                    onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Content Material Section */}
                        <div className="mt-2">
                            <label className="text-sm font-medium mb-2 block">Content Material</label>
                            <Tabs
                                aria-label="Content Source"
                                size="sm"
                                classNames={{
                                    tabList: "w-full",
                                    cursor: "w-full bg-primary",
                                }}
                            >
                                <Tab key="upload" title={
                                    <div className="flex items-center space-x-2">
                                        <FaCloudUploadAlt />
                                        <span>Upload File</span>
                                    </div>
                                }>
                                    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative group bg-gray-50/50">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    // Mock upload behavior
                                                    const file = e.target.files[0];
                                                    setNewLesson({ ...newLesson, contentUrl: URL.createObjectURL(file) });
                                                    alert(`File selected: ${file.name}`);
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                                <FaCloudUploadAlt className="text-3xl" />
                                            </div>
                                            <p className="font-semibold">Click to upload or drag and drop</p>
                                            <p className="text-xs mt-1">
                                                {newLesson.type === "video" ? "MP4, WebM (Max 2GB)" :
                                                    newLesson.type === "article" ? "PDF, DOCX, TXT (Max 10MB)" : "Any file"}
                                            </p>
                                        </div>
                                    </div>
                                    {newLesson.contentUrl && newLesson.contentUrl.startsWith("blob:") && (
                                        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-center gap-2">
                                            <FaCheckCircle /> File selected and ready to upload
                                        </div>
                                    )}
                                </Tab>
                                <Tab key="url" title={
                                    <div className="flex items-center space-x-2">
                                        <FaLink />
                                        <span>External Link</span>
                                    </div>
                                }>
                                    <Input
                                        className="mt-4"
                                        label="External URL"
                                        placeholder={`https://...`}
                                        startContent={<FaLink className="text-gray-400" />}
                                        value={newLesson.contentUrl || ""}
                                        onChange={(e) => setNewLesson({ ...newLesson, contentUrl: e.target.value })}
                                        description="Direct link to video (YouTube/Vimeo) or document"
                                    />
                                </Tab>
                            </Tabs>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="freePreview"
                                checked={newLesson.isFreePreview || false}
                                onChange={(e) => setNewLesson({ ...newLesson, isFreePreview: e.target.checked })}
                                className="w-4 h-4 text-primary rounded"
                            />
                            <label htmlFor="freePreview" className="text-sm select-none cursor-pointer">Make this lesson free for preview</label>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onCloseLessonModal}>Cancel</Button>
                        <Button color="primary" onPress={handleSaveLesson}>Save Lesson</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    );
}
