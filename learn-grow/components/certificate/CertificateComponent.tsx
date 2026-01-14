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
    const node = certificateRef.current;
    
    try {
      console.log("Starting certificate download process...");
      
      // Pre-load all images before cloning
      const allImages = Array.from(node.querySelectorAll("img")) as HTMLImageElement[];
      console.log(`Found ${allImages.length} images to process`);
      
      // Convert all images to data URLs first to ensure they're embedded
      const imagePromises = allImages.map(async (img, index) => {
        try {
          // If already a data URL, skip conversion
          if (img.src.startsWith('data:')) {
            console.log(`Image ${index + 1} is already a data URL`);
            return;
          }
          
          console.log(`Converting image ${index + 1}: ${img.src.substring(0, 50)}...`);
          
          const response = await fetch(img.src, { mode: 'cors' });
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          // Store the data URL
          img.setAttribute('data-original-src', img.src);
          img.src = dataUrl;
          console.log(`Image ${index + 1} converted successfully`);
        } catch (e) {
          console.warn(`Failed to convert image ${index + 1}:`, e);
          // Don't fail the whole process for one image
        }
      });

      await Promise.allSettled(imagePromises);
      console.log("All images processed");
      
      // Wait a bit for images to fully load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create clone after all images are converted
      console.log("Creating DOM clone...");
      const clone = node.cloneNode(true) as HTMLDivElement;
      
      // Style the clone for off-screen rendering at full size
      clone.style.position = "fixed";
      clone.style.left = "-99999px";
      clone.style.top = "0";
      clone.style.width = BASE_WIDTH + "px";
      clone.style.height = BASE_HEIGHT + "px";
      clone.style.transform = "scale(1)";
      clone.style.transformOrigin = "top left";
      clone.style.zIndex = "-9999";
      clone.style.visibility = "visible";
      clone.style.opacity = "1";
      
      // Append clone to body
      document.body.appendChild(clone);
      console.log("Clone appended to DOM");

      // Wait for clone to render
      await new Promise(resolve => setTimeout(resolve, 800));

      // Ensure all images in clone are loaded
      const cloneImages = Array.from(clone.querySelectorAll("img")) as HTMLImageElement[];
      console.log(`Verifying ${cloneImages.length} images in clone...`);
      
      await Promise.all(
        cloneImages.map(
          (img, idx) =>
            new Promise((resolve) => {
              if (img.complete && img.naturalHeight !== 0) {
                console.log(`Clone image ${idx + 1} already loaded`);
                resolve(true);
              } else {
                img.onload = () => {
                  console.log(`Clone image ${idx + 1} loaded successfully`);
                  resolve(true);
                };
                img.onerror = () => {
                  console.error(`Clone image ${idx + 1} failed to load:`, img.src.substring(0, 50));
                  resolve(false);
                };
                setTimeout(() => {
                  console.warn(`Clone image ${idx + 1} timed out`);
                  resolve(false);
                }, 5000);
              }
            })
        )
      );

      console.log("All clone images verified");

      // Final wait before capture
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("Capturing with html2canvas...");
      // Capture with html2canvas with optimal settings
      const canvas = await html2canvas(clone, {
        scale: 3, // Higher quality
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false, // Set to true for debugging
        imageTimeout: 30000,
        removeContainer: false,
        foreignObjectRendering: false, // Better for images
        ignoreElements: (element) => {
          // Don't ignore any elements
          return false;
        }
      });

      console.log(`Canvas created: ${canvas.width}x${canvas.height}`);

      // Remove the clone
      document.body.removeChild(clone);
      console.log("Clone removed from DOM");

      // Restore original image sources
      allImages.forEach((img, index) => {
        const originalSrc = img.getAttribute('data-original-src');
        if (originalSrc) {
          img.src = originalSrc;
          img.removeAttribute('data-original-src');
          console.log(`Restored original source for image ${index + 1}`);
        }
      });

      console.log("Creating PDF...");
      // Create PDF with canvas image
      const imgData = canvas.toDataURL("image/png", 1.0); // Max quality
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [BASE_WIDTH, BASE_HEIGHT],
        compress: false, // No compression for better quality
      });

      pdf.addImage(imgData, "PNG", 0, 0, BASE_WIDTH, BASE_HEIGHT, undefined, 'FAST');

      const fileName = `certificate-${certificate.studentName
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.pdf`;
      
      console.log(`Saving PDF as: ${fileName}`);
      pdf.save(fileName);
      console.log("Certificate downloaded successfully!");
      toast.success("✅ Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("❌ Failed to download certificate. Please try again.");
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
                  width="96"
                  height="96"
                  style={{ 
                    display: 'block',
                    width: '96px',
                    height: '96px',
                    objectFit: 'contain',
                    imageRendering: '-webkit-optimize-contrast',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.log("QR Code loaded:", {
                      src: certificate.qrCode.substring(0, 50) + "...",
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      complete: img.complete
                    });
                  }}
                  onError={(e) => {
                    console.error("QR Code load error:", certificate.qrCode.substring(0, 100));
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div style="width: 96px; height: 96px; background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><span style="font-size: 11px; color: #6b7280; text-align: center; padding: 8px;">QR Code<br/>Unavailable</span></div>';
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
                  <span style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
                    QR Code<br/>Not Generated
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
