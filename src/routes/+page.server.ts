import type { Load } from '@sveltejs/kit';
import { REDIS_URL } from '$env/static/private';
import Redis from 'ioredis';
import RequestHandler from '$root/lib/utils/request';

const CACHE_DURATION_MS = 60 * 60 * 1000;
// const redis = new Redis(REDIS_URL);

export const load: Load = async () => {
	const now = Date.now();

	// ---- MODELS ----
	const modelCacheKey = 'models_cache';
	let models = { yoloobjectdetection: [], yolostageclassification: [], maskrcnnsegmentation: [] };
	// try {
	// 	// const cached = await redis.get(modelCacheKey);
	// 	// if (cached) {
	// 	// 	const parsed = JSON.parse(cached);
	// 	// 	if (now - parsed.timestamp < CACHE_DURATION_MS) {
	// 	// 		console.log('✅ Using cached model data from Redis.');
	// 	// 		models = parsed.models;
	// 	// 	}
	// 	// }
	// 	if (!models) {
	// 		console.log('🌐 Fetching fresh model data...');
	// 		const response = await RequestHandler.fetchData("GET", "get-model-studio");
	// 		if (response.success) {
	// 			models = {
	// 				yoloobjectdetection: response.data.yoloObjectDetection,
	// 				yolostageclassification: response.data.yoloStageClassification,
	// 				maskrcnnsegmentation: response.data.maskRCNNSegmentation
	// 			};
	// 			// await redis.set(modelCacheKey, JSON.stringify({ timestamp: Date.now(), models }));
	// 			console.log('✅ Stored fresh model data in Redis.');
	// 		} else {
	// 			models = { yoloobjectdetection: [], yolostageclassification: [], maskrcnnsegmentation: [] };
	// 		}
	// 	}
	// } catch (err) {
	// 	console.error("❌ Failed to fetch models:", err);
	// 	models = { yoloobjectdetection: [], yolostageclassification: [], maskrcnnsegmentation: [] };
	// }

	// // ---- PLANTS ----
	// const plantCacheKey = 'plants_cache';
	let plants: any[] = [];
	// try {
	// 	// const cached = await redis.get(plantCacheKey);
	// 	// if (cached) {
	// 	// 	const parsed = JSON.parse(cached);
	// 	// 	if (now - parsed.timestamp < CACHE_DURATION_MS) {
	// 	// 		console.log('✅ Using cached plant data from Redis.');
	// 	// 		plants = parsed.plants;
	// 	// 	}
	// 	// }
	// 	if (!plants) {
	// 		console.log('🌱 Fetching fresh plant data...');
	// 		const response = await RequestHandler.fetchData("GET", "plant/get-plant-display");
	// 		if (response.success) {
	// 			plants = response.plantData;
	// 			// await redis.set(plantCacheKey, JSON.stringify({ timestamp: Date.now(), plants }));
	// 			console.log('✅ Stored fresh plant data in Redis.');
	// 		} else {
	// 			plants = [];
	// 		}
	// 	}
	// } catch (err) {
	// 	console.error("❌ Failed to fetch plants:", err);
	// 	plants = [];
	// }

	// console.log("MODELS", models);
	// console.log("PLANTS", plants);

	return { models, plants };
};
