import { currentLink } from '$lib/stores/connection';

export const load = async ({ fetch }) => {
	try {
		const response = await fetch(`${currentLink}/get_last_info`);
		if (!response.ok) {
			return {
				robot_state: "Stopped",
				no_camera: true,
				last_frame: null
			};
		}
		const data = await response.json();
		return {
			robot_state: data.robot_state,
			no_camera: data.no_camera,
			last_frame: data.last_frame
		};
	} catch (err) {
		console.error("Fetch failed:", err);

		return {
			robot_state: "Stopped",
			no_camera: true,
			last_frame: null
		};
	}
};