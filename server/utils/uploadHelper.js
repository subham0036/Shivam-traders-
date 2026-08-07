import { uploadMultiple, uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { saveLocalFile, saveLocalFiles } from '../services/localUploadService.js';
import { saveGridFSFile, saveGridFSFiles } from '../services/gridfsUploadService.js';

export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME
    && CLOUDINARY_API_KEY
    && CLOUDINARY_API_SECRET
    && !CLOUDINARY_CLOUD_NAME.includes('your_cloud')
  );
};

const useGridFS = () => process.env.NODE_ENV === 'production' && !isCloudinaryConfigured();

export const saveMediaFile = async (file, folder = 'products') => {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file.buffer, folder);
  }
  if (useGridFS()) {
    return saveGridFSFile(file, folder);
  }
  return saveLocalFile(file, folder);
};

export const saveMediaFiles = async (files, folder = 'products') => {
  if (!files?.length) return [];
  if (isCloudinaryConfigured()) {
    return uploadMultiple(files, folder);
  }
  if (useGridFS()) {
    return saveGridFSFiles(files, folder);
  }
  return saveLocalFiles(files, folder);
};

export const uploadImages = saveMediaFiles;

export const uploadSingleMedia = async (file, folder = 'products') => saveMediaFile(file, folder);

export const deleteMedia = async (publicId) => {
  if (publicId && isCloudinaryConfigured()) {
    await deleteFromCloudinary(publicId);
  }
};

export const getUploadStorageMode = () => {
  if (isCloudinaryConfigured()) return 'cloudinary';
  if (useGridFS()) return 'gridfs';
  return 'local';
};
