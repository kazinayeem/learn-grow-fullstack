"use client";

import React, { useState, useEffect } from "react";
import RequireAuth from "@/components/Auth/RequireAuth";
import { getProfile } from "@/lib/auth";
import Cookies from "js-cookie";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Progress,
    Spinner,
    Divider,
    Chip,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tabs,
    Tab,
    Avatar,
    Pagination,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    FaChild,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCheckCircle,
    FaClock,
    FaDownload,
    FaUpload,
    FaFileAlt,
    FaChartLine,
    FaCreditCard,
    FaGraduationCap,
    FaBook,
    FaCalendarAlt,
    FaTrophy,
    FaEye,
    FaMoneyBillWave,
    FaTimes,
} from "react-icons/fa";

interface Enrollment {
    _id: string;
    courseId: {
        _id: string;
        title: string;
        thumbnail?: string;
    };
    progress: number;
    lastAccessedAt?: string;
    enrolledAt: string;
    completedLessons?: number;
    totalLessons?: number;
}

interface Payment {
    _id: string;
    planType: string;
    price: number;
    paymentStatus: string;
    transactionId: string;
    createdAt: string;
    courseId?: {
        title: string;
    };
}

interface Report {
    _id: string;
    title: string;
    type: string;
    generatedAt: string;
    downloadUrl?: string;
}

function GuardianDashboardContent() {
    const router = useRouter();
    const [guardian, setGuardian] = useState<any>(null);
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);
    const [hasQuarterlyAccess, setHasQuarterlyAccess] = useState(false);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 9;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Pagination logic
    const totalPages = Math.ceil(allEnrollments.length / coursesPerPage);
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const startIndex = (page - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        setEnrollments(allEnrollments.slice(startIndex, endIndex));
    };

    useEffect(() => {
        loadGuardianProfile();
    }, []);

    const loadGuardianProfile = async () => {
        try {
            setLoading(true);
            const result = await getProfile();
            
            if (result.success && result.data) {
                const user = result.data.user;
                setGuardian(user);
                
                // Load linked student from relations
                const linkedStudent = result.data.relations?.student;
                if (linkedStudent) {
                    const studentData = {
                        id: linkedStudent._id,
                        name: linkedStudent.name,
                        email: linkedStudent.email,
                        phone: linkedStudent.phone,
                        role: linkedStudent.role,
                        isVerified: linkedStudent.isVerified,
                    };
                    setStudent(studentData);
                    
                    // Pass student ID directly to loadStudentData
                    await loadStudentData(linkedStudent._id);
                } else {
                    toast.info("No student linked to your account yet.");
                }
            }
        } catch (error: any) {
            console.error("Failed to load profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const loadStudentData = async (studentId?: string) => {
        try {
            const token = Cookies.get('accessToken') || (typeof window !== 'undefined' ? localStorage.getItem('token') : '') || '';
            
            console.log("[Guardian] ========== loadStudentData START ==========");
            console.log("[Guardian] Received studentId parameter:", studentId);
            
            // Build URL with student ID if available
            let url = `${process.env.NEXT_PUBLIC_API_URL}/orders/student-data`;
            if (studentId) {
                url += `?studentId=${studentId}`;
                console.log("[Guardian] Built URL with studentId:", url);
            } else {
                console.log("[Guardian] No studentId provided, using base URL:", url);
            }
            
            // Fetch student's orders and enrollments from guardian-specific endpoint
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success && result.data) {
                    // Set payments from orders
                    setPayments(result.data.orders || []);
                    setHasQuarterlyAccess(result.data.hasQuarterlyAccess || false);
                    
                    console.log("[Guardian] API Response:", result);
                    console.log("[Guardian] Guardian student ID:", result.data.student?._id);
                    console.log("[Guardian] Enrollments received:", result.data.enrollments?.length, "courses");
                    console.log("[Guardian] Has quarterly access:", result.data.hasQuarterlyAccess);
                    
                    // Transform enrollments to include course data
                    const enrollmentData = (result.data.enrollments || []).map((enrollment: any) => {
                        // Calculate progress from completed lessons
                        const completedLessonsCount = enrollment.completedLessons?.length || 0;
                        const totalLessonsInCourse = enrollment.courseId?.modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0;
                        const calculatedProgress = totalLessonsInCourse > 0 
                            ? Math.round((completedLessonsCount / totalLessonsInCourse) * 100)
                            : (enrollment.progress || enrollment.completionPercentage || 0);
                        
                        console.log(`[Guardian] Enrollment: ${enrollment.courseId?.title} (${enrollment.courseId?._id}), Progress: ${calculatedProgress}%`);
                        
                        return {
                            _id: enrollment._id,
                            courseId: enrollment.courseId,
                            progress: calculatedProgress,
                            lastAccessedAt: enrollment.updatedAt,
                            enrolledAt: enrollment.createdAt,
                            completedLessons: completedLessonsCount,
                            totalLessons: totalLessonsInCourse,
                            accessType: enrollment.accessType || "enrollment",
                        };
                    });
                    
                    setAllEnrollments(enrollmentData);
                    setEnrollments(enrollmentData.slice(0, coursesPerPage));
                }
            } else {
                console.error('Failed to fetch student data:', response.status);
                // Show toast notification for errors
                if (response.status === 500) {
                    toast.error("Server error loading student data. Please try again.");
                } else if (response.status === 403) {
                    toast.error("You don't have permission to view this student's data.");
                } else {
                    toast.error("Failed to load student data.");
                }
                // Continue loading reports even if enrollments/orders failed
                loadStudentReports();
            }
        } catch (error) {
            console.error('Failed to load student data:', error);
            toast.error("Error loading student data. Please refresh the page.");
            // Load reports anyway
            loadStudentReports();
        }
    };

    const loadStudentReports = () => {
        // Mock reports - replace with real API when available
        setReports([
            {
                _id: '1',
                title: 'Progress Report - Q1 2026',
                type: 'progress',
                generatedAt: new Date().toISOString(),
            },
            {
                _id: '2',
                title: 'Assessment Results',
                type: 'assessment',
                generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ]);
    };

    const handleDownloadReport = async (reportId: string) => {
        toast.info('Generating report...');
        setTimeout(() => {
            toast.success('Report downloaded successfully!');
        }, 1500);
    };

    const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('File uploaded successfully!');
            loadStudentReports();
        } catch (error) {
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const viewDetails = (item: any, type: string) => {
        setSelectedItem({ ...item, type });
        onOpen();
    };

    const studentStats = student ? {
        courses: allEnrollments.length,
        progress: allEnrollments.length > 0 
            ? Math.round(allEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / allEnrollments.length)
            : 0,
        completedLessons: enrollments.reduce((sum, e) => sum + (e.completedLessons || 0), 0),
        totalPayments: payments.length,
        totalSpent: payments.reduce((sum, p) => sum + (p.price || 0), 0),
        approvedPayments: payments.filter(p => p.paymentStatus === 'approved').length,
    } : null;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading guardian profile..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-[1440px]">
                {/* Header - Responsive */}
                <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Guardian Dashboard 👨‍👩‍👧
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                        Welcome, {guardian?.name || "Guardian"}. Monitor your student's complete learning journey.
                    </p>
                </div>

                {/* Main Content Tabs - Responsive */}
                <Tabs 
                    selectedKey={activeTab} 
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    variant="underlined"
                    classNames={{
                        tabList: "gap-2 sm:gap-4 lg:gap-6 w-full flex-wrap",
                        cursor: "w-full bg-gradient-to-r from-blue-500 to-purple-500",
                        tab: "max-w-fit px-3 sm:px-4 lg:px-6 h-10 sm:h-12",
                        tabContent: "text-xs sm:text-sm lg:text-base"
                    }}
                >
                    <Tab
                        key="overview"
                        title={
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaChartLine className="text-sm sm:text-base" />
                                <span className="hidden xs:inline">Overview</span>
                            </div>
                        }
                    >
                        {/* Overview Tab Content */}
                        <div className="mt-4 sm:mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {/* Left Column: Student Info - Takes full width on mobile, 2 cols on large screens */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                {student ? (
                                    <>
                                        {/* Student Profile Card - Responsive */}
                                        <Card className="shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-all duration-300">
                                            <CardBody className="p-4 sm:p-6 lg:p-8">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <Avatar
                                                            icon={<FaChild className="text-2xl sm:text-3xl lg:text-4xl" />}
                                                            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-400 to-purple-500 text-white"
                                                        />
                                                        <div>
                                                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">{student.name}</h2>
                                                            <p className="text-xs sm:text-sm text-gray-500 break-all">ID: {student.id.substring(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        color="primary"
                                                        variant="flat"
                                                        size="sm"
                                                        startContent={<FaEye />}
                                                        onPress={() => viewDetails(student, 'student')}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <span className="hidden sm:inline">View Full Profile</span>
                                                        <span className="sm:hidden">Profile</span>
                                                    </Button>
                                                </div>

                                                <Divider className="my-4 sm:my-6" />

                                                {/* Contact Info - Responsive Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                                                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                            <FaEnvelope className="text-blue-600 text-sm sm:text-base" />
                                                            <p className="text-xs sm:text-sm text-gray-600">Email</p>
                                                        </div>
                                                        <p className="font-semibold text-xs sm:text-sm lg:text-base break-all">{student.email || "Not provided"}</p>
                                                    </div>
                                                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                            <FaPhone className="text-purple-600 text-sm sm:text-base" />
                                                            <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                                                        </div>
                                                        <p className="font-semibold text-xs sm:text-sm lg:text-base">{student.phone || "Not provided"}</p>
                                                    </div>
                                                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                            <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
                                                            <p className="text-xs sm:text-sm text-gray-600">Status</p>
                                                        </div>
                                                        <Chip 
                                                            color={student.isVerified ? "success" : "warning"} 
                                                            variant="flat"
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            {student.isVerified ? "Verified" : "Pending"}
                                                        </Chip>
                                                    </div>
                                                    <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                            <FaUser className="text-orange-600 text-sm sm:text-base" />
                                                            <p className="text-xs sm:text-sm text-gray-600">Role</p>
                                                        </div>
                                                        <p className="font-semibold text-xs sm:text-sm lg:text-base capitalize">{student.role}</p>
                                                    </div>
                                                </div>

                                                <Divider className="my-4 sm:my-6" />

                                                {/* Stats Grid - Responsive */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                                                    <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                                                        <FaBook className="text-2xl sm:text-3xl lg:text-4xl mb-2" />
                                                        <p className="text-xs sm:text-sm opacity-90">Enrolled</p>
                                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{studentStats?.courses || 0}</p>
                                                    </div>
                                                    <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                                                        <FaTrophy className="text-2xl sm:text-3xl lg:text-4xl mb-2" />
                                                        <p className="text-xs sm:text-sm opacity-90">Progress</p>
                                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{studentStats?.progress || 0}%</p>
                                                    </div>
                                                    <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white col-span-2 sm:col-span-1">
                                                        <FaGraduationCap className="text-2xl sm:text-3xl lg:text-4xl mb-2" />
                                                        <p className="text-xs sm:text-sm opacity-90">Completed</p>
                                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{studentStats?.completedLessons || 0}</p>
                                                    </div>
                                                </div>

                                                {/* Overall Progress Bar - Responsive */}
                                                <div className="mt-4 sm:mt-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Overall Progress</span>
                                                        <span className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">{studentStats?.progress || 0}%</span>
                                                    </div>
                                                    <Progress
                                                        value={studentStats?.progress || 0}
                                                        color={(studentStats?.progress || 0) > 70 ? "success" : "warning"}
                                                        size="lg"
                                                        className="h-3 sm:h-4"
                                                    />
                                                </div>
                                            </CardBody>
                                        </Card>

                                        {/* Enrolled Courses - Responsive */}
                                        <Card className="shadow-lg">
                                            <CardHeader className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
                                                <h3 className="text-base sm:text-lg lg:text-xl font-bold">Enrolled Courses</h3>
                                                <Chip color="primary" variant="flat" size="sm">{enrollments.length}</Chip>
                                            </CardHeader>
                                            <CardBody className="px-0 py-0">
                                                {enrollments.length === 0 ? (
                                                    <div className="text-center py-8 sm:py-12 px-4">
                                                        <FaBook className="text-4xl sm:text-5xl lg:text-6xl mx-auto mb-3 sm:mb-4 text-gray-300" />
                                                        <p className="text-sm sm:text-base text-gray-500">No courses enrolled yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <Table 
                                                            aria-label="Enrolled courses"
                                                            className="min-w-full"
                                                            classNames={{
                                                                th: "text-xs sm:text-sm",
                                                                td: "text-xs sm:text-sm"
                                                            }}
                                                        >
                                                            <TableHeader>
                                                                <TableColumn>COURSE</TableColumn>
                                                                <TableColumn className="hidden sm:table-cell">ENROLLED</TableColumn>
                                                                <TableColumn>PROGRESS</TableColumn>
                                                                <TableColumn className="hidden md:table-cell">LAST ACCESS</TableColumn>
                                                                <TableColumn>ACTIONS</TableColumn>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {enrollments.map((enrollment) => (
                                                                    <TableRow key={enrollment._id}>
                                                                        <TableCell>
                                                                            <div className="max-w-[150px] sm:max-w-xs">
                                                                                <p className="font-semibold truncate text-xs sm:text-sm">{enrollment.courseId.title}</p>
                                                                                <p className="text-xs text-gray-500 sm:hidden">
                                                                                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                                                </p>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="hidden sm:table-cell">
                                                                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="w-20 sm:w-32">
                                                                                <Progress 
                                                                                    value={enrollment.progress || 0} 
                                                                                    color={enrollment.progress > 70 ? "success" : "warning"}
                                                                                    size="sm"
                                                                                />
                                                                                <p className="text-xs text-center mt-1">{enrollment.progress || 0}%</p>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="hidden md:table-cell">
                                                                            {enrollment.lastAccessedAt 
                                                                                ? new Date(enrollment.lastAccessedAt).toLocaleDateString()
                                                                                : 'Never'
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="light"
                                                                                color="primary"
                                                                                startContent={<FaEye />}
                                                                                onPress={() => viewDetails(enrollment, 'course')}
                                                                                className="min-w-0 p-2 sm:px-4"
                                                                            >
                                                                                <span className="hidden sm:inline">View</span>
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                                
                                                {/* Pagination */}
                                                {hasQuarterlyAccess && totalPages > 1 && (
                                                    <div className="px-4 py-4 flex flex-col items-center gap-4">
                                                        <Chip color="success" variant="flat" size="sm">
                                                            Premium All-Access: {allEnrollments.length} Courses
                                                        </Chip>
                                                        <Pagination
                                                            total={totalPages}
                                                            page={currentPage}
                                                            onChange={handlePageChange}
                                                            showControls
                                                            color="primary"
                                                            size="lg"
                                                        />
                                                        <p className="text-xs text-gray-500">
                                                            Showing {((currentPage - 1) * coursesPerPage) + 1} - {Math.min(currentPage * coursesPerPage, allEnrollments.length)} of {allEnrollments.length} courses
                                                        </p>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </>
                                ) : (
                                    <Card className="shadow-lg">
                                        <CardBody className="text-center py-12 sm:py-16 lg:py-20 px-4">
                                            <FaChild className="text-5xl sm:text-6xl lg:text-7xl mx-auto mb-4 sm:mb-6 opacity-20" />
                                            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-2">No Student Linked</p>
                                            <p className="text-sm sm:text-base text-gray-600 mb-4">Your auto-created student should appear here.</p>
                                            <p className="text-xs sm:text-sm text-gray-500">If you don't see a student linked, please contact support.</p>
                                        </CardBody>
                                    </Card>
                                )}
                            </div>

                            {/* Right Column: Guardian Info & Quick Actions - Responsive */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Guardian Account Card - Responsive */}
                                <Card className="shadow-lg border-l-4 border-purple-500">
                                    <CardHeader className="pb-2 sm:pb-3">
                                        <h3 className="font-bold text-base sm:text-lg lg:text-xl">Your Account</h3>
                                    </CardHeader>
                                    <CardBody className="pt-0 space-y-3 sm:space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Name</p>
                                            <p className="font-semibold text-sm sm:text-base">{guardian?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Email</p>
                                            <p className="font-semibold text-xs sm:text-sm break-all">{guardian?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Phone</p>
                                            <p className="font-semibold text-sm sm:text-base">{guardian?.phone || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Status</p>
                                            <Chip 
                                                color={guardian?.isVerified ? "success" : "warning"}
                                                variant="flat"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                {guardian?.isVerified ? "Verified" : "Pending"}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Payment Summary - Responsive */}
                                <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <CardHeader className="pb-2 sm:pb-3">
                                        <h3 className="font-bold text-base sm:text-lg lg:text-xl flex items-center gap-2">
                                            <FaMoneyBillWave className="text-green-600" />
                                            Payment Summary
                                        </h3>
                                    </CardHeader>
                                    <CardBody className="pt-0 space-y-3 sm:space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm text-gray-600">Total Payments</span>
                                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{studentStats?.totalPayments || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm text-gray-600">Approved</span>
                                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{studentStats?.approvedPayments || 0}</span>
                                        </div>
                                        <Divider />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs sm:text-sm font-medium text-gray-700">Total Spent</span>
                                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">৳{studentStats?.totalSpent.toLocaleString() || 0}</span>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Quick Actions - Responsive */}
                                <Card className="shadow-lg">
                                    <CardHeader className="pb-2 sm:pb-3">
                                        <h3 className="font-bold text-base sm:text-lg lg:text-xl">Quick Actions</h3>
                                    </CardHeader>
                                    <CardBody className="pt-0 space-y-2">
                                        <Button
                                            fullWidth
                                            variant="flat"
                                            color="primary"
                                            className="justify-start text-xs sm:text-sm"
                                            startContent={<FaCreditCard />}
                                            onPress={() => setActiveTab("payments")}
                                        >
                                            View All Payments
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="flat"
                                            color="secondary"
                                            className="justify-start text-xs sm:text-sm"
                                            startContent={<FaFileAlt />}
                                            onPress={() => setActiveTab("reports")}
                                        >
                                            Download Reports
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="flat"
                                            color="success"
                                            className="justify-start text-xs sm:text-sm"
                                            startContent={<FaUpload />}
                                            onPress={() => document.getElementById('file-upload')?.click()}
                                            isLoading={uploading}
                                        >
                                            Upload Document
                                        </Button>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={handleUploadFile}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                    </CardBody>
                                </Card>

                                {/* Info Card - Responsive */}
                                <Card className="bg-blue-50 border-2 border-blue-200">
                                    <CardBody className="p-4 sm:p-6">
                                        <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                                            ℹ️ Guardian-Student Link
                                        </h3>
                                        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                                            Each guardian account is linked to exactly one student. Your student was auto-created during registration.
                                        </p>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </Tab>

                    <Tab
                        key="payments"
                        title={
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaCreditCard className="text-sm sm:text-base" />
                                <span className="hidden xs:inline">Payments</span>
                            </div>
                        }
                    >
                        {/* Payments Tab - Responsive */}
                        <div className="mt-4 sm:mt-6 lg:mt-8">
                            <Card className="shadow-lg">
                                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                                    <h3 className="text-base sm:text-lg lg:text-xl font-bold">Payment History</h3>
                                </CardHeader>
                                <CardBody className="px-0 py-0">
                                    {payments.length === 0 ? (
                                        <div className="text-center py-8 sm:py-12 px-4">
                                            <FaCreditCard className="text-4xl sm:text-5xl lg:text-6xl mx-auto mb-3 sm:mb-4 text-gray-300" />
                                            <p className="text-sm sm:text-base text-gray-500">No payments found</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table 
                                                aria-label="Payment history"
                                                classNames={{
                                                    th: "text-xs sm:text-sm",
                                                    td: "text-xs sm:text-sm"
                                                }}
                                            >
                                                <TableHeader>
                                                    <TableColumn>DATE</TableColumn>
                                                    <TableColumn>PLAN TYPE</TableColumn>
                                                    <TableColumn className="hidden sm:table-cell">TRANSACTION ID</TableColumn>
                                                    <TableColumn>AMOUNT</TableColumn>
                                                    <TableColumn>STATUS</TableColumn>
                                                    <TableColumn>ACTIONS</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {payments.map((payment) => (
                                                        <TableRow key={payment._id}>
                                                            <TableCell>
                                                                <div className="text-xs sm:text-sm">
                                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip size="sm" variant="flat" className="capitalize text-xs">
                                                                    {payment.planType}
                                                                </Chip>
                                                            </TableCell>
                                                            <TableCell className="hidden sm:table-cell">
                                                                <span className="font-mono text-xs">{payment.transactionId}</span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-bold text-xs sm:text-sm">৳{payment.price.toLocaleString()}</span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    color={
                                                                        payment.paymentStatus === 'approved' ? 'success' :
                                                                        payment.paymentStatus === 'pending' ? 'warning' : 'danger'
                                                                    }
                                                                    variant="flat"
                                                                    size="sm"
                                                                    className="text-xs"
                                                                >
                                                                    {payment.paymentStatus}
                                                                </Chip>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="primary"
                                                                    startContent={<FaEye />}
                                                                    onPress={() => viewDetails(payment, 'payment')}
                                                                    className="min-w-0 p-2 sm:px-4"
                                                                >
                                                                    <span className="hidden sm:inline">View</span>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>

                    <Tab
                        key="reports"
                        title={
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaFileAlt className="text-sm sm:text-base" />
                                <span className="hidden xs:inline">Reports</span>
                            </div>
                        }
                    >
                        {/* Reports Tab - Responsive */}
                        <div className="mt-4 sm:mt-6 lg:mt-8">
                            <Card className="shadow-lg">
                                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                    <h3 className="text-base sm:text-lg lg:text-xl font-bold">Progress Reports & Documents</h3>
                                    <Button
                                        color="success"
                                        size="sm"
                                        startContent={<FaUpload />}
                                        onPress={() => document.getElementById('file-upload')?.click()}
                                        isLoading={uploading}
                                        className="text-xs sm:text-sm"
                                    >
                                        <span className="hidden sm:inline">Upload</span>
                                    </Button>
                                </CardHeader>
                                <CardBody className="p-4 sm:p-6">
                                    {reports.length === 0 ? (
                                        <div className="text-center py-8 sm:py-12">
                                            <FaFileAlt className="text-4xl sm:text-5xl lg:text-6xl mx-auto mb-3 sm:mb-4 text-gray-300" />
                                            <p className="text-sm sm:text-base text-gray-500">No reports available</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                                            {reports.map((report) => (
                                                <Card key={report._id} className="border-2 hover:border-blue-400 transition-all">
                                                    <CardBody className="p-4 sm:p-5">
                                                        <FaFileAlt className="text-3xl sm:text-4xl text-blue-500 mb-3 sm:mb-4" />
                                                        <h4 className="font-bold text-sm sm:text-base mb-2 line-clamp-2">{report.title}</h4>
                                                        <p className="text-xs text-gray-600 mb-1 capitalize">{report.type}</p>
                                                        <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                                                            {new Date(report.generatedAt).toLocaleDateString()}
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaDownload />}
                                                            onPress={() => handleDownloadReport(report._id)}
                                                            className="text-xs sm:text-sm"
                                                        >
                                                            Download
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>
                </Tabs>

                {/* Details Modal - Responsive */}
                <Modal 
                    isOpen={isOpen} 
                    onClose={onClose}
                    size="2xl"
                    scrollBehavior="inside"
                    classNames={{
                        base: "mx-2 sm:mx-4",
                        body: "py-4 sm:py-6"
                    }}
                >
                    <ModalContent>
                        <ModalHeader className="flex justify-between items-center text-base sm:text-lg lg:text-xl">
                            <span>{selectedItem?.type === 'student' ? 'Student Profile' : 
                                   selectedItem?.type === 'course' ? 'Course Details' : 
                                   selectedItem?.type === 'payment' ? 'Payment Details' : 'Details'}</span>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={onClose}
                            >
                                <FaTimes />
                            </Button>
                        </ModalHeader>
                        <ModalBody>
                            {selectedItem && (
                                <div className="space-y-3 sm:space-y-4">
                                    {selectedItem.type === 'student' && (
                                        <>
                                            <div className="text-center mb-4 sm:mb-6">
                                                <Avatar
                                                    icon={<FaChild className="text-3xl sm:text-4xl" />}
                                                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-400 to-purple-500"
                                                />
                                                <h3 className="text-xl sm:text-2xl font-bold">{selectedItem.name}</h3>
                                            </div>
                                            <Divider />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Student ID</p>
                                                    <p className="font-mono text-xs sm:text-sm break-all">{selectedItem.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Email</p>
                                                    <p className="font-semibold text-xs sm:text-sm break-all">{selectedItem.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                                                    <p className="font-semibold text-xs sm:text-sm">{selectedItem.phone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Verification Status</p>
                                                    <Chip color={selectedItem.isVerified ? "success" : "warning"} size="sm" className="text-xs">
                                                        {selectedItem.isVerified ? "Verified" : "Pending"}
                                                    </Chip>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {selectedItem.type === 'course' && (
                                        <>
                                            <h3 className="text-lg sm:text-xl font-bold">{selectedItem.courseId.title}</h3>
                                            <Divider />
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Enrollment Date</p>
                                                    <p className="font-semibold text-sm sm:text-base">{new Date(selectedItem.enrolledAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-2">Progress</p>
                                                    <Progress value={selectedItem.progress || 0} color="success" size="lg" />
                                                    <p className="text-right text-xs sm:text-sm font-bold mt-1">{selectedItem.progress || 0}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Last Accessed</p>
                                                    <p className="font-semibold text-sm sm:text-base">
                                                        {selectedItem.lastAccessedAt 
                                                            ? new Date(selectedItem.lastAccessedAt).toLocaleDateString()
                                                            : 'Never accessed'
                                                        }
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
                                                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg text-center">
                                                        <p className="text-xs text-gray-600 mb-1">Completed</p>
                                                        <p className="text-xl sm:text-2xl font-bold text-blue-600">{selectedItem.completedLessons || 0}</p>
                                                    </div>
                                                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
                                                        <p className="text-xs text-gray-600 mb-1">Total Lessons</p>
                                                        <p className="text-xl sm:text-2xl font-bold text-purple-600">{selectedItem.totalLessons || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedItem.type === 'payment' && (
                                        <>
                                            <div className="text-center mb-4 sm:mb-6">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                                    <FaCreditCard className="text-2xl sm:text-3xl text-white" />
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl font-bold text-green-600">৳{selectedItem.price.toLocaleString()}</h3>
                                            </div>
                                            <Divider />
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                                                    <p className="font-mono text-xs sm:text-sm break-all">{selectedItem.transactionId}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Plan Type</p>
                                                    <Chip size="sm" variant="flat" className="capitalize text-xs">{selectedItem.planType}</Chip>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                                                    <Chip
                                                        color={
                                                            selectedItem.paymentStatus === 'approved' ? 'success' :
                                                            selectedItem.paymentStatus === 'pending' ? 'warning' : 'danger'
                                                        }
                                                        size="sm"
                                                        className="text-xs"
                                                    >
                                                        {selectedItem.paymentStatus}
                                                    </Chip>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Payment Date</p>
                                                    <p className="font-semibold text-sm sm:text-base">{new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</p>
                                                </div>
                                                {selectedItem.courseId && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Course</p>
                                                        <p className="font-semibold text-sm sm:text-base">{selectedItem.courseId.title}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={onClose} size="sm" className="text-xs sm:text-sm">
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}

export default function GuardianDashboard() {
    return (
        <RequireAuth allowedRoles={["guardian"]}>
            <GuardianDashboardContent />
        </RequireAuth>
    );
}
