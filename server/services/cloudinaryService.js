import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = (buffer, folder = 'shivam-traders') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

export const uploadMultiple = async (files, folder) => {
  if (!files?.length) return [];
  return Promise.all(files.map((f) => uploadToCloudinary(f.buffer, folder)));
};
