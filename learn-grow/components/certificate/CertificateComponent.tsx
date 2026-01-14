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
    
    // Create a temporary clone for rendering off-screen
    const node = certificateRef.current;
    const clone = node.cloneNode(true) as HTMLDivElement;
    
    // Style the clone for off-screen rendering
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = BASE_WIDTH + "px";
    clone.style.height = BASE_HEIGHT + "px";
    clone.style.transform = "scale(1)";
    clone.style.zIndex = "-1";
    
    try {
      // Append clone to body
      document.body.appendChild(clone);

      // Wait for everything to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.onerror = resolve;
        bgImg.src = "/Templete_Certificate_page-0001.jpg";
        setTimeout(resolve, 3000);
      });

      // Load all content images in the clone
      const images = Array.from(clone.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(true);
              } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                setTimeout(resolve, 2000);
              }
            })
        )
      );

      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture with html2canvas
      const canvas = await html2canvas(clone, {
        scale: 2,
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 20000,
      });

      // Remove the clone
      document.body.removeChild(clone);

      // Create PDF with canvas image
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [BASE_WIDTH, BASE_HEIGHT],
      });

      pdf.addImage(imgData, "PNG", 0, 0, BASE_WIDTH, BASE_HEIGHT);

      const fileName = `certificate-${certificate.studentName
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.pdf`;
      
      pdf.save(fileName);
      toast.success("✅ Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("❌ Failed to download. Check browser console for details.");
      
      // Ensure clone is removed even on error
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
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
          ref={certificateRef}
          className="shadow-2xl overflow-hidden flex-shrink-0"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
            boxSizing: "border-box",
            position: "relative",
            margin: "0 auto",
            transform: `scale(${displayScale})`,
            transformOrigin: "top center",
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
          
          {/* Student Name - positioned on the template line */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              top: '48%',
              width: '70%',
              zIndex: 10,
            }}
          >
            <p 
              className="text-center font-bold"
              style={{ 
                fontSize: '56px',
                color: '#000000',
                fontFamily: "'Arial', sans-serif",
                letterSpacing: '2px',
                fontWeight: 900,
              }}
            >
              {certificate.studentName.toUpperCase()}
            </p>
          </div>

          {/* Course Name - below the student name */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              top: '57%',
              width: '75%',
            }}
          >
            <p 
              className="text-center font-semibold"
              style={{ 
                fontSize: '22px',
                color: '#000000',
                fontFamily: "'Arial', sans-serif",
                fontWeight: 700,
              }}
            >
              {certificate.courseName}
            </p>
          </div>

          {/* Instructor Name */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              top: '63%',
              width: '75%',
            }}
          >
            <p 
              className="text-center"
              style={{ 
                fontSize: '16px',
                color: '#666666',
                fontFamily: "'Arial', sans-serif",
                fontWeight: 500,
              }}
            >
              Instructor: <span className="font-bold" style={{ color: '#000000' }}>{certificate.courseInstructor}</span>
            </p>
          </div>

      

       

          {/* QR Code - Bottom Center */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              bottom: '16%',
              zIndex: 30,
            }}
          >
            {certificate.qrCode && certificate.qrCode.trim() ? (
              <div className="bg-white p-2 rounded-lg shadow-md" style={{ display: 'inline-block', border: '2px solid #e5e7eb' }}>
                <img
                  src={certificate.qrCode}
                  alt="QR Code for Certificate Verification"
                  className="w-24 h-24"
                  style={{ 
                    display: 'block',
                    objectFit: 'contain',
                    imageRendering: 'crisp-edges',
                  }}
                  crossOrigin="anonymous"
                  onLoad={(e) => {
                    console.log("QR Code loaded successfully:", certificate.qrCode);
                  }}
                  onError={(e) => {
                    console.error("QR Code failed to load:", certificate.qrCode);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-24 h-24 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center"><span style="font-size: 11px; color: #999; text-align: center; padding: 8px;">QR Code<br/>Unavailable</span></div>';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="bg-white p-2 rounded-lg shadow-md border-2 border-gray-300">
                <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
                  <span style={{ fontSize: '11px', color: '#999', textAlign: 'center', padding: '8px' }}>
                    QR Code<br/>Unavailable
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Certificate ID - Below QR Code */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 text-center z-30"
            style={{
              bottom: '10%',
            }}
          >
            <p style={{ color: '#999999', marginBottom: '2px', fontFamily: "'Arial', sans-serif", fontSize: '9px' }}>
              Certificate ID:
            </p>
            <p style={{ fontFamily: 'monospace', color: '#555555', fontWeight: 600, fontSize: '10px' }}>
              {certificate.certificateId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
