import { json } from '@sveltejs/kit';
import RequestHandler from '$lib/utils/request';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const isForce = body.force;
        const defaultUserData = {
            user: body.userData.user || {},
            models: body.userData.models || { yoloobjectdetection: [], yolostageclassification: [], maskrcnnsegmentation: [] },
            plants: body.userData.plants || [],
            notifications: body.userData.notifications || [],
            tailscale_devices: body.userData.tailscale_devices || [],
            folders: body.userData.folders || []
        };
        try {
            const updateRes = await RequestHandler.fetchData("POST", `user/check-update`, {
                id: defaultUserData.user.id,
                deviceID: body.deviceID,
                isForce
            });
            if (updateRes.success) {
                const data = updateRes.data;
                defaultUserData.user = data.user || defaultUserData.user;
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
