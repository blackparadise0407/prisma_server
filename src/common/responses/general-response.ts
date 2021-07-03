export class GeneralResponse {
	private message = 'Ok';
	private data: any;
	constructor({ message, data }: { message?: string; data?: any }) {
		if (data) this.data = data;
		if (message) this.message = message;
	}
}
