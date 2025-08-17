import { json, type RequestHandler } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } from '$env/static/private';

cloudinary.config({
	cloud_name: CLOUDINARY_NAME,
	api_key: CLOUDINARY_API,
	api_secret: CLOUDINARY_SECRET,
	secure: true
});

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { public_id } = await request.json();
		console.log('Received public_id:', public_id);

		if (!public_id) {
			return json({ error: 'Missing public_id' }, { status: 400 });
		}

		const normalizedId = public_id.replace(/\s+/g, "_");
		const result = await cloudinary.uploader.destroy(normalizedId, {
			resource_type: "image",
			invalidate: true,
			type: "upload"
		});

		console.log("Deleting:", normalizedId, result);
		if (result.result !== 'ok') {
			return json({ error: `Failed to delete image: ${result.result}` }, { status: 500 });
		}

		return json({ success: true });
	} catch (err) {
		console.error('Cloudinary delete error:', err);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
