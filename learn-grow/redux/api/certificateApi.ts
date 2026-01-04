import { baseApi } from "./baseApi";

export interface Certificate {
  _id: string;
  studentId: string;
  courseId: string;
  certificateId: string;
  issuedAt: string;
  completionDate: string;
  qrCode: string;
  verificationUrl: string;
  studentName: string;
  courseName: string;
  courseInstructor: string;
  grade?: string;
  isValid: boolean;
}

export const certificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Generate certificate for completed course
    generateCertificate: builder.mutation<
      { success: boolean; message: string; data: Certificate },
      string
    >({
      query: (courseId) => ({
        url: `/certificates/generate/${courseId}`,
        method: "POST",
        // Send an empty JSON body so the Content-Type header is present
        body: {},
      }),
      invalidatesTags: ["Certificates"],
    }),

    // Get certificate for a specific course
    getCertificate: builder.query<
      { success: boolean; data: Certificate },
      string
    >({
      query: (courseId) => `/certificates/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: "Certificates", id: courseId },
      ],
    }),

    // Get all certificates for logged-in student
    getMyCertificates: builder.query<
      { success: boolean; data: Certificate[] },
      void
    >({
      query: () => "/certificates/my-certificates",
      providesTags: ["Certificates"],
    }),

    // Verify certificate (public)
    verifyCertificate: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          isValid: boolean;
          certificate?: {
            certificateId: string;
            studentName: string;
            courseName: string;
            courseInstructor: string;
            issuedAt: string;
            completionDate: string;
          };
        };
      },
      string
    >({
      query: (certificateId) => `/certificates/verify/${certificateId}`,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGenerateCertificateMutation,
  useGetCertificateQuery,
  useGetMyCertificatesQuery,
  useVerifyCertificateQuery,
} = certificateApi;
