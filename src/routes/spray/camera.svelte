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
import type { Writable } from 'svelte/store';

// Types
import type { DetectedPlantArray, FunctionType, PlantList } from '$lib/type';

// Components
import Cameradesktop from '$routes/spray/cameradesktop.svelte';
import Cameramobile from '$routes/spray/cameramobile.svelte';
import { Connection } from '$root/lib/class/connection';

// ----------------------------
// Props
// ----------------------------
export let isConnected: boolean;
export let liveState: number;
export let scannerState: boolean;
export let robotState: number;
export let robotScanState: boolean;
export let performing: boolean;
export let robotLive: boolean;
export let stopCapture: boolean;

export let allPlants: PlantList;
export let detectedPlants: Writable<DetectedPlantArray>;
export let showCamera: boolean = false;
export let closeCamera: FunctionType;

// ----------------------------
// Local state
// ----------------------------
$: cameraInfo = Connection.getCameraInfo();
$: latestResults = Connection.getLatestCameraResults();
$: if ($latestResults.length) {
    let newPlant = [...$detectedPlants];

    for (const result of $latestResults) {
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
}
</script>


<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<Cameradesktop
    cameraInfo={$cameraInfo}
    isConnected={isConnected}
    liveState={liveState}
    scannerState={scannerState}
    robotState={robotState}
    robotScanState={robotScanState}
    performing={performing}
    robotLive={robotLive}
    stopCapture={stopCapture}
/>
<Cameramobile
    cameraInfo={$cameraInfo}
    showCamera={showCamera}
    closeCamera={closeCamera}
    isConnected={isConnected}
    liveState={liveState}
    scannerState={scannerState}
    robotState={robotState}
    robotScanState={robotScanState}
    performing={performing}
    robotLive={robotLive}
    stopCapture={stopCapture}
/>
