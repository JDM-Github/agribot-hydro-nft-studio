import { json, type RequestHandler } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: 'dhud4mpgu',
	api_key: '143511642428641',
	api_secret: '2nIL6TKeyhwzfcVV1_9XGArAbbs',
	secure: true
});

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { public_id } = await request.json();
		console.log('Received public_id:', public_id);

		if (!public_id) {
			return json({ error: 'Missing public_id' }, { status: 400 });
		}

		const result = await cloudinary.uploader.destroy(public_id);

		if (result.result !== 'ok') {
			return json({ error: 'Failed to delete image' }, { status: 500 });
		}

		return json({ success: true });
	} catch (err) {
		console.error('Cloudinary delete error:', err);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
