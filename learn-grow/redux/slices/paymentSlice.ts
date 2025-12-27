import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Payment {
    id: string;
    courseId: string;
    amount: number;
    method: "bkash" | "nagad" | "card";
    status: "pending" | "completed" | "failed";
    transactionId?: string;
    createdAt: string;
    completedAt?: string;
}

interface PaymentState {
    payments: Payment[];
    currentPayment: Payment | null;
}

const initialState: PaymentState = {
    payments: [],
    currentPayment: null,
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        initiatePayment: (
            state,
            action: PayloadAction<{
                courseId: string;
                amount: number;
                method: "bkash" | "nagad" | "card";
            }>
        ) => {
            const payment: Payment = {
                id: `PAY-${Date.now()}`,
                courseId: action.payload.courseId,
                amount: action.payload.amount,
                method: action.payload.method,
                status: "pending",
                createdAt: new Date().toISOString(),
            };
            state.currentPayment = payment;
            state.payments.push(payment);
        },
        completePayment: (
            state,
            action: PayloadAction<{
                paymentId: string;
                transactionId: string;
            }>
        ) => {
            const payment = state.payments.find((p) => p.id === action.payload.paymentId);
            if (payment) {
                payment.status = "completed";
                payment.transactionId = action.payload.transactionId;
                payment.completedAt = new Date().toISOString();
            }
            if (state.currentPayment?.id === action.payload.paymentId) {
                state.currentPayment = null;
            }
        },
        failPayment: (state, action: PayloadAction<{ paymentId: string }>) => {
            const payment = state.payments.find((p) => p.id === action.payload.paymentId);
            if (payment) {
                payment.status = "failed";
            }
            if (state.currentPayment?.id === action.payload.paymentId) {
                state.currentPayment = null;
            }
        },
        loadPayments: (state, action: PayloadAction<Payment[]>) => {
            state.payments = action.payload;
        },
    },
});

export const { initiatePayment, completePayment, failPayment, loadPayments } =
    paymentSlice.actions;
export default paymentSlice.reducer;
