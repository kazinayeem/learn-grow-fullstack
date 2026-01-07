// Nagad Payment Integration
// API Documentation: https://developer.nagad.com.bd/

export interface NagadPaymentRequest {
    amount: number;
    courseId: string;
    courseName: string;
    userId: string;
    userEmail: string;
}

export interface NagadPaymentResponse {
    paymentReferenceId: string;
    callBackUrl: string;
    status: string;
    message: string;
}

export class NagadPayment {
    private merchantId: string;
    private merchantNumber: string;
    private publicKey: string;
    private privateKey: string;
    private baseURL: string;

    constructor() {
        // These should be in environment variables
        this.merchantId = process.env.NEXT_PUBLIC_NAGAD_MERCHANT_ID || "";
        this.merchantNumber = process.env.NEXT_PUBLIC_NAGAD_MERCHANT_NUMBER || "";
        this.publicKey = process.env.NEXT_PUBLIC_NAGAD_PUBLIC_KEY || "";
        this.privateKey = process.env.NEXT_PUBLIC_NAGAD_PRIVATE_KEY || "";
        this.baseURL = process.env.NEXT_PUBLIC_NAGAD_BASE_URL || "https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs";
    }

    // Initialize Payment
    async initializePayment(paymentData: NagadPaymentRequest): Promise<NagadPaymentResponse> {
        // Mock functionality for demo/testing if keys are missing
        if (!this.merchantId) {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
                paymentReferenceId: `MOCK-REF-${Date.now()}`,
                callBackUrl: `${window.location.origin}/payment/nagad/callback?payment_ref_id=MOCK-REF-${Date.now()}&status=Success`,
                status: "Success",
                message: "Successful (Mock)",
            };
        }

        try {
            const orderId = `ORD-${Date.now()}`;
            const timestamp = Date.now().toString();

            const response = await fetch(`${this.baseURL}/check-out/initialize/${this.merchantId}/${orderId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-KM-Api-Version": "v-0.2.0",
                    "X-KM-IP-V4": await this.getClientIP(),
                    "X-KM-Client-Type": "PC_WEB",
                },
                body: JSON.stringify({
                    merchantId: this.merchantId,
                    datetime: timestamp,
                    orderId: orderId,
                    challenge: this.generateChallenge(),
                }),
            });

            const data = await response.json();

            if (data.status === "Success") {
                // Complete payment
                return await this.completePayment(orderId, paymentData);
            }

            throw new Error(data.message || "Payment initialization failed");
        } catch (error) {
            throw error;
        }
    }

    // Complete Payment
    private async completePayment(
        orderId: string,
        paymentData: NagadPaymentRequest
    ): Promise<NagadPaymentResponse> {
        try {
            const response = await fetch(`${this.baseURL}/check-out/complete/${orderId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-KM-Api-Version": "v-0.2.0",
                },
                body: JSON.stringify({
                    merchantId: this.merchantId,
                    orderId: orderId,
                    amount: paymentData.amount.toString(),
                    currencyCode: "050", // BDT
                    challenge: this.generateChallenge(),
                    productDetails: paymentData.courseName,
                    merchantCallbackURL: `${window.location.origin}/payment/nagad/callback`,
                }),
            });

            const data = await response.json();

            if (data.status === "Success") {
                return {
                    paymentReferenceId: data.paymentReferenceId,
                    callBackUrl: data.callBackUrl,
                    status: data.status,
                    message: data.message,
                };
            }

            throw new Error(data.message || "Payment completion failed");
        } catch (error) {
            throw error;
        }
    }

    // Verify Payment
    async verifyPayment(paymentReferenceId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/verify/payment/${paymentReferenceId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-KM-Api-Version": "v-0.2.0",
                },
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    // Helper: Generate Challenge
    private generateChallenge(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    // Helper: Get Client IP
    private async getClientIP(): Promise<string> {
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const data = await response.json();
            return data.ip || "127.0.0.1";
        } catch {
            return "127.0.0.1";
        }
    }
}

export const nagadPayment = new NagadPayment();
