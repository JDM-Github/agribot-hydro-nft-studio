export const load = async ({ fetch, locals }) => {
	let robotName = null;
	let currentLink = null;
	if (locals.user) {
		robotName = locals.user.prototypeID;
		currentLink =
			import.meta.env.VITE_ENV === 'production'
				? locals.user.prototypeID
				: import.meta.env.VITE_DEVELOPMENT_LINK || 'http://127.0.0.1:8000';
	}

	if (!robotName || !currentLink) {
		return {
			is_livestreaming: 'Stopped',
			no_camera: true,
			last_frame: null
		};
	}
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
				is_livestreaming: 'Stopped',
				no_camera: true,
				last_frame: null
			};
		}
		const data = await response.json();
		return {
			is_livestreaming: data.is_livestreaming,
			no_camera: data.no_camera,
			last_frame: data.last_frame
		};
	} catch (err) {
		console.error('Fetch failed:', err);

		return {
			is_livestreaming: 'Stopped',
			no_camera: true,
			last_frame: null
		};
	}
};
