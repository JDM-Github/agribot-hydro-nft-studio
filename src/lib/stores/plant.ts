import type { ConfigType, DetectedPlant } from "$lib/type";

// export type Plant = {
// 	name: string;
// 	type: string;
// 	image: string;
// 	description: string;
// 	diseases: {
// 		name: string;
// 		description: string;
// 		image: string;
// 		sprays: string[];
// 		severity: string;
// 	}[];
// };
// export type Disease = {
// 	name: string;
// 	description: string;
// 	image: string;
// 	sprays: string[];
// }

export const recommendedSprays = [
    {
        name: 'Water',
        info: 'Essential for plant growth and hydration.',
        plants: [
            { name: 'Green Lettuce', disease: 'None' },
            { name: 'Lactuca Sativa', disease: 'None' },
            { name: 'Romaine Lettuce', disease: 'None' }
        ]
    },
    {
        name: 'Fungicide',
        info: 'Prevents and treats fungal infections on lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Powdery Mildew' },
            { name: 'Lactuca Sativa', disease: 'Powdery Mildew' },
            { name: 'Romaine Lettuce', disease: 'Powdery Mildew' },
            { name: 'Green Lettuce', disease: 'Alternaria' },
            { name: 'Lactuca Sativa', disease: 'Alternaria' },
            { name: 'Romaine Lettuce', disease: 'Alternaria' },
            { name: 'Green Lettuce', disease: 'Anthracnose' },
            { name: 'Lactuca Sativa', disease: 'Anthracnose' },
            { name: 'Romaine Lettuce', disease: 'Anthracnose' },
            { name: 'Green Lettuce', disease: 'Leaf Spot' },
            { name: 'Lactuca Sativa', disease: 'Leaf Spot' },
            { name: 'Romaine Lettuce', disease: 'Leaf Spot' },
            { name: 'Green Lettuce', disease: 'Dark Spot' },
            { name: 'Lactuca Sativa', disease: 'Dark Spot' },
            { name: 'Romaine Lettuce', disease: 'Dark Spot' }
        ]
    },
    {
        name: 'Neem Oil',
        info: 'Natural pesticide that protects against pests and fungi.',
        plants: [
            { name: 'Green Lettuce', disease: 'Insect-Damage' },
            { name: 'Lactuca Sativa', disease: 'Insect-Damage' },
            { name: 'Romaine Lettuce', disease: 'Insect-Damage' },
            { name: 'Green Lettuce', disease: 'Leaf Miner' },
            { name: 'Lactuca Sativa', disease: 'Leaf Miner' },
            { name: 'Romaine Lettuce', disease: 'Leaf Miner' }
        ]
    },
    {
        name: 'Calcium Booster',
        info: 'Enhances calcium levels to prevent tip burn in lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Tip Burn' },
            { name: 'Lactuca Sativa', disease: 'Tip Burn' },
            { name: 'Romaine Lettuce', disease: 'Tip Burn' }
        ]
    }
];

