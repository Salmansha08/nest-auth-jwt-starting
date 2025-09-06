import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export const generateFileName = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const extension = extname(file.originalname);
  const fileName = `${file.fieldname}-${uniqueSuffix}${extension}`;
  callback(null, fileName);
};

export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimetypes = [
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
  ];
  if (!allowedMimetypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Only image files are allowed!'),
      false,
    );
  }
  callback(null, true);
};

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: generateFileName,
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5MB
  },
};
