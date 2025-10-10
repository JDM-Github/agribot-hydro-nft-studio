import { json } from '@sveltejs/kit';
import RequestHandler from '$lib/utils/request';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const willUpdateUser = body.willUpdateUser ?? false;
        const willUpdateModels = body.willUpdateModels ?? false;
        const willUpdatePlants = body.willUpdatePlants ?? false;
        const willUpdateNotifications = body.willUpdateNotifications ?? false;
        const willUpdateTailscale = body.willUpdateTailscale ?? false;
        const willUpdateFolders = body.willUpdateFolders ?? false;

        let updatedData = {
            user: body.userData.user || {},
            models: body.userData.models || {
                yoloobjectdetection: [],
                yolostageclassification: [],
                maskrcnnsegmentation: []
            },
            plants: body.userData.plants || [],
            notifications: body.userData.notifications || [],
            tailscale_devices: body.userData.tailscale_devices || [],
            folders: body.userData.folders || []
        };

        try {
            const updateRes = await RequestHandler.fetchData('POST', `user/check-custom-update`, {
                id: updatedData.user.id,
                deviceID: body.deviceID,
                willUpdateUser,
                willUpdateModels,
                willUpdatePlants,
                willUpdateNotifications,
                willUpdateTailscale,
                willUpdateFolders
            });

            if (updateRes.success) {
                const data = updateRes.data;

                if (willUpdateUser && data.user) {
                    updatedData.user = data.user;
                }
                if (willUpdateModels) {
                    updatedData.models = {
                        yoloobjectdetection: data.yoloObjectDetection || updatedData.models.yoloobjectdetection,
                        yolostageclassification: data.yoloStageClassification || updatedData.models.yolostageclassification,
                        maskrcnnsegmentation: data.maskRCNNSegmentation || updatedData.models.maskrcnnsegmentation
                    };
                }
                if (willUpdatePlants && data.plants) {
                    updatedData.plants = data.plants;
                }
                if (willUpdateNotifications && data.notification) {
                    updatedData.notifications = data.notification;
                }
                if (willUpdateTailscale && data.tailscaleDevices) {
                    updatedData.tailscale_devices = data.tailscaleDevices;
                }
                if (willUpdateFolders && data.folders) {
                    updatedData.folders = data.folders;
                }
            }
        } catch (err) {
            console.error('Error fetching selective updates:', err);
        }

        return json({
            success: true,
            data: updatedData
        });
    } catch (err) {
        console.error('Unexpected error in custom update POST:', err);
        return json(
            {
                success: false,
                message: 'Internal server error.'
            },
            { status: 500 }
        );
    }
};
