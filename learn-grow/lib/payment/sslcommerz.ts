// SSLCommerz Payment Integration
// API Documentation: https://developer.sslcommerz.com/

export interface SSLCommerzPaymentRequest {
    amount: number;
    courseId: string;
    courseName: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
}

export interface SSLCommerzPaymentResponse {
    status: string;
    sessionkey: string;
    GatewayPageURL: string;
    storeBanner: string;
    storeLogo: string;
    desc: string[];
}

export class SSLCommerzPayment {
    private storeId: string;
    private storePassword: string;
    private baseURL: string;
    private isSandbox: boolean;

    constructor() {
        // These should be in environment variables
        this.storeId = process.env.NEXT_PUBLIC_SSLCOMMERZ_STORE_ID || "";
        this.storePassword = process.env.NEXT_PUBLIC_SSLCOMMERZ_STORE_PASSWORD || "";
        this.isSandbox = process.env.NEXT_PUBLIC_SSLCOMMERZ_IS_SANDBOX === "true";
        this.baseURL = this.isSandbox
            ? "https://sandbox.sslcommerz.com"
            : "https://securepay.sslcommerz.com";
    }

    // Initialize Payment
    async initializePayment(paymentData: SSLCommerzPaymentRequest): Promise<SSLCommerzPaymentResponse> {
        // Mock functionality for demo/testing if keys are missing
        if (!this.storeId) {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
                status: "SUCCESS",
                sessionkey: `MOCK-SESSION-${Date.now()}`,
                GatewayPageURL: `${window.location.origin}/payment/sslcommerz/success?tran_id=TXN-${Date.now()}&amount=${paymentData.amount}`,
                storeBanner: "",
                storeLogo: "",
                desc: [],
            };
        }

        try {
            const transactionId = `TXN-${Date.now()}-${paymentData.userId.slice(0, 8)}`;

            const data = new URLSearchParams({
                store_id: this.storeId,
                store_passwd: this.storePassword,
                total_amount: paymentData.amount.toString(),
                currency: "BDT",
                tran_id: transactionId,
                success_url: `${window.location.origin}/payment/sslcommerz/success`,
                fail_url: `${window.location.origin}/payment/sslcommerz/fail`,
                cancel_url: `${window.location.origin}/payment/sslcommerz/cancel`,
                ipn_url: `${window.location.origin}/api/payment/ipn`,

                // Customer Information
                cus_name: paymentData.userName,
                cus_email: paymentData.userEmail,
                cus_add1: "N/A",
                cus_city: "Dhaka",
                cus_state: "Dhaka",
                cus_postcode: "1000",
                cus_country: "Bangladesh",
                cus_phone: paymentData.userPhone || "01XXXXXXXXX",

                // Product Information
                product_name: paymentData.courseName,
                product_category: "Education",
                product_profile: "general",

                // Shipment Information  
                shipping_method: "NO",
                num_of_item: "1",

                // Additional Information
                value_a: paymentData.courseId, // Store course ID
                value_b: paymentData.userId, // Store user ID
                value_c: "course_purchase",
            });

            const response = await fetch(`${this.baseURL}/gwprocess/v4/api.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: data.toString(),
            });

            const result = await response.json();

            if (result.status === "SUCCESS") {
                return {
                    status: result.status,
                    sessionkey: result.sessionkey,
                    GatewayPageURL: result.GatewayPageURL,
                    storeBanner: result.storeBanner,
                    storeLogo: result.storeLogo,
                    desc: result.desc || [],
                };
            }

            throw new Error(result.failedreason || "Payment initialization failed");
        } catch (error) {
            throw error;
        }
    }

    // Validate Payment
    async validatePayment(transactionId: string, amount: number): Promise<any> {
        try {
            const params = new URLSearchParams({
                val_id: transactionId,
                store_id: this.storeId,
                store_passwd: this.storePassword,
                format: "json",
            });

            const response = await fetch(
                `${this.baseURL}/validator/api/validationserverAPI.php?${params.toString()}`,
                {
                    method: "GET",
                }
            );

            const data = await response.json();

            if (data.status === "VALID" || data.status === "VALIDATED") {
                // Verify amount matches
                if (parseFloat(data.amount) === amount) {
                    return {
                        isValid: true,
                        data: data,
                    };
                }
                throw new Error("Amount mismatch");
            }

            return {
                isValid: false,
                data: data,
            };
        } catch (error) {
            throw error;
        }
    }

    // Refund Payment
    async refundPayment(
        bankTransactionId: string,
        refundAmount: number,
        refundRemarks: string
    ): Promise<any> {
        try {
            const data = new URLSearchParams({
                refund_amount: refundAmount.toString(),
                refund_remarks: refundRemarks,
                bank_tran_id: bankTransactionId,
                store_id: this.storeId,
                store_passwd: this.storePassword,
                format: "json",
            });

            const response = await fetch(`${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: data.toString(),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Query Transaction Status
    async queryTransaction(transactionId: string): Promise<any> {
        try {
            const params = new URLSearchParams({
                tran_id: transactionId,
                store_id: this.storeId,
                store_passwd: this.storePassword,
                format: "json",
            });

            const response = await fetch(
                `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?${params.toString()}`,
                {
                    method: "GET",
                }
            );

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
}

export const sslCommerzPayment = new SSLCommerzPayment();
