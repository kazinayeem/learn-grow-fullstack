import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EnrolledCourse {
    courseId: string;
    enrolledAt: string;
    progress: number;
    completed: boolean;
}

interface EnrollmentState {
    enrolledCourses: EnrolledCourse[];
}

const initialState: EnrollmentState = {
    enrolledCourses: [],
};

const enrollmentSlice = createSlice({
    name: "enrollment",
    initialState,
    reducers: {
        enrollInCourse: (state, action: PayloadAction<{ courseId: string }>) => {
            const exists = state.enrolledCourses.find(
                (e) => e.courseId === action.payload.courseId
            );
            if (!exists) {
                state.enrolledCourses.push({
                    courseId: action.payload.courseId,
                    enrolledAt: new Date().toISOString(),
                    progress: 0,
                    completed: false,
                });
            }
        },
        updateProgress: (
            state,
            action: PayloadAction<{ courseId: string; progress: number }>
        ) => {
            const course = state.enrolledCourses.find(
                (e) => e.courseId === action.payload.courseId
            );
            if (course) {
                course.progress = action.payload.progress;
                if (action.payload.progress >= 100) {
                    course.completed = true;
                }
            }
        },
        unenrollFromCourse: (state, action: PayloadAction<{ courseId: string }>) => {
            state.enrolledCourses = state.enrolledCourses.filter(
                (e) => e.courseId !== action.payload.courseId
            );
        },
        loadEnrollments: (state, action: PayloadAction<EnrolledCourse[]>) => {
            state.enrolledCourses = action.payload;
        },
    },
});

export const { enrollInCourse, updateProgress, unenrollFromCourse, loadEnrollments } =
    enrollmentSlice.actions;
export default enrollmentSlice.reducer;
