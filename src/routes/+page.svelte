<script lang="ts">
/**
 * @file +page.svelte
 * @description Main spray management page. Handles camera view, spraying setup,
 *              plant detection list, configuration management, navigation guards,
 *              and modal handling for plant selection and spraying actions.
 * 
 * @props
 *   - data: Initial payload containing model data (YOLO, Mask R-CNN, etc.)
 * 
 * @imports
 *   - beforeNavigate: SvelteKit navigation hook
 *   - derived, writable, Readable: Svelte store utilities
 *   - onMount, onDestroy: Svelte lifecycle functions
 *   - Footer, PlantModal, ManuallyAddPlant, SetupSprayModal: Modal/UI components
 *   - Camera, Scannedheader, SprayButton, Detectedplantlist, Stoprobot: Route components
 *   - simpleMode, isRobotRunning, isLivestreaming, isScanning: Store states
 *   - addToast: Toast notifications
 *   - confirmBeforeLeave: Utility for guarded navigation
 *   - configService: Config-related services (initiate, save, revert, download, upload)
 *   - plantService: Plant-related services (disable, filter, remove)
 *   - robotService: Robot control functions
 *   - Types: DetectedPlant, DetectedPlantArray, Spray, Writable types
 * 
 * @localState
 *   - searchPlant: Search query for detected plants
 *   - isAlreadyInitialize: Ensures config initialization only once
 *   - yoloObjectDetection, yoloStageClassification, maskRCNNSegmentation: Model stores
 *   - showManualPlant, showCamera, showModal, showSprayModal: Modal visibility toggles
 *   - selectedPlant, selectedPlantIndex: Currently selected plant info
 *   - previousSprays: Backup of sprays before editing
 *   - filteredDetectedPlantsStore: Derived store filtering plants by search query
 * 
 * @functions
 *   - onSelectPlant: Handles selecting a detected plant, opening PlantModal
 *   - openSprayModal: Opens spray setup modal, saving old configuration
 *   - changeCamera: Toggles camera view
 * 
 * @navigation
 *   - Adds beforeunload handler for unsaved changes
 *   - Uses beforeNavigate to confirm before leaving if config, camera, or modals are active
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// SvelteKit navigation
import { beforeNavigate } from '$app/navigation';

// Svelte core
import { derived, type Readable, type Writable } from 'svelte/store';
import { onMount, onDestroy } from 'svelte';
import { get, writable } from 'svelte/store';

// Types
import type {
	DetectedPlant,
	DetectedPlantArray,
	PlantList,
	PlantListTransformed,
	Spray,
	WritableBoolean,
	WritableModelArray,
	WritableString
} from '$lib/type';

import Footer from '$components/Footer.svelte';
import PlantModal from '$modal/PlantModal.svelte';
import ManuallyAddPlant from '$modal/ManuallyAddPlant.svelte';
import SetupSprayModal from '$modal/SetupSprayModal.svelte';
import Camera from '$routes/spray/camera.svelte';
import Scannedheader from '$routes/spray/scannedheader.svelte';
import SprayButton from '$routes/spray/spraybuttons.svelte';
import Detectedplantlist from '$routes/spray/detectedplantlist.svelte';
import Stoprobot from '$routes/spray/stoprobot.svelte';

import { simpleMode } from '$stores/mode';
import { userData, deviceID } from '$stores/connection';
import { addToast } from '$stores/toast';

import { confirmBeforeLeave } from '$utils/navigation';
import {
	config,
	initiateConfig,
	revertConfig,
	downloadConfig,
	uploadConfig,
	saveConfig
} from '$services/home/configService.js';
import {
	disablePlant,
	filterDetectedPlants,
	removePlant
} from '$services/home/plantService.js';
import { controlScanner } from '$services/home/robotService.js';
import { transformPlantList } from '$root/lib/utils/transform.js';
import { Connection } from '$root/lib/class/connection';

$: allState = Connection.getAllState({conn: true, robot: true, live: true, scan: true, rscan: true, performing: true, robotLive: true, stopCapture: true});
$: conn = allState.connection;
$: rstate = allState.robotrunning;
$: sstate = allState.scanningstate;
$: lstate  = allState.livestreamstate;
$: rcstate  = allState.robotscanningstate;
$: pstate = allState.performingscan;
$: rlstate = allState.robotlivestream;
$: scstate = allState.stopcapturingimage;

$: isConnected = $conn!;
$: robotState = $rstate!;
$: liveState = $lstate!;
$: scannerState = $sstate!;
$: robotScanState = $rcstate!;
$: performing = $pstate!;
$: robotLive = $rlstate!;
$: stopCapture = $scstate!;

// ----------------------------
// Stores & State
// ----------------------------
const searchPlant: WritableString = writable<string>('');
const isAlreadyInitialize: WritableBoolean = writable<boolean>(false);

const yoloObjectDetection: WritableModelArray = writable([]);
const yoloStageClassification: WritableModelArray = writable([]);
const maskRCNNSegmentation: WritableModelArray = writable([]);
const allPlants: Writable<PlantList> = writable([]);
const allPlantsTransformed: Writable<PlantListTransformed> = writable({});

userData.subscribe((user) => {
    if (!user) return;
    yoloObjectDetection.set(user.models?.yoloobjectdetection || []);
    yoloStageClassification.set(user.models?.yolostageclassification || []);
    maskRCNNSegmentation.set(user.models?.maskrcnnsegmentation || []);
    allPlants.set(user.plants || []);
    allPlantsTransformed.set(transformPlantList(user.plants || []));
	initiateConfig(user.user || {}, isAlreadyInitialize, yoloObjectDetection, yoloStageClassification, maskRCNNSegmentation);
});

let showManualPlant: boolean = false;
let showCamera: boolean = false;
let showModal: boolean = false;
let showSprayModal: boolean = false;

let selectedPlantIndex: number = -1;
let selectedPlant: DetectedPlant | null = null;
let previousSprays: Spray | null = null;

const filteredDetectedPlantsStore: Readable<DetectedPlantArray> = derived(
	[config.detectedPlants, searchPlant],
	([$detectedPlants, $searchPlant]) => filterDetectedPlants($detectedPlants, $allPlantsTransformed, $searchPlant)
);

// ----------------------------
// Lifecycle
// ----------------------------
onMount(() => {
	const handler = (event: BeforeUnloadEvent) => {
		if (config.isDirty() || scannerState || showSprayModal || showManualPlant) {
		event.preventDefault();
		}
	};
	window.addEventListener('beforeunload', handler);
	onDestroy(() => window.removeEventListener('beforeunload', handler));
});

// ----------------------------
// Navigation Guards
// ----------------------------
beforeNavigate((navigation) => {
	if (confirmBeforeLeave(config.isDirty(), 'You have unsaved changes. Leave anyway?', navigation)) return;
	if (confirmBeforeLeave(scannerState, 'Camera is open. Close it before leaving?', navigation)) return;
	if (confirmBeforeLeave(showSprayModal, 'Spray setup is open. Close it before leaving?', navigation)) return;
	if (confirmBeforeLeave(showManualPlant, 'Manual plant addition is open. Close it before leaving?', navigation)) return;
});

// ----------------------------
// Methods
// ----------------------------
/**
 * Handle selecting a plant from the list.
 * Opens the PlantModal unless livestream is active.
 */
function onSelectPlant(plant: DetectedPlant, index: number) {
	if (liveState) {
		addToast('Action unavailable while livestreaming is active.', 'error', 3000);
		return;
	}
    if (robotState) {
        addToast('Action unavailable while robot is active.', 'error', 3000);
		return;
    }
	selectedPlantIndex = index;
	selectedPlant = plant;
	showModal = true;
}

/**
 * Open spray setup modal and store previous spray configuration.
 */
function openSprayModal() {
    previousSprays = {
        spray: [...get(config.sprays).spray],
        active: [...get(config.sprays).active],
        duration: [...get(config.sprays).duration]
    };
    showSprayModal = true;
}

/**
 * Toggle camera display.
 */
function changeCamera(camera: boolean) {
    showCamera = camera;
}
</script>


<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
{#if robotState}
    <Stoprobot whatRunning="robot"/>
{:else if liveState}
    <Stoprobot whatRunning="livestream"/>
{:else if robotScanState}
    <Stoprobot whatRunning="robot scanner" />
{:else if performing}
	<Stoprobot whatRunning="perform scan" />
{:else if robotLive}
	<Stoprobot whatRunning="robot live" />
{:else if stopCapture}
	<Stoprobot whatRunning="capture" />
{:else}
    <div class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700">
        <div
            class="relative z-10 mb-4 flex flex-col gap-4 md:flex-row"
            class:w-6xl={$simpleMode}
            class:mx-auto={$simpleMode}
        >
            {#if !$simpleMode}
                <Camera
                    allPlants={$allPlants}
                    detectedPlants={config.detectedPlants}
                    {showCamera}
                    closeCamera={() => changeCamera(false)}
                    isConnected={isConnected}
                    liveState={liveState}
                    scannerState={scannerState}
                    robotState={robotState}
                    robotScanState={robotScanState}
                    performing={performing}
                    robotLive={robotLive}
                    stopCapture={stopCapture}
                />
            {/if}
            <div class="w-full rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
                <Scannedheader
                    {searchPlant}
                    {revertConfig}
                />
                <div
                    class="mx-2 max-h-[250px] space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 md:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
                >
                    <Detectedplantlist
                        plants={$filteredDetectedPlantsStore}
                        onSelectPlant={onSelectPlant}

                        liveState={liveState}
                        robotState={robotState}
                        robotScanState={robotScanState}
                        performing={performing}
                        robotLive={robotLive}
                        stopCapture={stopCapture}
                    />
                </div>

                <SprayButton
                    {controlScanner}
                    isConnected={isConnected}
                    liveState={liveState}
                    scannerState={scannerState}
                    robotState={robotState}
                    robotScanState={robotScanState}
                    performing={performing}
                    robotLive={robotLive}
                    stopCapture={stopCapture}

                    openSprayModal={openSprayModal}
                    openCamera={() => changeCamera(true)}
                    {config}
                    {yoloObjectDetection}
                    {yoloStageClassification}
                    {maskRCNNSegmentation}
                    saveConfig={async () => {
                        saveConfig($userData, $deviceID);
                    }}
                    {downloadConfig}
                    uploadConfig={() => uploadConfig(
                        $allPlantsTransformed,
                        yoloObjectDetection,
                        yoloStageClassification,
                        maskRCNNSegmentation,
                    )}
                    openManualPlant={() => (showManualPlant = true)}
                />
            </div>
        </div>
    </div>

    <PlantModal
        {removePlant}
        allPlantsTransformed={$allPlantsTransformed}
        disabledPlant={() => disablePlant(selectedPlantIndex)}
        {selectedPlant}
        slots={config.sprays}
        bind:showModal
        closeModal={() => (showModal = false)}
    />

    {#if previousSprays !== null}
        <SetupSprayModal
            bind:showSprayModal
            closeModal={() => (showSprayModal = false)}
            sprays={config.sprays}
            {previousSprays}
        />
    {/if}

    <ManuallyAddPlant
        allPlants={$allPlants}
        allPlantsTransformed={$allPlantsTransformed}
        detectedPlants={config.detectedPlants}
        showModal={showManualPlant}
        closeModal={() => (showManualPlant = false)}
    />
{/if}
<Footer />