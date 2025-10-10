// import { v2 as cloudinary } from 'cloudinary';
// import { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } from '$env/static/private';
// cloudinary.config({
// 	cloud_name: CLOUDINARY_NAME,
// 	api_key: CLOUDINARY_API,
// 	api_secret: CLOUDINARY_SECRET,
// 	secure: true
// });

// function getTodayFolder(): string {
// 	const today = new Date();
// 	const mm = String(today.getMonth() + 1).padStart(2, '0');
// 	const dd = String(today.getDate()).padStart(2, '0');
// 	const yyyy = today.getFullYear();
// 	return `${mm}${dd}${yyyy}`;
// }

export const load = async ({ locals, url }) => {
	// // --- Cloudinary images setup ---
	// let images: any[] = [];
	return {images: []};

	// try {
	// 	const currentUser: any = locals.user;
	// 	if (currentUser?.email) {
	// 		const folderName = currentUser.email.split('@')[0];

	// 		const requestedDate = url.searchParams.get('date');
	// 		const targetFolder = requestedDate || getTodayFolder();
	// 		const result = await cloudinary.api.resources_by_asset_folder(
	// 			`${folderName}/${targetFolder}`,
	// 			{ max_results: 50 }
	// 		);

	// 		images = result.resources
	// 			.filter((image: any) => image.context?.custom.plantName !== 'SCANBOX')
	// 			.map((image: any) => ({
	// 				id: image.public_id,
	// 				src: image.secure_url,
	// 				timestamp: new Date(image.created_at).toLocaleString(),
	// 				plantName: image.context?.custom.plantName || 'Unknown Plant',
	// 				diseaseName: image.context?.custom.healthName || 'Unknown Disease',
	// 				imageSize: image.width + 'x' + image.height,
	// 				generatedDescription:
	// 					image.context?.custom.description ||
	// 					`A plant image showing symptoms of ${image.context?.custom.healthName || 'an unknown condition'}.`
	// 			}));
	// 	}
	// } catch (err) {
	// 	console.error('Cloudinary fetch failed:', err);
	// 	images = [];
	// }
	// return {
	// 	images,
	// };

};
