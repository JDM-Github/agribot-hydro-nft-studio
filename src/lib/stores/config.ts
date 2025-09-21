import type { ConfigType } from "$lib/type";

export const config: ConfigType = {
    detectedPlants: [],
    sprays: {
        spray: ['', '', '', ''],
        active: [true, true, true, true],
        duration: [2, 2, 2, 2]
    },
    schedule: {
        frequency: 'monthly',
        runs: [
            { time: '06:00', upto: '07:00' },
            { time: '12:00', upto: '13:00' },
            { time: '18:00', upto: '19:00' }
        ],
        days: []
    },
    objectDetection: '',
    stageClassification: '',
    diseaseSegmentation: '',
    objectDetectionConfidence: 0.3,
    stageClassificationConfidence: 0.3,
    diseaseSegmentationConfidence: 0.3,
};