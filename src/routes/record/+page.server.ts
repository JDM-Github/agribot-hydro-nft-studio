import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } from '$env/static/private';
cloudinary.config({
	cloud_name: CLOUDINARY_NAME,
	api_key: CLOUDINARY_API,
	api_secret: CLOUDINARY_SECRET,	
	secure: true
});

export const load = async ({locals}) => {
	try {
		const currentUser: any = locals.user;
		if (!currentUser) return { records: [] };
		const email = currentUser?.email || '';
		if (!email) return { records: [] };
		const folderName = email.split('@')[0];
		const result = await cloudinary.api.sub_folders(folderName);
		const folders = result.folders.map((folder: any) => {
			const slug = folder.name;
			const date = formatFolderSlugToDate(slug);
			return { date, slug };
		});
		return { records: folders };
	} catch (error) {
		console.error('Failed to fetch folders:', error);
		return { records: [] }; 
	}
};

function formatFolderSlugToDate(slug: string): string {
	const month = parseInt(slug.slice(0, 2)) - 1;
	const day = parseInt(slug.slice(2, 4));
	const year = parseInt(slug.slice(4));
	const date = new Date(year, month, day);
	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
