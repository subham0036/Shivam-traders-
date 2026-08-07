import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import path from 'path';

let bucket;

export const getGridFSBucket = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB not connected');
  }
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'media' });
  }
  return bucket;
};

export const saveGridFSFile = async (file, folder = 'products') => {
  const gfs = getGridFSBucket();
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  return new Promise((resolve, reject) => {
    const uploadStream = gfs.openUploadStream(filename, {
      contentType: file.mimetype || 'image/jpeg',
      metadata: { folder, originalName: file.originalname },
    });
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        url: `/uploads/${filename}`,
        publicId: uploadStream.id.toString(),
        alt: file.originalname,
      });
    });
    uploadStream.end(file.buffer);
  });
};

export const saveGridFSFiles = async (files, folder = 'products') => {
  if (!files?.length) return [];
  return Promise.all(files.map((file) => saveGridFSFile(file, folder)));
};

export const streamGridFSFile = async (relativePath, res) => {
  if (!relativePath) return false;

  const gfs = getGridFSBucket();
  const files = await gfs.find({ filename: relativePath }).limit(1).toArray();
  if (!files.length) return false;

  res.set('Content-Type', files[0].contentType || 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  gfs.openDownloadStreamByName(relativePath).pipe(res);
  return true;
};
