"use client";

import React, { useEffect, useRef } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";

// Import custom fonts including signature fonts and modern sans-serif
if (typeof document !== "undefined") {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Allura&family=Dancing+Script:wght@400;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap";
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

  const QR_SIZE = 80; // Reduced from 110 to 80
  const QR_BOTTOM_PCT = 0.09;
  const QR_LEFT_PCT = 0.5; // Changed to 50% to center horizontally

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
      // Wait for fonts to be ready
      await document.fonts.ready;

      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use html-to-image library which handles data URLs better
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1.0,
        pixelRatio: 2, // High quality
        backgroundColor: 'white',
        cacheBust: true, // Prevent caching issues
        style: {
          margin: '0',
          transform: 'scale(1)', // Reset any transforms
          transformOrigin: 'top left',
        },
        filter: (node) => {
          // Include all nodes
          return true;
        },
      });

      // Create PDF from the image
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [BASE_WIDTH, BASE_HEIGHT],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, BASE_WIDTH, BASE_HEIGHT, undefined, 'FAST');

      const fileName = `certificate-${certificate.studentName
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;

      pdf.save(fileName);
      toast.success("✅ Certificate downloaded successfully!");

    } catch (error) {
      console.error("Download error:", error);
      toast.error("❌ Failed to download. Please try again.");
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
        className="relative w-full flex justify-center overflow-hidden"
        style={{
          height: BASE_HEIGHT * displayScale,
          maxHeight: '90vh',
          overflowY: 'hidden',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${displayScale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            ref={certificateRef}
            className="shadow-2xl overflow-hidden flex-shrink-0"
            style={{
              width: BASE_WIDTH,
              height: BASE_HEIGHT,
              fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
              boxSizing: "border-box",
              position: "relative",
              margin: "0 auto",
              backgroundImage: 'url(/Templete_Certificate_page-0001.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
          {/* Background image layer for PDF capture */}
          <img
            src="/Templete_Certificate_page-0001.jpg"
            alt="Certificate Background"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          {/* Dynamic Content Overlays */}

          {/* Course Name - In the Purple Ribbon/Banner Area */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
            style={{
              top: '29.5%',
              width: '60%',
              transform: 'translateX(-35%) rotate(-2deg)', // Moved right to align with banner
              zIndex: 10,
            }}
          >
            <p
              className="text-center font-bold text-white uppercase tracking-wider"
              style={{
                fontSize: '20px', // Adjusted size to fit comfortably
                fontFamily: "'Montserrat', sans-serif",
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                lineHeight: 1.1,
              }}
            >
              {certificate.courseName || "Young Inventors & Robotics"}
            </p>
          </div>

          {/* Student Name - Centered and Modern (Underline removed as it's in template) */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center"
            style={{
              top: '57%', // Moved from 49% to 57% (lower on page)
              width: '80%',
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: '#6b7280',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                marginBottom: '12px',
                letterSpacing: '0.5px',
              }}
            >
              Awarded to
            </p>
            <p
              className="text-center"
              style={{
                fontSize: '48px',
                color: '#000000',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                lineHeight: 1.1, // Tighter line height for PDF consistency
                marginBottom: '8px',
                letterSpacing: '-0.5px', // Slight tracking adjustment
              }}
            >
              {certificate.studentName}
            </p>
            {/* Manual underline removed */}
          </div>

          {/* Congratulatory Text - Below the Name/Line */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 text-center"
            style={{
              top: '65%', // Moved down to clear the line
              width: '85%',
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#0ea5e9', // Light blue
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Congratulations on completing your first robotics adventure!
              <br />
              You are a certified junior inventor and builder!
            </p>
          </div>

          {/* Instructor/Signatory block removed as requested (present in template) */}

          {/* QR Code - Verification Block (Bottom Left) */}
          <div
            className="absolute transform -translate-x-1/2 text-center"
            style={{
              left: `${QR_LEFT_PCT * 100}%`,
              bottom: `${QR_BOTTOM_PCT * 100}%`,
              zIndex: 30,
              width: '220px',
            }}
          >
            <p
              style={{
                fontFamily: "'Arial', sans-serif",
                fontSize: '10px',
                color: '#6b7280',
                marginBottom: '6px',
                letterSpacing: '0.3px',
              }}
            >
              Scan to verify
            </p>
            {certificate.qrCode && certificate.qrCode.trim() ? (
              <div
                className="bg-white rounded-md"
                style={{
                  display: 'inline-block',
                  padding: '8px',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                }}
              >
                <img
                  src={certificate.qrCode}
                  alt="Certificate QR Code"
                  width={QR_SIZE}
                  height={QR_SIZE}
                  style={{
                    display: 'block',
                    width: `${QR_SIZE}px`,
                    height: `${QR_SIZE}px`,
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                  loading="eager"
                  decoding="sync"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div style="width:${QR_SIZE}px;height:${QR_SIZE}px;background:#fef2f2;border:2px solid #fecaca;border-radius:6px;display:flex;align-items:center;justify-content:center;"><span style="font-size:10px;color:#b91c1c;text-align:center;padding:8px;">QR Failed<br/>to Load</span></div>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-md" style={{ display: 'inline-block', padding: '8px', border: '2px dashed #9ca3af' }}>
                <div style={{ width: `${QR_SIZE}px`, height: `${QR_SIZE}px`, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
                    No QR Code
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Certificate ID - Below QR Code */}
          <div
            className="absolute transform -translate-x-1/2 text-center z-30"
            style={{
              left: `${QR_LEFT_PCT * 100}%`,
              bottom: '8%',
            }}
          >
            <p style={{ fontFamily: 'monospace', color: '#555555', fontWeight: 600, fontSize: '10px' }}>
              {certificate.certificateId}
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
