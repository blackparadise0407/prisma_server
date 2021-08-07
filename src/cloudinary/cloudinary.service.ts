import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { AttachmentType } from 'src/attachment/attachment.entity';

@Injectable()
export class CloudinaryService {
	async uploadSingle({
		path,
		name,
		type,
	}: {
		path: string;
		name: string;
		type: AttachmentType;
	}): Promise<string> {
		try {
			const resp = await v2.uploader.upload(path, {
				public_id: `${type.toLowerCase()}/${name.split('.')[0]}`,
			});
			return resp.secure_url;
		} catch (e) {
			throw e;
		}
	}
}
