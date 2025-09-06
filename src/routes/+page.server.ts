import RequestHandler from '$lib/utils/request';

let cachedModels: any = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000;

export const load = async ({fetch}) => {
	const now = Date.now();
	const isCacheValid = now - lastFetchTime < CACHE_DURATION_MS;

	if (isCacheValid && cachedModels) {
		console.log('✅ Using cached model data.');
		return { models: cachedModels };
	}
	try {
		console.log('🌐 Fetching fresh model data...');
		const results = await fetch('https://agribot-pi4.tail13df43.ts.net:8000/get_models');
		if (results.ok) {
			const data = await results.json();
			cachedModels = {
				yoloobjectdetection: data.yoloObjectDetection,
				yolostageclassification: data.yoloStageClassification,
				maskrcnnsegmentation: data.maskRCNNSegmentation
			};
			lastFetchTime = now;
		}
		console.log('✅ Model data fetched successfully.', cachedModels);
		return { models: cachedModels };
	} catch (error) {
		console.error('❌ Failed to fetch models:', error);
		return {
			models: cachedModels ?? {
				yoloobjectdetection: [],
				yolostageclassification: [],
				maskrcnnsegmentation: []
			}
		};
	}
};
