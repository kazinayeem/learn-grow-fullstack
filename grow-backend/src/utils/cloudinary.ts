import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    fileName: string,
    folder: string = 'courses'
): Promise<{ url: string; publicId: string }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: folder,
                public_id: fileName,
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        );

        stream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export default cloudinary;
