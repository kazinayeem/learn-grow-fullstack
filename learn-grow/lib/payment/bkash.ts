// bKash Payment Integration
// API Documentation: https://developer.bka.sh/

export interface BkashPaymentRequest {
    amount: number;
    courseId: string;
    courseName: string;
    userId: string;
    userEmail: string;
}

export interface BkashPaymentResponse {
    paymentID: string;
    bkashURL: string;
    statusCode: string;
    statusMessage: string;
}

export class BkashPayment {
    private appKey: string;
    private appSecret: string;
    private username: string;
    private password: string;
    private baseURL: string;
    private idToken: string = "";

    constructor() {
        // These should be in environment variables
        this.appKey = process.env.NEXT_PUBLIC_BKASH_APP_KEY || "";
        this.appSecret = process.env.NEXT_PUBLIC_BKASH_APP_SECRET || "";
        this.username = process.env.NEXT_PUBLIC_BKASH_USERNAME || "";
        this.password = process.env.NEXT_PUBLIC_BKASH_PASSWORD || "";
        this.baseURL = process.env.NEXT_PUBLIC_BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
    }

    // Grant Token
    async grantToken(): Promise<string> {
        try {
            const response = await fetch(`${this.baseURL}/tokenized/checkout/token/grant`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    username: this.username,
                    password: this.password,
                },
                body: JSON.stringify({
                    app_key: this.appKey,
                    app_secret: this.appSecret,
                }),
            });

            const data = await response.json();
            if (data.id_token) {
                this.idToken = data.id_token;
                return data.id_token;
            }
            throw new Error("Failed to get bKash token");
        } catch (error) {
            console.error("bKash Grant Token Error:", error);
            throw error;
        }
    }

    // Create Payment
    async createPayment(paymentData: BkashPaymentRequest): Promise<BkashPaymentResponse> {
        // Mock functionality for demo/testing if keys are missing
        if (!this.appKey || !this.appSecret) {
            console.warn("bKash keys missing. Using MOCK payment flow.");
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
                paymentID: `MOCK-PAY-${Date.now()}`,
                bkashURL: `${window.location.origin}/payment/bkash/callback?paymentID=MOCK-PAY-${Date.now()}&status=success`,
                statusCode: "0000",
                statusMessage: "Successful (Mock)",
            };
        }

        try {
            if (!this.idToken) {
                await this.grantToken();
            }

            const response = await fetch(`${this.baseURL}/tokenized/checkout/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.idToken,
                    "X-APP-Key": this.appKey,
                },
                body: JSON.stringify({
                    mode: "0011", // Wallet payment
                    payerReference: paymentData.userId,
                    callbackURL: `${window.location.origin}/payment/bkash/callback`,
                    amount: paymentData.amount.toString(),
                    currency: "BDT",
                    intent: "sale",
                    merchantInvoiceNumber: `INV-${Date.now()}`,
                }),
            });

            const data = await response.json();

            if (data.statusCode === "0000") {
                return {
                    paymentID: data.paymentID,
                    bkashURL: data.bkashURL,
                    statusCode: data.statusCode,
                    statusMessage: data.statusMessage,
                };
            }

            throw new Error(data.statusMessage || "Payment creation failed");
        } catch (error) {
            console.error("bKash Create Payment Error:", error);
            throw error;
        }
    }

    // Execute Payment
    async executePayment(paymentID: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/tokenized/checkout/execute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.idToken,
                    "X-APP-Key": this.appKey,
                },
                body: JSON.stringify({
                    paymentID,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("bKash Execute Payment Error:", error);
            throw error;
        }
    }

    // Query Payment
    async queryPayment(paymentID: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/tokenized/checkout/payment/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.idToken,
                    "X-APP-Key": this.appKey,
                },
                body: JSON.stringify({
                    paymentID,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("bKash Query Payment Error:", error);
            throw error;
        }
    }
}

export const bkashPayment = new BkashPayment();
