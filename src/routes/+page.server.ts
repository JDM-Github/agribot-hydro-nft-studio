/**
 * @file +page.server.ts
 * @description Loads ML models from the remote server with Redis caching.
 *              If cached data exists and is valid, it returns that instead of fetching again.
 *              Cache duration is 30 minutes by default.
 * 
 * @author      AGRIBOT Team
 * @created     2025-04-21
 * @lastUpdated 2025-09-21
 */

import type { Load } from '@sveltejs/kit';
import { REDIS_URL } from '$env/static/private';
import Redis from 'ioredis';

const CACHE_DURATION_MS = 30 * 60 * 1000;
const redis = new Redis(REDIS_URL);

/**
 * Load models with caching.
 * Checks Redis first, if not present or expired, fetches from remote server and stores in Redis.
 *
 * @param fetch - SvelteKit fetch function
 * @returns {Promise<{models: Record<string, any[]>}>} - The ML models
 */
export const load: Load = async ({ fetch }) => {
	const cacheKey = 'models_cache';
	const now = Date.now();

	try {
		// Try to get cached models from Redis
		const cached = await redis.get(cacheKey);
		if (cached) {
			const parsed = JSON.parse(cached);
			// Check if cache is still valid
			if (now - parsed.timestamp < CACHE_DURATION_MS) {
				console.log('✅ Using cached model data from Redis.');
				return { models: parsed.models };
			}
		}

		console.log('🌐 Fetching fresh model data...');
		const response = await fetch('https://agribot-pi4.tail13df43.ts.net:8000/get_models');
		let models;
		if (response.ok) {
			const data = await response.json();
			models = {
				yoloobjectdetection: data.yoloObjectDetection,
				yolostageclassification: data.yoloStageClassification,
				maskrcnnsegmentation: data.maskRCNNSegmentation
			};

			// Store fetched models in Redis with timestamp
			await redis.set(cacheKey, JSON.stringify({ models, timestamp: now }));
		} else {
			models = {
				yoloobjectdetection: [],
				yolostageclassification: [],
				maskrcnnsegmentation: []
			};
		}

		console.log('✅ Model data fetched successfully.', models);
		return { models };
	} catch (error) {
		console.error('❌ Failed to fetch models:', error);

		// Fallback: return cached models if available
		// const fallback = await redis.get('models_cache');
		// if (fallback) {
		// 	const parsed = JSON.parse(fallback);
		// 	return { models: parsed.models };
		// }

		return {
			models: {
				yoloobjectdetection: [],
				yolostageclassification: [],
				maskrcnnsegmentation: []
			}
		};
	}
};
