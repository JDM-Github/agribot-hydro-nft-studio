<script lang="ts">
/**
 * @file spraybuttons.svelte
 * @description Handles robot spraying configuration, model management, and related modals
 *              (radar, scheduling, configuration, and details). Provides bindings for YOLO
 *              and Mask R-CNN models, confidence thresholds, and configuration persistence.
 * 
 * @props
 *   - controlRobot: Function to control robot movement/actions.
 *   - openSprayModal: Function to open the spray modal.
 *   - openCamera: Function to open the live camera modal.
 *   - openManualPlant: FunctionType for opening manual plant view.
 *   - config: Config object containing model versions and confidence thresholds.
 *   - yoloObjectDetection: WritableModelArray for object detection models.
 *   - yoloStageClassification: WritableModelArray for stage classification models.
 *   - maskRCNNSegmentation: WritableModelArray for disease segmentation models.
 *   - saveConfig: Function to save configuration.
 *   - downloadConfig: Function to download configuration.
 *   - uploadConfig: Function to upload configuration.
 * 
 * @imports
 *   - SetSchedule, Details, Configuration, Scanbuttons, RadarModal: UI components
 *   - addToast, isLivestreaming, simpleMode: Stores for connection, mode, and toast handling
 *   - handleToggle, openId: Stores for modal/open state management
 *   - transformModels: Utility function to transform model results for performance view
 *   - Config, FunctionType, Schedule, WritableModelArray, WritableNumber, WritableString: Type definitions
 * 
 * @localState
 *   - modelPerformance: Holds transformed performance data for models
 *   - showRadarModal: Toggles radar modal visibility
 *   - showScheduleModal: Toggles scheduling modal visibility
 *   - oldSchedule: Stores previously saved schedule config for reference
 *
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Components
import SetSchedule from '$components/SetSchedule.svelte';
import Details from '$routes/spray/details.svelte';
import Configuration from '$routes/spray/configuration.svelte';
import Scanbuttons from '$routes/spray/scanbuttons.svelte';
import RadarModal from '$modal/RadarModal.svelte';

// Stores
import { addToast } from '$stores/toast';
import { isLivestreaming } from '$stores/connection';
import { get } from 'svelte/store';

// Types
import type { Config } from '$class/config';
import type {
	FunctionType,
	PlantList,
	Schedule,
	WritableModelArray,
	WritableNumber,
	WritableString
} from '$lib/type';

// Utils
import { transformModels } from '$utils/transform';

// ----------------------------
// Props
// ----------------------------
export let controlRobot;
export let openSprayModal;
export let openCamera;
export let openManualPlant: FunctionType;

export let config: Config;

// Model version and confidence bindings
const objectDetection: WritableString = config.objectDetectionVersion;
const stageClassification: WritableString = config.stageClassificationVersion;
const diseaseSegmentation: WritableString = config.diseaseSegmentationVersion;
const objectDetectionConfidence: WritableNumber = config.objectDetectionConfidence;
const diseaseSegmentationConfidence: WritableNumber = config.diseaseSegmentationConfidence;
const stageClassificationConfidence: WritableNumber = config.stageClassificationConfidence;

export let yoloObjectDetection: WritableModelArray;
export let yoloStageClassification: WritableModelArray;
export let maskRCNNSegmentation: WritableModelArray;

export let saveConfig: FunctionType;
export let downloadConfig: FunctionType;
export let uploadConfig: FunctionType;

// ----------------------------
// Local state
// ----------------------------
let modelPerformance = {
	objectDetectionionYolo: transformModels($yoloObjectDetection),
	stageClassificationYolo: transformModels($yoloStageClassification),
	diseaseSegmentationMaskRCNN: transformModels($maskRCNNSegmentation)
};

let showRadarModal: boolean = false;
let showScheduleModal: boolean = false;
let oldSchedule: Schedule;
</script>



<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<div
	class="mx-auto flex flex-col items-center justify-between space-y-2 rounded-lg p-3 md:flex-row md:space-y-0 md:space-x-4 dark:bg-gray-900"
>
	<Details
		{config}
		showRadalActivate={() => (showRadarModal = true)}
		{objectDetection}
		{stageClassification}
		{diseaseSegmentation}
		{objectDetectionConfidence}
		{diseaseSegmentationConfidence}
		{stageClassificationConfidence}
		{yoloObjectDetection}
		{yoloStageClassification}
		{maskRCNNSegmentation}
	/>
	<Configuration
		{saveConfig}
		{downloadConfig}
		{uploadConfig}
		{openSprayModal}
		setSchedule={() => {
			if ($isLivestreaming !== 'Stopped') {
				addToast('Action unavailable while livestreaming is active.', 'error', 3000);
				return;
			}
			showScheduleModal = true;
			oldSchedule = { ...get(config.schedule) };
		}}
		openManualPlant={openManualPlant}
	/>
	<Scanbuttons
		openCamera={openCamera}
		startRobot={() => controlRobot(true)}
		stopRobot={() => controlRobot(false)}
	/>
</div>

<RadarModal
	config={config}
	showRadarModal={showRadarModal}
	closeRadarModal={() => showRadarModal = false}
	yoloObjectDetection={yoloObjectDetection}
	yoloStageClassification={yoloStageClassification}
	maskRCNNSegmentation={maskRCNNSegmentation}
	modelPerformance={modelPerformance}
/>

<SetSchedule
	schedule={config.schedule}
	{showScheduleModal}
	onClose={() => {
		config.schedule.set(oldSchedule);
		showScheduleModal = false;
	}}
	onSave={() => {
		showScheduleModal = false;
		addToast('Schedule saved successfully!', 'success', 3000);
		setTimeout(() => {
			addToast(
				'Changes staged. Remember to click "Save Configuration" to apply them.',
				'info',
				5000
			);
		}, 10);
	}}
/>
