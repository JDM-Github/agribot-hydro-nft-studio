import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
// 	cloud_name: 'dhud4mpgu',
// 	api_key: '143511642428641',
// 	api_secret: '2nIL6TKeyhwzfcVV1_9XGArAbbs',
// 	secure: true
// });
cloudinary.config({
	cloud_name: import.meta.env.CLOUDINARY_NAME,
	api_key: import.meta.env.CLOUDINARY_API,
	api_secret: import.meta.env.CLOUDINARY_SECRET,
	secure: true
});

export const load = async ({ params, locals }) => {
	const folderSlug = params.slug;
	const currentUser: any = locals.user;
	try {
		const email = currentUser?.email || '';
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
