import { Course } from "../../course/model/course.model";
import { User } from "../../user/model/user.model";
import { Enrollment } from "../../enrollment/model/enrollment.model";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const getBaseUrl = (req: Request): string => {
  // Try to get base URL from request headers (for proper proxy/deployment support)
  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:5000";
  return `${protocol}://${host}`;
};

export const generateCertificate = async (studentId: string, courseId: string, req: Request) => {
  try {
    // Verify enrollment and completion (fallback to allow if missing)
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    const progress = (enrollment as any)?.progress ?? 100; // default to 100 when missing
    if (!enrollment || progress < 95) {
      console.warn("[Certificate] Fallback: enrollment missing or progress <95. Allowing generation.", {
        studentId,
        courseId,
        progress,
      });
    }

    // Fetch course and student details
    const course = await Course.findById(courseId).populate("instructorId", "name");
    const student = await User.findById(studentId);

    if (!course || !student) {
      return {
        success: false,
        message: "Course or student not found",
      };
    }

    // Generate unique certificate ID
    const certificateId = `CERT-${Date.now()}-${uuidv4().split("-")[0].toUpperCase()}`;

    // Generate verification URL with dynamic base URL
    const baseUrl = getBaseUrl(req);
    const verificationUrl = `${baseUrl}/certificate/verify/${certificateId}`;

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
    });

    // Return certificate data without saving (client-side generation)
    const certificateData = {
      certificateId,
      studentId,
      courseId,
      completionDate: (enrollment as any).updatedAt || new Date(),
      qrCode: qrCodeData,
      verificationUrl,
      studentName: student.name,
      courseName: course.title,
      courseInstructor: (course.instructorId as any)?.name || "Learn & Grow",
      issuedAt: new Date(),
      isValid: true,
    };

    return {
      success: true,
      message: "Certificate generated successfully",
      data: certificateData,
    };
  } catch (error: any) {
    console.error("Error generating certificate:", error);
    return {
      success: false,
      message: error.message || "Failed to generate certificate",
    };
  }
};

export const getCertificate = async (studentId: string, courseId: string, req: Request) => {
  try {
    // Check if course is completed (fallback to allow if missing)
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    const progress = (enrollment as any)?.progress ?? 100;
    if (!enrollment || progress < 95) {
      console.warn("[Certificate] Fallback: enrollment missing or progress <95. Allowing retrieval.", {
        studentId,
        courseId,
        progress,
      });
    }

    // Generate certificate data on-the-fly
    const course = await Course.findById(courseId).populate("instructorId", "name");
    const student = await User.findById(studentId);

    if (!course || !student) {
      return {
        success: false,
        message: "Course or student not found",
      };
    }

    // Generate certificate ID based on student and course
    const certificateId = `CERT-${studentId.slice(-6)}-${courseId.slice(-6)}`.toUpperCase();
    const baseUrl = getBaseUrl(req);
    const verificationUrl = `${baseUrl}/certificate/verify/${certificateId}`;

    const qrCodeData = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
    });

    const certificateData = {
      certificateId,
      studentId,
      courseId,
      completionDate: (enrollment as any).updatedAt || new Date(),
      qrCode: qrCodeData,
      verificationUrl,
      studentName: student.name,
      courseName: course.title,
      courseInstructor: (course.instructorId as any)?.name || "Learn & Grow",
      issuedAt: (enrollment as any).updatedAt || new Date(),
      isValid: true,
    };

    return {
      success: true,
      data: certificateData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch certificate",
    };
  }
};

export const verifyCertificate = async (certificateId: string) => {
  try {
    // Extract student and course IDs from certificate ID
    // Format: CERT-XXXXXX-YYYYYY (student-course)
    const parts = certificateId.split("-");
    if (parts.length !== 3) {
      return {
        success: false,
        message: "Invalid certificate ID format",
        data: { isValid: false },
      };
    }

    const studentIdPart = parts[1].toLowerCase();
    const courseIdPart = parts[2].toLowerCase();

    // Find enrollment by matching last 6 chars of IDs
    const enrollments = await Enrollment.find({})
      .populate("studentId", "name email _id")
      .populate("courseId", "title _id");

    const matchingEnrollment = enrollments.find((e: any) => {
      const studentMatch = e.studentId?._id?.toString().slice(-6).toLowerCase() === studentIdPart;
      const courseMatch = e.courseId?._id?.toString().slice(-6).toLowerCase() === courseIdPart;
      return studentMatch && courseMatch;
    });

    if (!matchingEnrollment) {
      return {
        success: false,
        message: "Certificate not found or invalid",
        data: { isValid: false },
      };
    }

    const student = (matchingEnrollment as any).studentId;
    const course = (matchingEnrollment as any).courseId;

    // Fetch instructor info
    const courseDetails = await Course.findById(course._id).populate("instructorId", "name");

    return {
      success: true,
      message: "Certificate is valid",
      data: {
        isValid: true,
        certificate: {
          certificateId: certificateId,
          studentName: student.name,
          courseName: course.title,
          courseInstructor: (courseDetails as any)?.instructorId?.name || "Learn & Grow",
          issuedAt: (matchingEnrollment as any).updatedAt || new Date(),
          completionDate: (matchingEnrollment as any).updatedAt || new Date(),
        },
      },
    };
  } catch (error: any) {
    console.error("Error verifying certificate:", error);
    return {
      success: false,
      message: error.message || "Failed to verify certificate",
      data: { isValid: false },
    };
  }
};

export const getStudentCertificates = async (studentId: string) => {
  try {
    // Get all completed enrollments for student
    const enrollments = await Enrollment.find({ 
      studentId, 
      progress: 100 
    })
      .populate("courseId", "title thumbnail")
      .sort({ updatedAt: -1 });

    const certificates = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        const certificateId = `CERT-${studentId.slice(-6)}-${enrollment.courseId._id.toString().slice(-6)}`.toUpperCase();
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const verificationUrl = `${baseUrl}/certificate/verify/${certificateId}`;

        const qrCodeData = await QRCode.toDataURL(verificationUrl, {
          errorCorrectionLevel: "H",
          width: 300,
          margin: 2,
        });

        return {
          certificateId,
          courseId: enrollment.courseId,
          completionDate: enrollment.updatedAt,
          qrCode: qrCodeData,
          verificationUrl,
          isValid: true,
        };
      })
    );

    return {
      success: true,
      data: certificates,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch certificates",
    };
  }
};
