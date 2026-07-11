import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|heic|heif|mp4|webm/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype) || file.mimetype === 'image/heic' || file.mimetype === 'image/heif';
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPG, PNG, WEBP, HEIC) and videos are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
  { name: 'screenshot', maxCount: 1 },
  { name: 'qrCode', maxCount: 1 },
]);

export const handleUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size is 10 MB.' });
    }
    return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
  });
};
