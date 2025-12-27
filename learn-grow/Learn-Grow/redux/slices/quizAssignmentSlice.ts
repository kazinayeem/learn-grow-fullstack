import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type QuizType = "quiz" | "mid-exam" | "final-exam";
export type AssignmentType = "assignment" | "project";

export interface Question {
    id: string;
    type: "multiple-choice" | "true-false" | "short-answer";
    question: string;
    options?: string[]; // For multiple choice
    correctAnswer: string | number;
    points: number;
}

export interface Quiz {
    id: string;
    type: QuizType;
    courseId: string;
    title: string;
    description: string;
    questions: Question[];
    passingScore: number; // Percentage
    timeLimit?: number; // Minutes
    createdAt: string;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    answers: { questionId: string; answer: string | number }[];
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    startedAt: string;
    completedAt: string;
    timeSpent: number; // Seconds
}

export interface Assignment {
    id: string;
    type: AssignmentType;
    courseId: string;
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
    createdAt: string;
}

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    userId: string;
    content: string;
    fileUrl?: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
    gradedAt?: string;
}

interface QuizAssignmentState {
    quizzes: Quiz[];
    quizAttempts: QuizAttempt[];
    assignments: Assignment[];
    submissions: AssignmentSubmission[];
}

const initialState: QuizAssignmentState = {
    quizzes: [],
    quizAttempts: [],
    assignments: [],
    submissions: [],
};

const quizAssignmentSlice = createSlice({
    name: "quizAssignment",
    initialState,
    reducers: {
        addQuiz: (state, action: PayloadAction<Quiz>) => {
            state.quizzes.push(action.payload);
        },
        submitQuizAttempt: (state, action: PayloadAction<QuizAttempt>) => {
            state.quizAttempts.push(action.payload);
        },
        addAssignment: (state, action: PayloadAction<Assignment>) => {
            state.assignments.push(action.payload);
        },
        submitAssignment: (state, action: PayloadAction<AssignmentSubmission>) => {
            state.submissions.push(action.payload);
        },
        gradeAssignment: (
            state,
            action: PayloadAction<{
                submissionId: string;
                grade: number;
                feedback: string;
            }>
        ) => {
            const submission = state.submissions.find(
                (s) => s.id === action.payload.submissionId
            );
            if (submission) {
                submission.grade = action.payload.grade;
                submission.feedback = action.payload.feedback;
                submission.gradedAt = new Date().toISOString();
            }
        },
        loadQuizzes: (state, action: PayloadAction<Quiz[]>) => {
            state.quizzes = action.payload;
        },
        loadQuizAttempts: (state, action: PayloadAction<QuizAttempt[]>) => {
            state.quizAttempts = action.payload;
        },
        loadAssignments: (state, action: PayloadAction<Assignment[]>) => {
            state.assignments = action.payload;
        },
        loadSubmissions: (state, action: PayloadAction<AssignmentSubmission[]>) => {
            state.submissions = action.payload;
        },
    },
});

export const {
    addQuiz,
    submitQuizAttempt,
    addAssignment,
    submitAssignment,
    gradeAssignment,
    loadQuizzes,
    loadQuizAttempts,
    loadAssignments,
    loadSubmissions,
} = quizAssignmentSlice.actions;

export default quizAssignmentSlice.reducer;
