import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '../uploads');

export const saveLocalFile = async (file, folder = 'products') => {
  const dir = path.join(uploadsRoot, folder);
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  await fs.writeFile(path.join(dir, filename), file.buffer);

  const port = process.env.PORT || 5002;
  const baseUrl = process.env.SERVER_URL || `http://localhost:${port}`;
  return {
    url: `${baseUrl}/uploads/${folder}/${filename}`,
    publicId: null,
    alt: file.originalname,
  };
};

export const saveLocalFiles = async (files, folder = 'products') => {
  if (!files?.length) return [];
  return Promise.all(files.map((file) => saveLocalFile(file, folder)));
};
