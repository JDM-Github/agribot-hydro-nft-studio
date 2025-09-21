import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } from '$env/static/private';
cloudinary.config({
	cloud_name: CLOUDINARY_NAME,
	api_key: CLOUDINARY_API,
	api_secret: CLOUDINARY_SECRET,
	secure: true
});

// Utility to format date as mmddyyyy
function getTodayFolder(): string {
	const today = new Date();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const yyyy = today.getFullYear();
	return `${mm}${dd}${yyyy}`;
}

export const load = async ({ fetch, locals, url }) => {
	let robotName = null;
	let currentLink = null;

	// --- Robot livestream setup ---
	if (locals.user) {
		robotName = locals.user.prototypeID;
		currentLink =
			import.meta.env.VITE_ENV === 'production'
				? 'http://' + locals.user.prototypeID + ':8000'
				: import.meta.env.VITE_DEVELOPMENT_LINK || 'http://127.0.0.1:8000';
	}

	// Early return if no robot configured
	if (!robotName || !currentLink) {
		return {
			is_livestreaming: 'Stopped',
			no_camera: true,
			last_frame: null,
			images: [],
			folder: {}
		};
	}

	// --- Cloudinary images setup ---
	let images: any[] = [];

	try {
		const currentUser: any = locals.user;
		if (currentUser?.email) {
			const folderName = currentUser.email.split('@')[0];

			const requestedDate = url.searchParams.get('date');
			const targetFolder = requestedDate || getTodayFolder();
			const result = await cloudinary.api.resources_by_asset_folder(
				`${folderName}/${targetFolder}`,
				{ max_results: 50 }
			);

			images = result.resources
				.filter((image: any) => image.context?.custom.plantName !== 'SCANBOX')
				.map((image: any) => ({
					id: image.public_id,
					src: image.secure_url,
					timestamp: new Date(image.created_at).toLocaleString(),
					plantName: image.context?.custom.plantName || 'Unknown Plant',
					diseaseName: image.context?.custom.healthName || 'Unknown Disease',
					imageSize: image.width + 'x' + image.height,
					generatedDescription:
						image.context?.custom.description ||
						`A plant image showing symptoms of ${image.context?.custom.healthName || 'an unknown condition'}.`
			}));
		}
	} catch (err) {
		console.error('Cloudinary fetch failed:', err);
		images = [];
	}

	// --- Livestream fetch ---
	try {
		const response = await fetch(`${currentLink}/get_last_info`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${robotName}`
			}
		});

		if (!response.ok) {
			return {
				no_camera: true,
				last_frame: null,
				images,
			};
		}

		const data = await response.json();
		return {
			no_camera: data.no_camera,
			last_frame: data.last_frame,
			images,
		};
	} catch (err) {
		console.error('Fetch failed:', err);

		return {
			no_camera: true,
			last_frame: null,
			images,
		};
	}
};
