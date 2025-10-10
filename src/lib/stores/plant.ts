const DISEASE_SPRAYS = {
    "anthracnose": "Score 250 EC",
    "dark spot": "Antracol 70 WP",
    "destroyed": "Seasol Plant Tonic",
    "insect-damage": "Decis 2.5 EC",
    "tip burn": "CalciGrow Foliar",
    "powdery mildew": "Topaz 100 EC",
    "alternaria": "Dithane M-45"
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
        name: DISEASE_SPRAYS["powdery mildew"],
        info: 'Prevents and treats powdery mildew on lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Powdery Mildew' },
            { name: 'Lactuca Sativa', disease: 'Powdery Mildew' },
            { name: 'Romaine Lettuce', disease: 'Powdery Mildew' }
        ]
    },
    {
        name: DISEASE_SPRAYS["alternaria"],
        info: 'Prevents and treats Alternaria infections on lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Alternaria' },
            { name: 'Lactuca Sativa', disease: 'Alternaria' },
            { name: 'Romaine Lettuce', disease: 'Alternaria' }
        ]
    },
    {
        name: DISEASE_SPRAYS["anthracnose"],
        info: 'Prevents and treats anthracnose on lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Anthracnose' },
            { name: 'Lactuca Sativa', disease: 'Anthracnose' },
            { name: 'Romaine Lettuce', disease: 'Anthracnose' }
        ]
    },
    {
        name: DISEASE_SPRAYS["dark spot"],
        info: 'Prevents and treats dark spot disease on lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Dark Spot' },
            { name: 'Lactuca Sativa', disease: 'Dark Spot' },
            { name: 'Romaine Lettuce', disease: 'Dark Spot' }
        ]
    },
    {
        name: DISEASE_SPRAYS["insect-damage"],
        info: 'Protects against insect damage on lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Insect-Damage' },
            { name: 'Lactuca Sativa', disease: 'Insect-Damage' },
            { name: 'Romaine Lettuce', disease: 'Insect-Damage' }
        ]
    },
    {
        name: DISEASE_SPRAYS["tip burn"],
        info: 'Enhances calcium levels to prevent tip burn in lettuce.',
        plants: [
            { name: 'Green Lettuce', disease: 'Tip Burn' },
            { name: 'Lactuca Sativa', disease: 'Tip Burn' },
            { name: 'Romaine Lettuce', disease: 'Tip Burn' }
        ]
    }
];
