"use client";

import React, { useEffect, useRef } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Import custom fonts including signature fonts
if (typeof document !== "undefined") {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Allura&family=Dancing+Script:wght@400;700&display=swap";
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
    const node = certificateRef.current;

    let clone: HTMLDivElement | null = null;
    
    try {
      // Create a clone for PDF capture (never touches the visible UI)
      clone = node.cloneNode(true) as HTMLDivElement;

      // Keep it off-screen, but still renderable
      clone.style.position = "fixed";
      clone.style.left = "-99999px";
      clone.style.top = "0";
      clone.style.width = `${BASE_WIDTH}px`;
      clone.style.height = `${BASE_HEIGHT}px`;
      clone.style.transform = "scale(1)";
      clone.style.transformOrigin = "top left";
      clone.style.zIndex = "-1";
      clone.style.visibility = "visible";
      clone.style.pointerEvents = "none";

      document.body.appendChild(clone);

      // Wait for fonts + layout
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Ensure images are loaded
      const cloneImages = Array.from(clone.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        cloneImages.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) return resolve(true);
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              setTimeout(() => resolve(false), 6000);
            })
        )
      );

      const scale = 2;
      const canvas = await html2canvas(clone, {
        scale,
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 20000,
      });

      // Some browsers miss <img src="data:..."> inside off-screen nodes.
      // Force-draw the QR code onto the final canvas so the PDF always includes it.
      if (certificate.qrCode && certificate.qrCode.startsWith("data:image")) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const qrImg = new Image();
          const qrLoaded = await new Promise<boolean>((resolve) => {
            qrImg.onload = () => resolve(true);
            qrImg.onerror = () => resolve(false);
            qrImg.src = certificate.qrCode;
          });

          if (qrLoaded) {
            const qrSize = 96;
            const qrX = (BASE_WIDTH - qrSize) / 2;
            const qrBottom = 0.16 * BASE_HEIGHT;
            const qrY = BASE_HEIGHT - qrBottom - qrSize;

            ctx.save();
            // Draw a white backing so it stays readable
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(qrX * scale - 8 * scale, qrY * scale - 8 * scale, (qrSize + 16) * scale, (qrSize + 16) * scale);
            ctx.drawImage(qrImg, qrX * scale, qrY * scale, qrSize * scale, qrSize * scale);
            ctx.restore();
          }
        }
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [BASE_WIDTH, BASE_HEIGHT],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, BASE_WIDTH, BASE_HEIGHT);

      const fileName = `certificate-${certificate.studentName
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;
      
      pdf.save(fileName);
      toast.success("✅ Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("❌ Failed to download. Check console for details.");
    } finally {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
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
              top: '45.5%',
              width: '70%',
              zIndex: 10,
            }}
          >
            <p 
              className="text-center"
              style={{ 
                fontSize: '58px',
                color: '#000000',
                fontFamily: "'Great Vibes', 'Allura', 'Dancing Script', cursive",
                letterSpacing: '0.5px',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1,
              }}
            >
              {certificate.studentName}
            </p>
          </div>

          {/* Course Name - below the student name */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              top: '58.5%',
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
              <div 
                className="bg-white p-2 rounded-lg" 
                style={{ 
                  display: 'inline-block', 
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src={certificate.qrCode}
                  alt="Certificate QR Code"
                  width={96}
                  height={96}
                  style={{ 
                    display: 'block',
                    width: '96px',
                    height: '96px',
                    minWidth: '96px',
                    minHeight: '96px',
                    maxWidth: '96px',
                    maxHeight: '96px',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                  loading="eager"
                  decoding="sync"
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.log("✅ QR Code loaded successfully:", {
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      complete: img.complete
                    });
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error("❌ QR Code failed to load");
                    console.error("QR Code src:", certificate.qrCode?.substring(0, 100));
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div style="width: 96px; height: 96px; background: #fee; border: 2px solid #fcc; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><span style="font-size: 10px; color: #c00; text-align: center; padding: 8px;">QR Failed<br/>to Load</span></div>';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="bg-white p-2 rounded-lg border-2 border-gray-300">
                <div style={{
                  width: '96px',
                  height: '96px',
                  background: '#f3f4f6',
                  border: '2px dashed #9ca3af',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
                    No QR Code<br/>Generated
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
