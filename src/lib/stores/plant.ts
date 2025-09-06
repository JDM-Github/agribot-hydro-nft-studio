export type Plant = {
	name: string;
	type: string;
	image: string;
	description: string;
	diseases: {
		name: string;
		description: string;
		image: string;
		sprays: string[];
		severity: string;
	}[];
};
export type Disease = {
	name: string;
	description: string;
	image: string;
	sprays: string[];
	severity: string;
}

export const allPlants: Record<string, Plant> = {
	'green oak lettuce': {
		name: 'Green Lettuce',
		type: 'Leafy Vegetable',
		image: 'https://s30386.pcdn.co/wp-content/uploads/2019/08/459120973.jpg.optimal.jpg',
		description:
			'Green lettuce is a leafy vegetable from the species *Lactuca sativa*, known for its tender texture and mild flavor. Commonly used in salads and sandwiches, it’s a staple in many diets and grows best in cool climates.',
		diseases: []
	},
	'lactuca sativa': {
		name: 'Lactuca Sativa',
		type: 'Leafy Vegetable',
		image: 'https://www.gardensonline.com.au/Uploads/Plant/939/Lactuca-Sativa-1a.jpg',
		description:
			'Lactuca sativa is the botanical name for cultivated lettuce, a fast-growing annual plant in the daisy family. It is prized for its crisp leaves and is used widely in fresh salads, wraps, and various cuisines around the world.',
		diseases: []
	},
	'romaine lettuce': {
		name: 'Romaine Lettuce',
		type: 'Leafy Vegetable',
		image:
			'https://www.thespruce.com/thmb/4ssh6fc20ITIgPfV3zLYyhjDWzs=/4860x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-950511418-7fc9fe884718400999e0698148595b3b.jpg',
		description:
			'Romaine lettuce is a tall, sturdy variety of *Lactuca sativa* with elongated, crisp leaves and a firm rib down the center. It is a key ingredient in Caesar salads and is known for its high nutritional value, including vitamin K and folate.',
		diseases: []
	}
};

export const allDiseases: Record<string, Disease> = {
	alternaria: {
		name: 'Alternaria',
		description: 'A fungal disease that creates circular brown spots with concentric rings, often causing leaf blight.',
		image: '',
		sprays: ['Copper Fungicide', 'Chlorothalonil'],
		severity: 'High'
	},
	anthracnose: {
		name: 'Anthracnose',
		description: 'A fungal infection causing dark, sunken lesions on leaves and stems, leading to tissue decay.',
		image: '',
		sprays: ['Mancozeb', 'Chlorothalonil'],
		severity: 'High'
	},
	'dark spot': {
		name: 'Dark Spot',
		description: 'Characterized by irregular dark patches on lettuce leaves, usually from fungal or bacterial infection.',
		image: '',
		sprays: ['Copper Fungicide'],
		severity: 'Moderate'
	},
	'insect-damage': {
		name: 'Insect Damage',
		description: 'Physical chewing or tearing of leaves caused by pests like caterpillars or beetles.',
		image: '',
		sprays: ['Neem Oil', 'Insecticidal Soap'],
		severity: 'Variable'
	},
	'leaf miner': {
		name: 'Leaf Miner',
		description: 'Pests that tunnel through leaves, leaving squiggly trails and weakening plant tissue.',
		image: '',
		sprays: ['Neem Oil', 'Spinosad'],
		severity: 'Moderate'
	},
	'leaf spot': {
		name: 'Leaf Spot',
		description: 'Circular brown or black spots on leaves, sometimes merging to kill large areas of tissue.',
		image: '',
		sprays: ['Copper Fungicide'],
		severity: 'Moderate'
	},
	'powedery mildew': {
		name: 'Powdery Mildew',
		description: 'White, powdery fungal growth on leaf surfaces, reducing photosynthesis and yield.',
		image: '',
		sprays: ['Sulfur-based Fungicides', 'Neem Oil'],
		severity: 'Moderate'
	},
	'sun deficient': {
		name: 'Sun Deficient',
		description: 'Physiological disorder where leaves turn pale or yellow due to lack of sunlight.',
		image: '',
		sprays: ['Adjust plant positioning for better light'],
		severity: 'Low'
	},
	'tip burn': {
		name: 'Tip Burn',
		description: 'A physiological condition where leaf tips turn brown and necrotic, often caused by calcium deficiency.',
		image: '',
		sprays: ['Calcium Nitrate Spray'],
		severity: 'Moderate'
	}
};

export const config = {
	detectedPlants: [],
	sprays: {
		spray: ['', '', '', ''],
		active: [true, true, true, true]
	},
	schedule: {
		frequency: 'monthly',
		time: '12:00',
		days: ['', '', '']
	},
	objectDetection: '',
	stageClassification: '',
	diseaseSegmentation: ''
};

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

