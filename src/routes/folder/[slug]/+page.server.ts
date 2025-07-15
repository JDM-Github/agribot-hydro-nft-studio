import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } from '$env/static/private';
cloudinary.config({
	cloud_name: CLOUDINARY_NAME,
	api_key: CLOUDINARY_API,
	api_secret: CLOUDINARY_SECRET,
	secure: true
});

export const load = async ({ params, locals }) => {
	const folderSlug = params.slug;
	const currentUser: any = locals.user;
	try {
		const email = currentUser?.email || '';
		if (!email) return { images: [], folder: {} };
		const folderName = email.split('@')[0];
		const result = await cloudinary.api.resources_by_asset_folder(`${folderName}/${folderSlug}`);
		const images = result.resources.map((image: any) => ({
			id: image.public_id,
			src: image.secure_url,
			timestamp: new Date(image.created_at).toLocaleString(),
			plantName: image.context?.plantName || 'Unknown Plant',
			diseaseName: image.context?.diseaseName || 'Unknown Disease',
			location: {
				address: 'Greenhouse #3, Farmville',
				latitude: 37.7749,
				longitude: -122.4194
			},
			imageSize: image.width + 'x' + image.height,
			generatedDescription: `A plant image showing symptoms of ${image.context?.diseaseName || 'an unknown condition'}.`
		}));
		let folderMetadata = {
			id: folderSlug,
			name: `Folder ${folderSlug}`,
			createdAt: 'March 22, 2025, 10:30 AM',
			lastModified: 'March 25, 2025, 3:15 PM',
			size: `${result.resources.length * 10}MB`,
			fileCount: result.resources.length,
			access: 'Private',
			tags: ['Design', 'Development'],
			permissions: {
				canEdit: true,
				canShare: true,
				canDelete: true
			}
		};

		return { images, folder: folderMetadata };
	} catch (err) {
		console.error('Error fetching images:', err);
		let folderMetadata = {
			id: folderSlug,
			name: `Folder ${folderSlug}`,
			createdAt: 'NA',
			lastModified: 'NA',
			size: `0MB`,
			fileCount: 0,
			access: 'Private',
			tags: ['Design', 'Development'],
			permissions: {
				canEdit: true,
				canShare: true,
				canDelete: true
			}
		};
		return { images: [], folder: folderMetadata };
	}
};
