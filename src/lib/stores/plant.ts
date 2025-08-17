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

export const allPlants: Record<string, Plant> = {
	'tomato yield': {
		name: 'Tomato',
		type: 'Fruit',
		image:
			'https://cdn.britannica.com/16/187216-131-FB186228/tomatoes-tomato-plant-Fruit-vegetable.jpg',
		description:
			'Tomato (Solanum lycopersicum) is a flowering plant in the nightshade family. Its edible fruit is technically a berry but commonly used as a vegetable in cooking. Tomatoes are rich in vitamins A and C and are grown worldwide for culinary use.',
		diseases: [
			{
				name: 'Blight',
				description:
					'Caused by *Alternaria solani*, it leads to concentric rings on older leaves, reducing yield.',
				image: 'https://www.planetnatural.com/wp-content/uploads/2012/12/early-blight-tomato.jpg',
				sprays: ['Copper Fungicide', 'Mancozeb'],
				severity: 'Moderate'
			},
			{
				name: 'Bacterial Spot',
				description:
					'A soilborne bacterial disease that causes sudden wilting of the entire plant.',
				image: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Bacterial_wilt_tomato.jpg',
				sprays: ['Soil solarization'],
				severity: 'High'
			}
		]
	},
	'green lettuce': {
		name: 'Green Lettuce',
		type: 'Leafy Vegetable',
		image: 'https://s30386.pcdn.co/wp-content/uploads/2019/08/459120973.jpg.optimal.jpg',
		description:
			'Green lettuce is a leafy vegetable from the species *Lactuca sativa*, known for its tender texture and mild flavor. Commonly used in salads and sandwiches, it’s a staple in many diets and grows best in cool climates.',
		diseases: [
			{
				name: 'Downy Mildew',
				description:
					'Causes yellow patches on leaves and white mold on undersides. Common in humid conditions, especially in hydroponic NFT systems where high moisture and poor air circulation can encourage fungal growth.',
				image:
					'https://apps.lucidcentral.org/pppw_v10/images/entities/lettuce_downy_mildew_209/bremla3.jpg',
				sprays: ['Copper Fungicide', 'Fosetyl-Al'],
				severity: 'High'
			},
			{
				name: 'Powdery Mildew',
				description:
					'A fungal disease that causes a white, powdery substance to appear on the leaves and stems, leading to stunted growth and reduced yield. It thrives in conditions with high humidity and poor airflow, often seen in hydroponic systems.',
				image:
					'https://plantwiseplusknowledgebank.org/cms/10.1079/pwkb.species.9937/asset/d6fa09a4-8cf1-4862-bc39-dc01f1416af2/assets/graphic/9937_02.jpg',
				sprays: ['Sulfur-based Fungicides', 'Neem Oil', 'Potassium Bicarbonate'],
				severity: 'Moderate'
			},
			{
				name: 'Bacterial Spot',
				description:
					'Caused by bacteria, this disease results in water-soaked lesions and a slimy, mushy texture on the leaves. It can quickly spread in the humid, high-moisture environment of NFT systems.',
				image: 'https://www.plantdiseases.org/sites/default/files/plant_disease/images/0506.jpg',
				sprays: ['Copper Fungicide', 'Streptomycin'],
				severity: 'High'
			}
		]
	},
	'lactuca sativa': {
		name: 'Lactuca Sativa',
		type: 'Leafy Vegetable',
		image: 'https://www.gardensonline.com.au/Uploads/Plant/939/Lactuca-Sativa-1a.jpg',
		description:
			'Lactuca sativa is the botanical name for cultivated lettuce, a fast-growing annual plant in the daisy family. It is prized for its crisp leaves and is used widely in fresh salads, wraps, and various cuisines around the world.',
		diseases: [
			{
				name: 'Downy Mildew',
				description:
					'Causes yellow patches on leaves and white mold on undersides. Common in humid conditions, especially in hydroponic NFT systems where high moisture and poor air circulation can encourage fungal growth.',
				image:
					'https://apps.lucidcentral.org/pppw_v10/images/entities/lettuce_downy_mildew_209/bremla3.jpg',
				sprays: ['Copper Fungicide', 'Fosetyl-Al'],
				severity: 'High'
			},
			{
				name: 'Powdery Mildew',
				description:
					'A fungal disease that causes a white, powdery substance to appear on the leaves and stems, leading to stunted growth and reduced yield. It thrives in conditions with high humidity and poor airflow, often seen in hydroponic systems.',
				image:
					'https://plantwiseplusknowledgebank.org/cms/10.1079/pwkb.species.9937/asset/d6fa09a4-8cf1-4862-bc39-dc01f1416af2/assets/graphic/9937_02.jpg',
				sprays: ['Sulfur-based Fungicides', 'Neem Oil', 'Potassium Bicarbonate'],
				severity: 'Moderate'
			},
			{
				name: 'Bacterial Spot',
				description:
					'Caused by bacteria, this disease results in water-soaked lesions and a slimy, mushy texture on the leaves. It can quickly spread in the humid, high-moisture environment of NFT systems.',
				image: 'https://www.plantdiseases.org/sites/default/files/plant_disease/images/0506.jpg',
				sprays: ['Copper Fungicide', 'Streptomycin'],
				severity: 'High'
			}
		]
	},
	'romaine lettuce': {
		name: 'Romaine Lettuce',
		type: 'Leafy Vegetable',
		image:
			'https://www.thespruce.com/thmb/4ssh6fc20ITIgPfV3zLYyhjDWzs=/4860x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-950511418-7fc9fe884718400999e0698148595b3b.jpg',
		description:
			'Romaine lettuce is a tall, sturdy variety of *Lactuca sativa* with elongated, crisp leaves and a firm rib down the center. It is a key ingredient in Caesar salads and is known for its high nutritional value, including vitamin K and folate.',
		diseases: [
			{
				name: 'Downy Mildew',
				description:
					'Causes yellow patches on leaves and white mold on undersides. Common in humid conditions, especially in hydroponic NFT systems where high moisture and poor air circulation can encourage fungal growth.',
				image:
					'https://apps.lucidcentral.org/pppw_v10/images/entities/lettuce_downy_mildew_209/bremla3.jpg',
				sprays: ['Copper Fungicide', 'Fosetyl-Al'],
				severity: 'High'
			},
			{
				name: 'Powdery Mildew',
				description:
					'A fungal disease that causes a white, powdery substance to appear on the leaves and stems, leading to stunted growth and reduced yield. It thrives in conditions with high humidity and poor airflow, often seen in hydroponic systems.',
				image:
					'https://plantwiseplusknowledgebank.org/cms/10.1079/pwkb.species.9937/asset/d6fa09a4-8cf1-4862-bc39-dc01f1416af2/assets/graphic/9937_02.jpg',
				sprays: ['Sulfur-based Fungicides', 'Neem Oil', 'Potassium Bicarbonate'],
				severity: 'Moderate'
			},
			{
				name: 'Bacterial Spot',
				description:
					'Caused by bacteria, this disease results in water-soaked lesions and a slimy, mushy texture on the leaves. It can quickly spread in the humid, high-moisture environment of NFT systems.',
				image: 'https://www.plantdiseases.org/sites/default/files/plant_disease/images/0506.jpg',
				sprays: ['Copper Fungicide', 'Streptomycin'],
				severity: 'High'
			}
		]
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
			{ name: 'Green Lettuce', disease: 'Downy Mildew' },
			{ name: 'Lactuca Sativa', disease: 'Downy Mildew' },
			{ name: 'Romaine Lettuce', disease: 'Downy Mildew' }
		]
	},
	{
		name: 'Neem Oil',
		info: 'Natural pesticide that protects against pests and fungi.',
		plants: [
			{ name: 'Green Lettuce', disease: 'Aphids' },
			{ name: 'Lactuca Sativa', disease: 'Aphids' },
			{ name: 'Romaine Lettuce', disease: 'Aphids' }
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
	},
	{
		name: 'Anti-Fungal Spray',
		info: 'Protects lettuce from fungal infections.',
		plants: [
			{ name: 'Green Lettuce', disease: 'Leaf Spot' },
			{ name: 'Lactuca Sativa', disease: 'Leaf Spot' },
			{ name: 'Romaine Lettuce', disease: 'Leaf Spot' }
		]
	},
	{
		name: 'Insecticidal Soap',
		info: 'Controls aphids, whiteflies, and other small insects.',
		plants: [
			{ name: 'Green Lettuce', disease: 'Aphids' },
			{ name: 'Lactuca Sativa', disease: 'Whiteflies' },
			{ name: 'Romaine Lettuce', disease: 'Aphids' }
		]
	},
	{
		name: 'Seaweed Extract',
		info: 'Promotes root growth and stress resistance in lettuce.',
		plants: [
			{ name: 'Green Lettuce', disease: 'Nutrient Deficiency' },
			{ name: 'Lactuca Sativa', disease: 'Stress Resistance' },
			{ name: 'Romaine Lettuce', disease: 'Nutrient Deficiency' }
		]
	},
	{
		name: 'Copper Spray',
		info: 'Fungicide and bactericide effective for lettuce diseases.',
		plants: [
			{ name: 'Green Lettuce', disease: 'Bacterial Leaf Spot' },
			{ name: 'Lactuca Sativa', disease: 'Bacterial Leaf Spot' },
			{ name: 'Romaine Lettuce', disease: 'Bacterial Leaf Spot' }
		]
	}
];

