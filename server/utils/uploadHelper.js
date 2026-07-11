import { uploadMultiple, uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { saveLocalFile, saveLocalFiles } from '../services/localUploadService.js';

export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME
    && CLOUDINARY_API_KEY
    && CLOUDINARY_API_SECRET
    && !CLOUDINARY_CLOUD_NAME.includes('your_cloud')
  );
};

export const uploadImages = async (files, folder = 'products') => {
  if (!files?.length) return [];
  if (isCloudinaryConfigured()) {
    return uploadMultiple(files, folder);
  }
  return saveLocalFiles(files, folder);
};

export const uploadSingleMedia = async (file, folder = 'products') => {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file.buffer, folder);
  }
  return saveLocalFile(file, folder);
};

export const deleteMedia = async (publicId) => {
  if (publicId && isCloudinaryConfigured()) {
    await deleteFromCloudinary(publicId);
  }
};
