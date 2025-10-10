<script lang="ts">

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
export let controlScanner;
export let openSprayModal;
export let openCamera;
export let openManualPlant: FunctionType;

export let config: Config;
export let isConnected: boolean;
export let liveState: number;
export let scannerState: boolean;
export let robotState: number;
export let robotScanState: boolean;
export let performing: boolean;
export let robotLive: boolean;
export let stopCapture: boolean;

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

		liveState={liveState}
		robotState={robotState}
		robotScanState={robotScanState}
		performing={performing}
		robotLive={robotLive}
		stopCapture={stopCapture}

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
		liveState={liveState}
		robotState={robotState}
		robotScanState={robotScanState}
		performing={performing}
		robotLive={robotLive}
		stopCapture={stopCapture}
		{saveConfig}
		{downloadConfig}
		{uploadConfig}
		{openSprayModal}
		setSchedule={() => {
			if (liveState) {
				addToast('Action unavailable while livestreaming is active.', 'error', 3000);
				return;
			}
			showScheduleModal = true;
			oldSchedule = structuredClone(get(config.schedule));
		}}
		openManualPlant={openManualPlant}
	/>
	<Scanbuttons
		isConnected={isConnected}
        liveState={liveState}
        scannerState={scannerState}
        robotState={robotState}
        robotScanState={robotScanState}
		openCamera={openCamera}
		startRobot={() => controlScanner(true, isConnected, robotState, liveState, scannerState, robotScanState)}
		stopRobot={() => controlScanner(false, isConnected, robotState, liveState, scannerState, robotScanState)}
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
	onSave={(schedule: Schedule) => {
		config.schedule.set(schedule);
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
