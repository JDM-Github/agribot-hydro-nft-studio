import { allPlants } from '$lib/stores/plant';
const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALID_FREQUENCIES = [
	'weekly',
	'bi-weekly',
	'tri-weekly',
	'monthly',
	'bi-monthly',
	'tri-monthly',
	'semi-annual',
	'yearly'
];

export function getBaseApiUrl() {
	return import.meta.env.MODE === 'production'
		? ''
		: import.meta.env.VITE_DEVELOPMENT_LINK || 'http://127.0.0.1:8000';
}
export function capitalize(str: string) {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function getTimestamp() {
	const now = new Date();
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const dd = String(now.getDate()).padStart(2, '0');
	const hh = String(now.getHours()).padStart(2, '0');
	const min = String(now.getMinutes()).padStart(2, '0');
	const ss = String(now.getSeconds()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export function deepEqual(a: any, b: any): boolean {
	if (a === b) return true;

	if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		if (!keysB.includes(key)) return false;
		if (!deepEqual(a[key], b[key])) return false;
	}

	return true;
}

export function validateAndNormalizeConfig(input: any): any {
	if (typeof input !== 'object' || input === null) {
		throw new Error('Invalid configuration: not an object');
	}

	// Ensure sprays have exactly 4 entries
	let spraysArray = Array.isArray(input.sprays?.spray)
		? input.sprays.spray.map((s: any) => (typeof s === 'string' ? s : ''))
		: [];
	if (spraysArray.length < 4) {
		while (spraysArray.length < 4) spraysArray.push('');
	} else if (spraysArray.length > 4) {
		spraysArray = spraysArray.slice(0, 4);
	}

	let activeArray = Array.isArray(input.sprays?.active)
		? input.sprays.active.map((v: any) => !!v)
		: [];
	if (activeArray.length < 4) {
		while (activeArray.length < 4) activeArray.push(true);
	} else if (activeArray.length > 4) {
		activeArray = activeArray.slice(0, 4);
	}

	const sprays = {
		spray: spraysArray,
		active: activeArray
	};

	// Validate schedule fields
	const rawFrequency =
		typeof input.schedule?.frequency === 'string' ? input.schedule.frequency : '';
	const frequency = VALID_FREQUENCIES.includes(rawFrequency) ? rawFrequency : 'monthly';

	const rawTime = typeof input.schedule?.time === 'string' ? input.schedule.time : '';
	const time = isValid24HourTime(rawTime) ? rawTime : '12:00';

	const runsPerDay =
		typeof input.schedule?.runsPerDay === 'number' && input.schedule.runsPerDay > 0
			? input.schedule.runsPerDay
			: 1;

	const days = Array.isArray(input.schedule?.days)
		? input.schedule.days.filter((d: any) => typeof d === 'string' && VALID_DAYS.includes(d))
		: [];

	const schedule = {
		frequency,
		time,
		runsPerDay,
		days
	};

	const objId =
		typeof input.objId === 'number' && Number.isInteger(input.objId) && input.objId >= 0
			? input.objId
			: 0;

	const stageId =
		typeof input.stageId === 'number' && Number.isInteger(input.stageId) && input.stageId >= 0
			? input.stageId
			: 0;

	const segmentationId =
		typeof input.segmentationId === 'number' &&
		Number.isInteger(input.segmentationId) &&
		input.segmentationId >= 0
			? input.segmentationId
			: 0;

	// Validate detectedPlants
	const detectedPlants = Array.isArray(input.detectedPlants)
		? input.detectedPlants
				.filter((plant: any) => {
					return plant && typeof plant.key === 'string' && plant.key in allPlants;
				})
				.map((plant: any) => {
					return {
						key: plant.key,
						timestamp: isValidTimestamp(plant.timestamp) ? plant.timestamp : getTimestamp(),
						disabled: !!plant.disabled,
						disease:
							typeof plant.disease === 'object' && plant.disease !== null
								? Object.fromEntries(
										Object.entries(plant.disease).map(([diseaseName, arr]) => [
											diseaseName,
											Array.isArray(arr) ? arr.map((v: any) => !!v) : [false, false, false, false]
										])
									)
								: {}
					};
				})
		: [];

	return {
		sprays,
		schedule,
		objId,
		stageId,
		segmentationId,
		detectedPlants
	};
}

function isValidTimestamp(ts: any): boolean {
	if (typeof ts !== 'string') return false;
	return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(ts);
}

function isValid24HourTime(time: string): boolean {
	// Matches HH:mm where HH = 00-23 and mm = 00-59
	return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

// TO DO
// USED WHEN I ADD THE DISABLE THINGY IN MY DATABASE
function resolveModelId(modelList: any[], targetId: number): any {
	// latest first
	const sorted = modelList.filter((m) => m && Number.isInteger(m.id)).sort((a, b) => b.id - a.id);

	// Try exact match first
	let model = sorted.find((m) => m.id === targetId && !m.disabled);

	if (model) return model;

	// If not found, iterate backward
	for (let id = targetId - 1; id >= 0; id--) {
		model = sorted.find((m) => m.id === id && !m.disabled);
		if (model) return model;
	}
	return null;
}