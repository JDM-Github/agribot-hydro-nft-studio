<script lang="ts">
/**
 * @file +page.svelte
 * @description Main setup page logic for AGRIBOT. Handles configuration, plant management,
 *              robot control, and UI interactions. Uses reactive Svelte stores and services.
 *
 * @author      AGRIBOT Team
 * @created     2025-04-21
 * @lastUpdated 2025-09-21
 */

// ----------------------------
// SvelteKit navigation helpers
// ----------------------------
import { beforeNavigate } from '$app/navigation';

// ----------------------------
// Svelte core lifecycle & reactive state
// ----------------------------
import { derived, type Readable } from 'svelte/store';
import { onMount, onDestroy } from 'svelte';
import { get, writable } from 'svelte/store';

// ----------------------------
// Type definitions & classes
// ----------------------------
import type {
	DetectedPlant,
	DetectedPlantArray,
	Spray,
	WritableBoolean,
	WritableModelArray,
	WritableString
} from '$lib/type';

// ----------------------------
// UI Components
// ----------------------------
import Footer from '$components/Footer.svelte';

// Modal components for plant management
import PlantModal from '$modal/PlantModal.svelte';
import ManuallyAddPlant from '$modal/ManuallyAddPlant.svelte';
import SetupSprayModal from '$modal/SetupSprayModal.svelte';

// Spray page UI components
import Camera from '$routes/spray/camera.svelte';
import Scannedheader from '$routes/spray/scannedheader.svelte';
import SprayButton from '$routes/spray/spraybuttons.svelte';

// ----------------------------
// Svelte stores
// ----------------------------
// Application mode
import { simpleMode } from '$stores/mode';
// Robot & livestream status
import { isRobotRunning, isLivestreaming, isScanning } from '$stores/connection';
// Toast/notification helpers
import { addToast } from '$stores/toast';

// ----------------------------
// Utility functions / Services
// ----------------------------
import { confirmBeforeLeave } from '$utils/navigation';
import {
	config,
	initiateConfig,
	revertConfig,
	downloadConfig,
	uploadConfig,
	saveConfig
} from '$services/home/configService.js';
import { disablePlant, filterDetectedPlants, removePlant } from '$services/home/plantService.js';
import { controlRobot } from '$services/home/robotService.js';
import Detectedplantlist from './spray/detectedplantlist.svelte';
	import Stoprobot from './spray/stoprobot.svelte';

// ----------------------------
// Props & reactive variables
// ----------------------------
export let data;

// Search term for filtering detected plants
const searchPlant: WritableString = writable<string>('');

// Initialization state to prevent double initialization
const isAlreadyInitialize: WritableBoolean = writable<boolean>(false);

// Model arrays from server data
const yoloObjectDetection: WritableModelArray = writable(data.models.yoloobjectdetection);
const yoloStageClassification: WritableModelArray = writable(data.models.yolostageclassification);
const maskRCNNSegmentation: WritableModelArray = writable(data.models.maskrcnnsegmentation);

// UI state flags
let showManualPlant: boolean = false;
let showCamera: boolean = false;
let showModal: boolean = false;
let showSprayModal: boolean = false;

// Currently selected plant info
let selectedPlantIndex: number = -1;
let selectedPlant: DetectedPlant | null = null;
let previousSprays: Spray | null = null;

// ----------------------------
// Derived & reactive stores
// ----------------------------
// Filtered plants based on search term and detected plants
const filteredDetectedPlantsStore: Readable<DetectedPlantArray> = derived(
	[config.detectedPlants, searchPlant],
	([$detectedPlants, $searchPlant]) => filterDetectedPlants($detectedPlants, $searchPlant)
);

// ----------------------------
// Lifecycle hooks
// ----------------------------
onMount(() => {
	// Initialize configuration from localStorage
	initiateConfig(isAlreadyInitialize);

	// Warn user if trying to close/refresh page with unsaved changes
	const handler = (event: BeforeUnloadEvent) => {
		if (config.isDirty() || $isScanning || showSprayModal || showManualPlant) {
			event.preventDefault();
		}
	};

	window.addEventListener('beforeunload', handler);
	onDestroy(() => window.removeEventListener('beforeunload', handler));
});

// ----------------------------
// Navigation guards
// ----------------------------
// Prompt user before leaving page if certain conditions are met
beforeNavigate((navigation) => {
	if (confirmBeforeLeave(config.isDirty(), 'You have unsaved changes. Leave anyway?', navigation)) return;
	if (confirmBeforeLeave($isScanning, 'Camera is open. Close it before leaving?', navigation)) return;
	if (confirmBeforeLeave(showSprayModal, 'Spray setup is open. Close it before leaving?', navigation)) return;
	if (confirmBeforeLeave(showManualPlant, 'Manual plant addition is open. Close it before leaving?', navigation)) return;
});

// ----------------------------
// Event handlers / UI functions
// ----------------------------

/**
 * Handle selecting a plant from the list.
 * Opens the PlantModal unless livestream is active.
 *
 * @param plant - The detected plant object that was selected
 * @param index - Index of the selected plant in the list
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
 * Toggle camera display
 * @param camera - true to show, false to hide
 */
function changeCamera(camera: boolean) {
	showCamera = camera;
}
</script>

{#if $isRobotRunning != 'Stopped'}
	<!-- Display stop robot UI if robot is running -->
	<Stoprobot />
{:else}
	<!-- Main spray dashboard layout -->
	<div class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700">
		<div
			class="relative z-10 mb-4 flex flex-col gap-4 md:flex-row"
			class:w-6xl={$simpleMode}
			class:mx-auto={$simpleMode}
		>
			{#if !$simpleMode}
				<!-- Camera view -->
				<Camera
					detectedPlants={config.detectedPlants}
					{showCamera}
					closeCamera={() => changeCamera(false)}
				/>
			{/if}
			<div class="w-full rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
				<!-- Header with search and revert config -->
				<Scannedheader
					{searchPlant}
					{revertConfig}
				/>
				<div
					class="mx-2 max-h-[250px] space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 md:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
				>
					<!-- Detected plants list -->
					<Detectedplantlist
						plants={$filteredDetectedPlantsStore}
						onSelectPlant={onSelectPlant}
					/>
				</div>

				<!-- Spray control panel -->
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
					{uploadConfig}
					openManualPlant={() => (showManualPlant = true)}
				/>
			</div>
		</div>
	</div>

	<!-- Plant detail modal -->
	<PlantModal
		{removePlant}
		disabledPlant={() => disablePlant(selectedPlantIndex)}
		{selectedPlant}
		slots={get(config.sprays).spray}
		bind:showModal
		closeModal={() => (showModal = false)}
	/>

	<!-- Spray setup modal -->
	{#if previousSprays !== null}
		<SetupSprayModal
			bind:showSprayModal
			closeModal={() => (showSprayModal = false)}
			sprays={config.sprays}
			{previousSprays}
		/>
	{/if}

	<!-- Manual plant addition modal -->
	<ManuallyAddPlant
		detectedPlants={config.detectedPlants}
		showModal={showManualPlant}
		closeModal={() => (showManualPlant = false)}
	/>
{/if}
<Footer />