import RequestHandler from '$lib/utils/request';

let cachedModels: any = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000;

export const load = async () => {
	const now = Date.now();
	const isCacheValid = now - lastFetchTime < CACHE_DURATION_MS;

	if (isCacheValid && cachedModels) {
		console.log('✅ Using cached model data.');
		return { models: cachedModels };
	}
	try {
		console.log('🌐 Fetching fresh model data...');
		const res = await RequestHandler.fetchData('get', 'get-model-studio');

		if (res.success && res.data) {
			cachedModels = {
				yoloobjectdetection: res.data.yoloObjectDetection,
				yolostageclassification: res.data.yoloStageClassification,
				maskrcnnsegmentation: res.data.maskRCNNSegmentation
			};
			lastFetchTime = now;
		}
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
