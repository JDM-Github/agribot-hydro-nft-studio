import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: 'dhud4mpgu',
	api_key: '143511642428641',
	api_secret: '2nIL6TKeyhwzfcVV1_9XGArAbbs',
	secure: true
});

export const load = async () => {
	try {
		const result = await cloudinary.api.sub_folders('records');
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
