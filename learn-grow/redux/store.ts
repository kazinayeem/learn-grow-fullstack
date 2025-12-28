import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { userApi } from "./api/userApi";
import { quizApi } from "./api/quizApi";
import enrollmentReducer, { loadEnrollments } from "./slices/enrollmentSlice";
import paymentReducer, { loadPayments } from "./slices/paymentSlice";
import quizAssignmentReducer, {
    loadQuizzes,
    loadQuizAttempts,
    loadAssignments,
    loadSubmissions,
} from "./slices/quizAssignmentSlice";
import liveClassReducer, { loadClasses, loadAttendance } from "./slices/liveClassSlice";
import courseContentReducer, {
    loadModules,
    loadLectureProgress,
} from "./slices/courseContentSlice";

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [quizApi.reducerPath]: quizApi.reducer,
        enrollment: enrollmentReducer,
        payment: paymentReducer,
        quizAssignment: quizAssignmentReducer,
        liveClass: liveClassReducer,
        courseContent: courseContentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware, userApi.middleware, quizApi.middleware),
});

// Load data from localStorage on initialization
if (typeof window !== "undefined") {
    // Enrollments
    const savedEnrollments = localStorage.getItem("enrollments");
    if (savedEnrollments) {
        try {
            store.dispatch(loadEnrollments(JSON.parse(savedEnrollments)));
        } catch (e) {
            console.error("Failed to load enrollments", e);
        }
    }

    // Payments
    const savedPayments = localStorage.getItem("payments");
    if (savedPayments) {
        try {
            store.dispatch(loadPayments(JSON.parse(savedPayments)));
        } catch (e) {
            console.error("Failed to load payments", e);
        }
    }

    // Quizzes
    const savedQuizzes = localStorage.getItem("quizzes");
    if (savedQuizzes) {
        try {
            store.dispatch(loadQuizzes(JSON.parse(savedQuizzes)));
        } catch (e) {
            console.error("Failed to load quizzes", e);
        }
    }

    // Quiz Attempts
    const savedQuizAttempts = localStorage.getItem("quizAttempts");
    if (savedQuizAttempts) {
        try {
            store.dispatch(loadQuizAttempts(JSON.parse(savedQuizAttempts)));
        } catch (e) {
            console.error("Failed to load quiz attempts", e);
        }
    }

    // Assignments
    const savedAssignments = localStorage.getItem("assignments");
    if (savedAssignments) {
        try {
            store.dispatch(loadAssignments(JSON.parse(savedAssignments)));
        } catch (e) {
            console.error("Failed to load assignments", e);
        }
    }

    // Submissions
    const savedSubmissions = localStorage.getItem("submissions");
    if (savedSubmissions) {
        try {
            store.dispatch(loadSubmissions(JSON.parse(savedSubmissions)));
        } catch (e) {
            console.error("Failed to load submissions", e);
        }
    }

    // Live Classes
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses) {
        try {
            store.dispatch(loadClasses(JSON.parse(savedClasses)));
        } catch (e) {
            console.error("Failed to load classes", e);
        }
    }

    // Class Attendance
    const savedAttendance = localStorage.getItem("attendance");
    if (savedAttendance) {
        try {
            store.dispatch(loadAttendance(JSON.parse(savedAttendance)));
        } catch (e) {
            console.error("Failed to load attendance", e);
        }
    }

    // Course Modules
    const savedModules = localStorage.getItem("modules");
    if (savedModules) {
        try {
            store.dispatch(loadModules(JSON.parse(savedModules)));
        } catch (e) {
            console.error("Failed to load modules", e);
        }
    }

    // Lecture Progress
    const savedLectureProgress = localStorage.getItem("lectureProgress");
    if (savedLectureProgress) {
        try {
            store.dispatch(loadLectureProgress(JSON.parse(savedLectureProgress)));
        } catch (e) {
            console.error("Failed to load lecture progress", e);
        }
    }
}

// Subscribe to store changes and save to localStorage
if (typeof window !== "undefined") {
    store.subscribe(() => {
        const state = store.getState();
        try {
            localStorage.setItem(
                "enrollments",
                JSON.stringify(state.enrollment.enrolledCourses)
            );
            localStorage.setItem("payments", JSON.stringify(state.payment.payments));
            localStorage.setItem(
                "quizzes",
                JSON.stringify(state.quizAssignment.quizzes)
            );
            localStorage.setItem(
                "quizAttempts",
                JSON.stringify(state.quizAssignment.quizAttempts)
            );
            localStorage.setItem(
                "assignments",
                JSON.stringify(state.quizAssignment.assignments)
            );
            localStorage.setItem(
                "submissions",
                JSON.stringify(state.quizAssignment.submissions)
            );
            localStorage.setItem("classes", JSON.stringify(state.liveClass.classes));
            localStorage.setItem(
                "attendance",
                JSON.stringify(state.liveClass.attendance)
            );
            localStorage.setItem(
                "modules",
                JSON.stringify(state.courseContent.modules)
            );
            localStorage.setItem(
                "lectureProgress",
                JSON.stringify(state.courseContent.lectureProgress)
            );
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
