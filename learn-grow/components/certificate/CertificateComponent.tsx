"use client";

import React, { useRef } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CertificateProps {
  certificate: {
    certificateId: string;
    studentName: string;
    courseName: string;
    courseInstructor: string;
    issuedAt: string;
    completionDate: string;
    qrCode: string;
    verificationUrl: string;
  };
}

export default function CertificateComponent({ certificate }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setDownloading(true);
    try {
      // Capture the certificate as canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // High quality
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Convert to PDF (A4 landscape)
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`certificate-${certificate.certificateId}.pdf`);

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button
          color="primary"
          size="lg"
          startContent={downloading ? <Spinner size="sm" color="white" /> : <FaDownload />}
          onPress={downloadCertificate}
          isDisabled={downloading}
          className="font-semibold"
        >
          {downloading ? "Generating PDF..." : "Download Certificate"}
        </Button>
      </div>

      {/* Certificate Design */}
      <div
        ref={certificateRef}
        className="bg-white p-12 shadow-2xl rounded-lg border-[10px] border-double border-sky-600"
        style={{
          aspectRatio: "1.414/1",
          maxWidth: "1200px",
          margin: "0 auto",
          fontFamily: "'DM Sans', 'Poppins', 'Inter', 'Helvetica', sans-serif",
        }}
      >
        {/* Decorative background */}
        <div className="relative h-full flex flex-col items-center justify-between p-8 bg-gradient-to-br from-slate-50 via-white to-sky-50">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center mb-2">
              <img src="/logo.png" alt="Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-wide uppercase">
              Certificate of Completion
            </h1>
            <div className="w-32 h-1 bg-sky-500 mx-auto mt-3"></div>
          </div>

          {/* Body */}
          <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
            <p className="text-lg text-slate-600">This is to certify that</p>
            <h2
              className="text-4xl font-bold text-slate-900 border-b-2 border-sky-500 pb-2 inline-block px-8"
              style={{ fontFamily: "'DM Sans', 'Poppins', 'Inter', 'Helvetica', sans-serif" }}
            >
              {certificate.studentName}
            </h2>
            <p className="text-lg text-slate-600">has successfully completed the course</p>
            <h3
              className="text-3xl font-semibold text-slate-800 px-4"
              style={{ fontFamily: "'DM Sans', 'Poppins', 'Inter', 'Helvetica', sans-serif" }}
            >
              {certificate.courseName}
            </h3>
            <p className="text-md text-slate-600">on {formatDate(certificate.completionDate)}</p>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-3 gap-8 w-full items-end">
            {/* QR Code */}
            <div className="text-center">
              <img
                src={certificate.qrCode}
                alt="QR Code"
                className="w-24 h-24 mx-auto mb-2 border-2 border-gray-300 p-1 bg-white"
              />
              <p className="text-xs text-slate-500">Scan to Verify</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {certificate.certificateId}
              </p>
            </div>

            {/* Signatures */}
            <div className="text-center">
              <div className="flex justify-center gap-10">
                <div className="text-center">
                  <div className="border-t-2 border-slate-700 pt-2 mt-12">
                    <p
                      className="text-2xl font-semibold text-slate-800"
                      style={{ fontFamily: "'Dancing Script', 'Pacifico', 'Cedarville Cursive', cursive" }}
                    >
                      {certificate.courseInstructor}
                    </p>
                    <p className="text-sm text-slate-600">Course Instructor</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-slate-700 pt-2 mt-12">
                    <p
                      className="text-2xl font-semibold text-slate-800"
                      style={{ fontFamily: "'Dancing Script', 'Pacifico', 'Cedarville Cursive', cursive" }}
                    >
                      Jabed
                    </p>
                    <p className="text-sm text-slate-600">Admin Signature</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Issued Date */}
            <div className="text-center">
              <div className="border-t-2 border-slate-700 pt-2 mt-12">
                <p className="text-sm text-slate-600">Issued on</p>
                <p className="text-md font-semibold text-slate-800">
                  {formatDate(certificate.issuedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <p className="text-9xl font-black text-sky-500">LEARN & GROW</p>
          </div>
        </div>
      </div>
    </div>
  );
}
