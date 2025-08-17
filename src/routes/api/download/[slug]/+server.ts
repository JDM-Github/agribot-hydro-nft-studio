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

export async function GET({ params }) {
	const folderSlug = params.slug;

	try {
		const result = await cloudinary.api.resources_by_asset_folder(folderSlug, {
			max_results: 100
		});

		const zip = new JSZip();
		for (const image of result.resources) {
			const response = await fetch(image.secure_url);
			const buffer = Buffer.from(await response.arrayBuffer());
			const filename = image.public_id.split('/').pop() + '.jpg';
			zip.file(filename, buffer);
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
