<script lang="ts">
/**
 * @file Camera.svelte
 * @description Manages the robot camera view for both desktop and mobile. Handles fetching
 *              detected plant results and camera information on intervals. Integrates with
 *              stores for plant data and utilities for robot scanner status.
 * 
 * @props
 *   - detectedPlants: Writable<DetectedPlantArray> store of detected plants.
 *   - showCamera: Boolean flag to toggle camera visibility.
 *   - closeCamera: FunctionType to close the camera view.
 * 
 * @imports
 *   - onMount, onDestroy: Svelte lifecycle hooks for managing intervals.
 *   - Writable: Svelte store type.
 *   - RequestHandler: Utility for authenticated API requests.
 *   - CAMERA_INFO: Constant containing default camera configuration.
 *   - CameraInfo: Type definition for camera information.
 *   - DetectedPlantArray, FunctionType: Type definitions for props.
 *   - LabelResultArray: Type definition for latest detection results.
 *   - isRobotNotScanning, isRobotScannerBusy: Utilities for scanner state checks.
 *   - Cameradesktop, Cameramobile: Components for rendering camera views.
 * 
 * @lifecycle
 *   - onMount: Starts intervals for fetching results and camera info.
 *   - onDestroy: Cleans up intervals on component unmount.
 * 
 * @intervals
 *   - fetchResults: Every 1s, retrieves latest detected plant results.
 *   - fetchCameraInfo: Every 100ms, retrieves and updates camera information.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Svelte
import { onMount, onDestroy } from 'svelte';
import type { Writable } from 'svelte/store';

// Utils
import RequestHandler from '$utils/request';
import { isRobotNotScanning, isRobotScannerBusy } from '$utils/robotStatus';

// Constants
import { CAMERA_INFO } from '$constant/cameraInfo';

// Types
import type { CameraInfo } from '$types/cameraInfo';
import type { DetectedPlantArray, FunctionType, PlantList } from '$lib/type';
import type { LabelResultArray } from '$types/labelResult';

// Components
import Cameradesktop from '$routes/spray/cameradesktop.svelte';
import Cameramobile from '$routes/spray/cameramobile.svelte';

// ----------------------------
// Props
// ----------------------------
export let allPlants: PlantList;
export let detectedPlants: Writable<DetectedPlantArray>;
export let showCamera: boolean = false;
export let closeCamera: FunctionType;

// ----------------------------
// Local state
// ----------------------------
let intervalId: NodeJS.Timeout;
let intervalId2: NodeJS.Timeout;
let cameraInfo: CameraInfo = CAMERA_INFO;

// ----------------------------
// Functions
// ----------------------------
const fetchResults = async () => {
    if (isRobotScannerBusy() || isRobotNotScanning()) return;

    const [success, data] = await RequestHandler.authFetch('latest_results', 'GET');
    if (!success) return;

    const latestResults: LabelResultArray = data;
    let newPlant = [...$detectedPlants];

    for (const result of latestResults) {
        const exists = newPlant.some((plant) => plant.key === result.label);
        const plant = allPlants.find((p) => p.name === result.label);

        if (!exists && plant) {
            newPlant.push({
                key: plant.name,
                image: plant.image,
                timestamp: result.timestamp,
                disabled: false,
                disease: Object.fromEntries(
                    plant.diseases.map((d) => [d.name, []])
                ),
                disease_time_spray: Object.fromEntries(
                    plant.diseases.map((d) => [d.name, ['03:00', '22:00']])
                ),
                willSprayEarly: false,
            });
        }
    }
    detectedPlants.set(newPlant);
};


const fetchCameraInfo = async () => {
    if (isRobotScannerBusy() || isRobotNotScanning()) {
        cameraInfo = CAMERA_INFO;
        return;
    }

    try {
        const [cameraSuccess, cameraData] = await RequestHandler.authFetch('camera_info', 'GET');
        let updatedInfo = { ...CAMERA_INFO, ip: cameraInfo.ip };

        if (cameraSuccess && cameraData) updatedInfo = { ...updatedInfo, ...cameraData };

        // Fetch public IP if not set
        if (!updatedInfo.ip || updatedInfo.ip === 'NOT SET') {
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                updatedInfo.ip = ipResponse.ok ? (await ipResponse.json()).ip : 'Unavailable';
            } catch (err) {
                console.warn('Failed to fetch public IP:', err);
                updatedInfo.ip = 'Unavailable';
            }
        }

        cameraInfo = updatedInfo;
    } catch (err) {
        console.error('Error fetching camera info:', err);
        cameraInfo = CAMERA_INFO;
    }
};

// ----------------------------
// Lifecycle
// ----------------------------
onMount(() => {
    intervalId = setInterval(fetchResults, 1000);
    intervalId2 = setInterval(fetchCameraInfo, 100);
});

onDestroy(() => {
    clearInterval(intervalId);
    clearInterval(intervalId2);
});
</script>



<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<Cameradesktop cameraInfo={cameraInfo}/>
<Cameramobile cameraInfo={cameraInfo} showCamera={showCamera} closeCamera={closeCamera}/>
