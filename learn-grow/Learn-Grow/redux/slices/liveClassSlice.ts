import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LiveClass {
    id: string;
    courseId: string;
    title: string;
    description: string;
    instructor: string;
    scheduledAt: string;
    duration: number; // minutes
    platform: "zoom" | "google-meet" | "teams";
    meetingLink: string;
    meetingId?: string;
    password?: string;
    status: "scheduled" | "live" | "completed" | "cancelled";
    recordingUrl?: string;
    createdAt: string;
}

export interface ClassAttendance {
    id: string;
    classId: string;
    userId: string;
    joinedAt: string;
    leftAt?: string;
    duration?: number; // minutes
}

interface LiveClassState {
    classes: LiveClass[];
    attendance: ClassAttendance[];
}

const initialState: LiveClassState = {
    classes: [],
    attendance: [],
};

const liveClassSlice = createSlice({
    name: "liveClass",
    initialState,
    reducers: {
        addClass: (state, action: PayloadAction<LiveClass>) => {
            state.classes.push(action.payload);
        },
        updateClass: (
            state,
            action: PayloadAction<{ id: string; updates: Partial<LiveClass> }>
        ) => {
            const classIndex = state.classes.findIndex((c) => c.id === action.payload.id);
            if (classIndex !== -1) {
                state.classes[classIndex] = {
                    ...state.classes[classIndex],
                    ...action.payload.updates,
                };
            }
        },
        deleteClass: (state, action: PayloadAction<{ id: string }>) => {
            state.classes = state.classes.filter((c) => c.id !== action.payload.id);
        },
        recordAttendance: (state, action: PayloadAction<ClassAttendance>) => {
            state.attendance.push(action.payload);
        },
        loadClasses: (state, action: PayloadAction<LiveClass[]>) => {
            state.classes = action.payload;
        },
        loadAttendance: (state, action: PayloadAction<ClassAttendance[]>) => {
            state.attendance = action.payload;
        },
    },
});

export const {
    addClass,
    updateClass,
    deleteClass,
    recordAttendance,
    loadClasses,
    loadAttendance,
} = liveClassSlice.actions;

export default liveClassSlice.reducer;
