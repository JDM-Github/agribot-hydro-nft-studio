import { json } from '@sveltejs/kit';
import RequestHandler from '$lib/utils/request';
import { MODE } from "$env/static/private";

export const POST = async ({ request, cookies }) => {
	try {
		const body = await request.json();

		const defaultUserData = {
			user: body.userData.user || {},
			models: body.userData.models || { yoloobjectdetection: [], yolostageclassification: [], maskrcnnsegmentation: [] },
			plants: body.userData.plants || [],
			notifications: body.userData.notifications || [],
			tailscale_devices: body.userData.tailscale_devices || [],
			folders: body.userData.folders || []
		};

		// 1. Login
		const result = await RequestHandler.fetchData('post', 'user/login', {
			userData: undefined, deviceID: undefined, ...body
		});
		if (!result.success) {
			return json({
				success: false,
				message: result.message || 'Login failed.'
			}, { status: 400 });
		}

		cookies.set('session', result.token, {
			httpOnly: true,
			secure: MODE === "production",
			sameSite: "strict",
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
		defaultUserData.user = result.user;

		let saveLogin;
		try {
			saveLogin = await RequestHandler.fetchData('post', 'user/save-login-device', {
				userId: result.user.id,
				deviceID: body.deviceID
			});
		} catch (err) {
			console.error('Error saving login device:', err);
			saveLogin = { success: false, message: 'Failed to save login device.' };
		}

		if (saveLogin.success) {
			try {
				const updateRes = await RequestHandler.fetchData("POST", `user/check-update`, {
					id: result.user.id,
					deviceID: body.deviceID
				});
				if (updateRes.success) {
					const data = updateRes.data;
					defaultUserData.models = {
						yoloobjectdetection: data.yoloObjectDetection || defaultUserData.models.yoloobjectdetection,
						yolostageclassification: data.yoloStageClassification || defaultUserData.models.yolostageclassification,
						maskrcnnsegmentation: data.maskRCNNSegmentation || defaultUserData.models.maskrcnnsegmentation
					};
					defaultUserData.plants = data.plants || defaultUserData.plants;
					defaultUserData.notifications = data.notification || defaultUserData.notifications;
					defaultUserData.tailscale_devices = data.tailscaleDevices || defaultUserData.tailscale_devices;
					defaultUserData.folders = data.folders || defaultUserData.folders
				}
			} catch (err) {
				console.error('Error fetching updates:', err);
			}
		}
		return json({
			success: true,
			data: {
				user: defaultUserData.user,
				models: defaultUserData.models,
				plants: defaultUserData.plants,
				notifications: defaultUserData.notifications,
				tailscale_devices: defaultUserData.tailscale_devices,
				folders: defaultUserData.folders
			}
		});

	} catch (err) {
		console.error('Unexpected error in login POST:', err);
		return json({
			success: false,
			message: 'Internal server error.'
		}, { status: 500 });
	}
};
