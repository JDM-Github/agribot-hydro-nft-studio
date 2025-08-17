import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } from '$env/static/private';
import JSZip from 'jszip';
import { Buffer } from 'buffer';

cloudinary.config({
	cloud_name: CLOUDINARY_NAME,
	api_key: CLOUDINARY_API,
	api_secret: CLOUDINARY_SECRET,
	secure: true
});

export async function GET({ params, locals }) {
	const folderSlug = params.slug;
	const email = locals.user?.email;

	if (!email) {
		return new Response('Unauthorized', { status: 401 });
	}

	const folderName = email.split('@')[0];
	const folderPath = `${folderName}/${folderSlug}`;

	try {
		const result = await cloudinary.api.resources_by_asset_folder(folderPath, {
			max_results: 100
		});

		const zip = new JSZip();
		for (const image of result.resources) {
			try {
				const res = await fetch(image.secure_url);
				if (!res.ok) throw new Error(`Failed fetch ${image.secure_url}`);
				const arrayBuffer = await res.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				const ext = image.format || 'jpg';
				const filename = image.public_id.split('/').pop() + '.' + ext;

				zip.file(filename, buffer);
			} catch (innerErr) {
				console.error(`Skipping ${image.public_id}:`, innerErr);
			}
		}

		const content = await zip.generateAsync({ type: 'nodebuffer' });

		return new Response(content, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${folderSlug}.zip"`
			}
		});
	} catch (err) {
		console.error('Error generating zip:', err);
		return new Response('Failed to generate zip', { status: 500 });
	}
}
