"use client";

import React, { useEffect, useRef } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Import custom fonts
if (typeof document !== "undefined") {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Fugaz+One&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

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
  const BASE_WIDTH = 1200;
  const BASE_HEIGHT = Math.round(BASE_WIDTH / 1.414);

  const containerRef = useRef<HTMLDivElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);
  const [displayScale, setDisplayScale] = React.useState(1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const width = el.clientWidth;
      const nextScale = Math.min(1, width / BASE_WIDTH);
      setDisplayScale(nextScale);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [BASE_WIDTH]);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setDownloading(true);
    try {
      const node = certificateRef.current;
      const originalTransform = node.style.transform;

      // Export at full (unscaled) size for crisp PDF.
      node.style.transform = "translateX(-50%) scale(1)";

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      node.style.transform = originalTransform;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
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
      <div className="flex justify-end mb-2 sm:mb-4 px-2 sm:px-0 overflow-x-auto">
        <Button
          color="primary"
          size="sm"
          className="sm:size-lg font-semibold flex-shrink-0"
          startContent={downloading ? <Spinner size="sm" color="white" /> : <FaDownload />}
          onPress={downloadCertificate}
          isDisabled={downloading}
        >
          <span className="hidden sm:inline">
            {downloading ? "Generating PDF..." : "Download Certificate"}
          </span>
          <span className="sm:hidden">
            {downloading ? "Generating..." : "Download"}
          </span>
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full flex justify-center overflow-x-auto"
        style={{ height: BASE_HEIGHT * displayScale, overflowY: "hidden" }}
      >
        <div
          ref={certificateRef}
          className="bg-primary-500 shadow-2xl overflow-hidden flex-shrink-0"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
            border: "14px solid #0ea5e9",
            borderRadius: "22px",
            boxSizing: "border-box",
            position: "absolute",
            left: "50%",
            top: 0,
            transform: `translateX(-50%) scale(${displayScale})`,
            transformOrigin: "top center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-cyan-500 to-orange-400"></div>
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="relative h-full flex flex-col p-6 sm:p-8 md:p-12 lg:p-14">
            <div className="relative flex-1">
              <div className="absolute inset-x-0 top-2 sm:top-3 flex justify-center">
                <div className="w-[92%] sm:w-[88%] h-3 bg-primary-200/70 rounded-full blur-[0.5px]"></div>
              </div>

              <div className="relative bg-white shadow-2xl border border-primary-100 mx-auto mt-4 sm:mt-6 w-[94%] sm:w-[90%] h-[86%] rounded-md overflow-visible">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 top-0 w-full h-2 bg-primary-500"></div>
              </div>

              {/* QR (always visible) */}
              <div className="absolute bottom-6 right-6 z-50 flex flex-col items-center gap-1 bg-white/95 p-2 rounded shadow-md">
                {certificate.qrCode ? (
                  <img
                    src={certificate.qrCode}
                    alt="QR Code"
                    className="w-16 h-16 border border-gray-300 bg-white p-1 rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 border border-gray-300" />
                )}
                <span className="text-[9px] text-gray-600 font-medium">Scan to verify</span>
              </div>

              {/* Header banner */}
              <div className="relative px-5 sm:px-8 pt-6 sm:pt-8">
                <div className="relative flex items-center justify-center">
                  <div className="absolute left-0 -top-3 sm:-top-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-accent-300 shadow-lg flex items-center justify-center">
                      <img src="/logo.png" alt="Learn & Grow Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                    </div>
                  </div>

                  <div className="bg-secondary-700 text-white rounded-sm px-4 sm:px-6 py-2 sm:py-3 shadow-md">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-2xl sm:text-3xl font-extrabold tracking-wide">LEARN &amp; GROW</span>
                    </div>
                  </div>

                  <div className="absolute right-0 -top-2 sm:-top-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent-300 shadow-lg border-4 border-white flex items-center justify-center">
                      <img src="/robotlogo.png" alt="Robot Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-20 px-6 sm:px-10 pt-6 sm:pt-8 pb-20 sm:pb-24 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-secondary-600">Certificate of Achievement</h1>

                <p className="mt-2 sm:mt-3 text-base sm:text-lg font-extrabold text-primary-700">Awarded to:</p>

                <div className="mt-4 sm:mt-5 flex justify-center">
                  <div className="w-[86%] sm:w-[80%] border-b-2 border-gray-800"></div>
                </div>
                <div className="mt-2">
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
                    style={{ fontFamily: "'Fugaz One', sans-serif" }}
                  >
                    {certificate.studentName}
                  </span>
                </div>

                <p className="mt-4 sm:mt-5 text-sm sm:text-base font-semibold text-primary-700">
                  Congratulations on all of your hard work.
                  <br />
                  You are a collaborative creative coder!
                </p>

                <p className="mt-3 text-xs sm:text-sm text-gray-600">
                  Course: <span className="font-semibold text-gray-800">{certificate.courseName}</span>
                </p>
                <p className="mt-1 text-[11px] sm:text-xs text-gray-500">
                  Instructor: <span className="font-semibold text-gray-700">{certificate.courseInstructor}</span>
                </p>

                {/* Bottom lines */}
                <div className="mt-10 sm:mt-14 grid grid-cols-2 gap-10 px-4 sm:px-10">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-800"></div>
                    <p className="mt-2 text-xs sm:text-sm font-semibold text-primary-700">Date</p>
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-600">{formatDate(certificate.issuedAt)}</p>
                  </div>

                  <div className="text-center">
                    <div className="border-b-2 border-gray-800"></div>
                    <p className="mt-2 text-xs sm:text-sm font-semibold text-primary-700">Signature</p>
                    <p
                      className="mt-1 text-lg sm:text-xl text-gray-800"
                      style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}
                    >
                      Md Jabed Hosen
                    </p>
                    <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">CEO, Learn &amp; Grow</p>
                  </div>
                </div>

                {/* Footer meta */}
                <div className="mt-6 sm:mt-8">
                  <div className="text-center">
                    <p className="text-[9px] sm:text-[10px] text-gray-500">Certificate ID: <span className="font-mono text-gray-700">{certificate.certificateId}</span></p>
                  </div>
                </div>
              </div>

              {/* Characters */}
              <img
                src="/kidslogo.png"
                alt="Left character"
                className="absolute bottom-0 left-2 w-28 sm:w-32 object-contain drop-shadow-lg z-0 pointer-events-none"
              />
              <img
                src="/robotlogo.png"
                alt="Right character"
                className="absolute bottom-0 right-2 w-32 sm:w-36 object-contain drop-shadow-lg z-0 pointer-events-none"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
