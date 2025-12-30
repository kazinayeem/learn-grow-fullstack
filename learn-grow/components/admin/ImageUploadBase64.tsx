import React, { useState, useRef } from "react";
import { Button, Input, Card, CardBody, Image, Progress, Spinner } from "@nextui-org/react";
import toast from "react-hot-toast";

interface ImageUploadProps {
    onImageSelected: (base64: string, size: number) => void;
    preview?: string;
    isLoading?: boolean;
}

export default function ImageUploadBase64({ onImageSelected, preview, isLoading }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (1MB = 1048576 bytes)
        if (file.size > 1048576) {
            toast.error("Image size must not exceed 1MB");
            return;
        }

        // Check if it's an image
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        setIsConverting(true);
        const reader = new FileReader();

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                setUploadProgress(progress);
            }
        };

        reader.onload = (e) => {
            const base64String = e.target?.result as string;
            // Extract only the base64 part (remove data:image/...;base64, prefix if present)
            const base64Data = base64String.includes(",") ? base64String.split(",")[1] : base64String;
            const size = file.size;

            onImageSelected(base64Data, size);
            setIsConverting(false);
            setUploadProgress(0);
            toast.success("Image uploaded successfully!");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };

        reader.onerror = () => {
            toast.error("Failed to read file");
            setIsConverting(false);
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-3 items-end">
                <Button
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isConverting}
                    startContent={isConverting ? <Spinner size="sm" /> : undefined}
                >
                    {isConverting ? "Converting..." : "Choose Image"}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <span className="text-xs text-gray-500">(Max 1MB)</span>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && <Progress value={uploadProgress} label="Uploading..." />}

            {preview && (
                <Card>
                    <CardBody className="p-4">
                        <p className="text-sm font-semibold mb-2">Preview</p>
                        <Image alt="preview" src={`data:image/jpeg;base64,${preview}`} width={150} height={150} />
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
