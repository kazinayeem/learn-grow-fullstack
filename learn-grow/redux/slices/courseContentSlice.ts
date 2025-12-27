import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Lecture {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number; // minutes
    order: number;
    isPreview: boolean; // Can be watched without enrollment
}

export interface Module {
    id: string;
    courseId: string;
    title: string;
    description: string;
    order: number;
    lectures: Lecture[];
}

export interface LectureProgress {
    id: string;
    userId: string;
    lectureId: string;
    moduleId: string;
    courseId: string;
    watchedDuration: number; // seconds
    totalDuration: number; // seconds
    completed: boolean;
    lastWatchedAt: string;
}

interface CourseContentState {
    modules: Module[];
    lectureProgress: LectureProgress[];
}

const initialState: CourseContentState = {
    modules: [],
    lectureProgress: [],
};

const courseContentSlice = createSlice({
    name: "courseContent",
    initialState,
    reducers: {
        addModule: (state, action: PayloadAction<Module>) => {
            state.modules.push(action.payload);
        },
        updateModule: (
            state,
            action: PayloadAction<{ id: string; updates: Partial<Module> }>
        ) => {
            const moduleIndex = state.modules.findIndex((m) => m.id === action.payload.id);
            if (moduleIndex !== -1) {
                state.modules[moduleIndex] = {
                    ...state.modules[moduleIndex],
                    ...action.payload.updates,
                };
            }
        },
        deleteModule: (state, action: PayloadAction<{ id: string }>) => {
            state.modules = state.modules.filter((m) => m.id !== action.payload.id);
        },
        addLecture: (
            state,
            action: PayloadAction<{ moduleId: string; lecture: Lecture }>
        ) => {
            const module = state.modules.find((m) => m.id === action.payload.moduleId);
            if (module) {
                module.lectures.push(action.payload.lecture);
            }
        },
        updateLectureProgress: (state, action: PayloadAction<LectureProgress>) => {
            const existingProgress = state.lectureProgress.find(
                (p) => p.lectureId === action.payload.lectureId && p.userId === action.payload.userId
            );

            if (existingProgress) {
                Object.assign(existingProgress, action.payload);
            } else {
                state.lectureProgress.push(action.payload);
            }
        },
        markLectureComplete: (
            state,
            action: PayloadAction<{ lectureId: string; userId: string }>
        ) => {
            const progress = state.lectureProgress.find(
                (p) => p.lectureId === action.payload.lectureId && p.userId === action.payload.userId
            );
            if (progress) {
                progress.completed = true;
                progress.watchedDuration = progress.totalDuration;
            }
        },
        loadModules: (state, action: PayloadAction<Module[]>) => {
            state.modules = action.payload;
        },
        loadLectureProgress: (state, action: PayloadAction<LectureProgress[]>) => {
            state.lectureProgress = action.payload;
        },
    },
});

export const {
    addModule,
    updateModule,
    deleteModule,
    addLecture,
    updateLectureProgress,
    markLectureComplete,
    loadModules,
    loadLectureProgress,
} = courseContentSlice.actions;

export default courseContentSlice.reducer;
