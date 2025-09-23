import type { DetectedPlant, PlantListTransformed, Schedule, WritableModelArray } from '$lib/type';
import { getTimestamp, addMinutes, isValid24HourTime, isValidTimestamp } from '$utils/time';
import { VALID_DAYS, VALID_FREQUENCIES } from "$constant/index";
import { get } from 'svelte/store';

function normalizeSchedule(input: any): Schedule {
    const rawFrequency =
        typeof input?.schedule?.frequency === 'string' ? input.schedule.frequency : '';
    const frequency = VALID_FREQUENCIES.includes(rawFrequency) ? rawFrequency : 'monthly';

    const days = Array.isArray(input?.schedule?.days)
        ? input.schedule.days.filter((d: any) => typeof d === 'string' && VALID_DAYS.includes(d))
        : [];

    let runs: { time: string; upto: string }[] = [];

    if (Array.isArray(input?.schedule?.runs) && input.schedule.runs.length > 0) {
        runs = input.schedule.runs
            .map((r: any) => {
                const rawTime = typeof r?.time === 'string' ? r.time : '';
                const rawUpto = typeof r?.upto === 'string' ? r.upto : '';
                const time = isValid24HourTime(rawTime) ? rawTime : '12:00';
                const upto = isValid24HourTime(rawUpto) ? rawUpto : addMinutes(time, 60);
                return { time, upto };
            })
            .filter(Boolean);
    }
    else if (typeof input?.schedule?.time === 'string' || typeof input?.schedule?.upto === 'string') {
        const rawTime = typeof input.schedule.time === 'string' ? input.schedule.time : '';
        const rawUpto = typeof input.schedule.upto === 'string' ? input.schedule.upto : '';
        const time = isValid24HourTime(rawTime) ? rawTime : '12:00';
        const upto = isValid24HourTime(rawUpto) ? rawUpto : addMinutes(time, 60);
        runs = [{ time, upto }];
    }
    else {
        const runsPerDay =
            typeof input?.schedule?.runsPerDay === 'number' && input.schedule.runsPerDay > 0
                ? Math.min(24, Math.floor(input.schedule.runsPerDay)) 
                : 1;

        const rawBaseTime = typeof input?.schedule?.defaultTime === 'string' ? input.schedule.defaultTime : '';
        const baseTime = isValid24HourTime(rawBaseTime) ? rawBaseTime : '12:00';

        runs = Array.from({ length: runsPerDay }, (_, i) => {
            const time = addMinutes(baseTime, i * 60); 
            const upto = addMinutes(time, 60);
            return { time, upto };
        });
    }

    return { frequency, runs, days };
}

export function validateAndNormalizeConfig(
    input: any,
    allPlants: PlantListTransformed,
    yoloObjectDetection: WritableModelArray,
    yoloStageClassification: WritableModelArray,
    maskRCNNSegmentation: WritableModelArray,
): any {
    if (typeof input !== 'object' || input === null) {
        throw new Error('Invalid configuration: not an object');
    }

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

    let durationArray = Array.isArray(input.sprays?.duration)
        ? input.sprays.duration.map((v: any) =>
            typeof v === "number" && v > 0 ? Math.floor(v) : 2
        )
        : [];
    if (durationArray.length < 4) {
        while (durationArray.length < 4) durationArray.push(2);
    } else if (durationArray.length > 4) {
        durationArray = durationArray.slice(0, 4);
    }

    const sprays = {
        spray: spraysArray,
        active: activeArray,
        duration: durationArray
    };

    const schedule: Schedule = normalizeSchedule(input);
    let objectDetection =
        typeof input.objectDetection === "string" ? input.objectDetection : "";

    let stageClassification =
        typeof input.stageClassification === "string" ? input.stageClassification : "";

    let diseaseSegmentation =
        typeof input.diseaseSegmentation === "string" ? input.diseaseSegmentation : "";
    
    objectDetection = objectDetection && objectDetection !== ""
        ? objectDetection
        : get(yoloObjectDetection)[0]?.version || "";

    stageClassification = stageClassification && stageClassification !== ""
        ? stageClassification
        : get(yoloStageClassification)[0]?.version || "";

    diseaseSegmentation = diseaseSegmentation && diseaseSegmentation !== ""
        ? diseaseSegmentation
        : get(maskRCNNSegmentation)[0]?.version || "";

    const normalizeConfidence = (val: any, def = 0.3) =>
        typeof val === 'number' && val >= 0 && val <= 1 ? val : def;

    const objectDetectionConfidence = normalizeConfidence(
        input.objectDetectionConfidence,
        0.3
    );
    const stageClassificationConfidence = normalizeConfidence(
        input.stageClassificationConfidence,
        0.3
    );
    const diseaseSegmentationConfidence = normalizeConfidence(
        input.diseaseSegmentationConfidence,
        0.3
    );

    const detectedPlants: DetectedPlant[] = Array.isArray(input.detectedPlants)
        ? input.detectedPlants
            .filter((plant: any) => {
                return plant && typeof plant.key === "string" && plant.key in allPlants;
            })
            .map((plant: any): DetectedPlant => {
                const disease =
                    typeof plant.disease === "object" && plant.disease !== null
                        ? Object.fromEntries(
                            Object.entries(plant.disease).map(([diseaseName, arr]) => [
                                diseaseName,
                                Array.isArray(arr)
                                    ? arr.map((v: any) => !!v)
                                    : [false, false, false, false],
                            ]),
                        )
                        : {};

                const disease_time_spray =
                    typeof plant.disease_time_spray === "object" && plant.disease_time_spray !== null
                        ? Object.fromEntries(
                            Object.entries(plant.disease_time_spray).map(([diseaseName, arr]) => {
                                const [rawStart, rawEnd] = Array.isArray(arr) ? arr : [];
                                const start =
                                    typeof rawStart === "string" && isValid24HourTime(rawStart)
                                        ? rawStart
                                        : "12:00";
                                const end =
                                    typeof rawEnd === "string" && isValid24HourTime(rawEnd)
                                        ? rawEnd
                                        : "14:00";
                                return [diseaseName, [start, end] as [string, string]];
                            }),
                        )
                        : {};

                return {
                    key: plant.key,
                    timestamp: isValidTimestamp(plant.timestamp)
                        ? plant.timestamp
                        : getTimestamp(),
                    image: plant.image,
                    disabled: !!plant.disabled,
                    willSprayEarly: !!plant.willSprayEarly,
                    disease,
                    disease_time_spray,
                };
            })
        : [];
    
        

    return {
        sprays,
        schedule,
        objectDetection,
        stageClassification,
        diseaseSegmentation,
        detectedPlants,
        objectDetectionConfidence,
        stageClassificationConfidence,
        diseaseSegmentationConfidence
    };
}