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
          className="shadow-2xl overflow-hidden flex-shrink-0 relative"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
            boxSizing: "border-box",
            position: "absolute",
            left: "50%",
            top: 0,
            transform: `translateX(-50%) scale(${displayScale})`,
            transformOrigin: "top center",
            backgroundImage: 'url(/Templete_Certificate_page-0001.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Dynamic Content Overlays */}
          
          {/* Student Name - positioned on the template line */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              top: '52%',
              width: '60%',
            }}
          >
            <p 
              className="text-center font-bold"
              style={{ 
                fontSize: '48px',
                color: '#000000',
                fontFamily: "'Arial', sans-serif",
                letterSpacing: '1px',
              }}
            >
              {certificate.studentName}
            </p>
          </div>

          {/* Course Name - below the student name */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              top: '62%',
              width: '70%',
            }}
          >
            <p 
              className="text-center font-semibold"
              style={{ 
                fontSize: '20px',
                color: '#333333',
                fontFamily: "'Arial', sans-serif",
              }}
            >
              {certificate.courseName}
            </p>
          </div>

          {/* Instructor Name */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              top: '67%',
              width: '70%',
            }}
          >
            <p 
              className="text-center"
              style={{ 
                fontSize: '16px',
                color: '#666666',
                fontFamily: "'Arial', sans-serif",
              }}
            >
              Instructor: <span className="font-semibold">{certificate.courseInstructor}</span>
            </p>
          </div>

          {/* Date - bottom left area */}
          <div 
            className="absolute"
            style={{ 
              bottom: '18%',
              left: '25%',
            }}
          >
            <p 
              className="text-center"
              style={{ 
                fontSize: '16px',
                color: '#333333',
                fontFamily: "'Arial', sans-serif",
              }}
            >
              {formatDate(certificate.issuedAt)}
            </p>
          </div>

          {/* Signature - bottom right area */}
          <div 
            className="absolute"
            style={{ 
              bottom: '15%',
              right: '20%',
            }}
          >
            <p 
              className="text-center"
              style={{ 
                fontSize: '36px',
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                color: '#000000',
                marginBottom: '4px',
              }}
            >
              Jabed
            </p>
            <p 
              className="text-center"
              style={{ 
                fontSize: '14px',
                color: '#333333',
                fontFamily: "'Arial', sans-serif",
                fontWeight: 600,
              }}
            >
              Md Jabed Hosen
            </p>
            <p 
              className="text-center"
              style={{ 
                fontSize: '12px',
                color: '#666666',
                fontFamily: "'Arial', sans-serif",
              }}
            >
              CEO, Learn & Grow
            </p>
          </div>

          {/* QR Code - Bottom Left */}
          <div 
            className="absolute z-30"
            style={{
              bottom: '8%',
              left: '8%',
            }}
          >
            <div className="bg-white p-2 rounded shadow-md">
              {certificate.qrCode ? (
                <img
                  src={certificate.qrCode}
                  alt="QR Code"
                  className="w-24 h-24"
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 border border-gray-300" />
              )}
            </div>
          </div>

          {/* Certificate ID - Bottom Right */}
          <div 
            className="absolute text-right"
            style={{
              bottom: '8%',
              right: '8%',
            }}
          >
            <p style={{ fontSize: '10px', color: '#666666', marginBottom: '2px' }}>
              Certificate ID:
            </p>
            <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#333333', fontWeight: 600 }}>
              {certificate.certificateId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
