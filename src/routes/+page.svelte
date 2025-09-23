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
import { derived, type Readable } from 'svelte/store';
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

// Components
import Footer from '$components/Footer.svelte';
import PlantModal from '$modal/PlantModal.svelte';
import ManuallyAddPlant from '$modal/ManuallyAddPlant.svelte';
import SetupSprayModal from '$modal/SetupSprayModal.svelte';
import Camera from '$routes/spray/camera.svelte';
import Scannedheader from '$routes/spray/scannedheader.svelte';
import SprayButton from '$routes/spray/spraybuttons.svelte';
import Detectedplantlist from '$routes/spray/detectedplantlist.svelte';
import Stoprobot from '$routes/spray/stoprobot.svelte';

// Stores
import { simpleMode } from '$stores/mode';
import { isRobotRunning, isLivestreaming, isScanning } from '$stores/connection';
import { addToast } from '$stores/toast';

// Utils & Services
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
import { controlRobot } from '$services/home/robotService.js';
import { transformPlantList } from '$root/lib/utils/transform.js';

// ----------------------------
// Props
// ----------------------------
export let data;

// ----------------------------
// Stores & State
// ----------------------------
const searchPlant: WritableString = writable<string>('');
const isAlreadyInitialize: WritableBoolean = writable<boolean>(false);

const yoloObjectDetection: WritableModelArray = writable(data.models.yoloobjectdetection);
const yoloStageClassification: WritableModelArray = writable(data.models.yolostageclassification);
const maskRCNNSegmentation: WritableModelArray = writable(data.models.maskrcnnsegmentation);
const allPlants: PlantList = data.plants;
const allPlantsTransformed: PlantListTransformed = transformPlantList(data.plants);

let showManualPlant: boolean = false;
let showCamera: boolean = false;
let showModal: boolean = false;
let showSprayModal: boolean = false;

let selectedPlantIndex: number = -1;
let selectedPlant: DetectedPlant | null = null;
let previousSprays: Spray | null = null;

// Derived store for filtering detected plants
const filteredDetectedPlantsStore: Readable<DetectedPlantArray> = derived(
	[config.detectedPlants, searchPlant],
	([$detectedPlants, $searchPlant]) => filterDetectedPlants($detectedPlants, allPlantsTransformed, $searchPlant)
);

// ----------------------------
// Lifecycle
// ----------------------------
onMount(() => {
	initiateConfig(isAlreadyInitialize, yoloObjectDetection, yoloStageClassification, maskRCNNSegmentation);
	const handler = (event: BeforeUnloadEvent) => {
		if (config.isDirty() || $isScanning || showSprayModal || showManualPlant) {
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
	if (confirmBeforeLeave($isScanning, 'Camera is open. Close it before leaving?', navigation)) return;
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
	if ($isLivestreaming !== 'Stopped') {
		addToast('Action unavailable while livestreaming is active.', 'error', 3000);
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

{#if $isRobotRunning != 'Stopped'}
    <Stoprobot />
{:else}
    <div class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700">
        <div
            class="relative z-10 mb-4 flex flex-col gap-4 md:flex-row"
            class:w-6xl={$simpleMode}
            class:mx-auto={$simpleMode}
        >
            {#if !$simpleMode}
                <Camera
                    allPlants={allPlants}
                    detectedPlants={config.detectedPlants}
                    {showCamera}
                    closeCamera={() => changeCamera(false)}
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
                    />
                </div>

                <SprayButton
                    {controlRobot}
                    openSprayModal={openSprayModal}
                    openCamera={() => changeCamera(true)}
                    {config}
                    {yoloObjectDetection}
                    {yoloStageClassification}
                    {maskRCNNSegmentation}
                    saveConfig={() => saveConfig(data)}
                    {downloadConfig}
                    uploadConfig={() => uploadConfig(
                        allPlantsTransformed,
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
        allPlantsTransformed={allPlantsTransformed}
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
        allPlants={allPlants}
        allPlantsTransformed={allPlantsTransformed}
        detectedPlants={config.detectedPlants}
        showModal={showManualPlant}
        closeModal={() => (showManualPlant = false)}
    />
{/if}
<Footer />