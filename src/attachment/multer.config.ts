import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentType } from './attachment.entity';

const CONF = {
	image: {
		limit: 1024 * 1024, // 1MB
		mime: ['image/jpeg', 'image/png', 'image/webp'],
	},
	video: {
		limit: 1024 * 1024 * 100, // 100MB
		mime: ['video/x-msvideo', 'video/mp4', 'video/mpeg', 'video/webm'],
	},
};

const storage = diskStorage({
	destination: './public',
	filename: (_, file, cb) => {
		cb(null, generateFileName(file));
	},
});

const generateFileName = (file: Express.Multer.File): string => {
	return `${Date.now()}${extname(file.originalname)}`;
};

const fileFilter = (type: AttachmentType) => {
	return (
		req: any,
		file: {
			fieldname: string;
			originalname: string;
			encoding: string;
			mimetype: string;
			size: number;
			destination: string;
			filename: string;
			path: string;
			buffer: Buffer;
		},
		callback: (error: Error, acceptFile: boolean) => void,
	) => {
		if (CONF[type.toLowerCase()].mime.indexOf(file.mimetype) === -1) {
			req.fileValidationError = 'Unsupported mime type';
			callback(null, false);
		} else callback(null, true);
	};
};

export const multetOpts = (type: AttachmentType): MulterOptions => {
	return {
		storage,
		fileFilter: fileFilter(type),
		limits: {
			fileSize: CONF[type.toLowerCase()].limit,
		},
	};
};
