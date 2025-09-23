// GeneratePlantImage.ts
import puppeteer from 'puppeteer';
import type { ConfigType } from '../type';


export class PlantImageGenerator {

    public static async generate(jsonData: ConfigType): Promise<Buffer> {
        const html = `
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-800 text-gray-100 font-sans">

    <!-- Header -->
    <div class="bg-gray-900 py-4 px-6 mb-2 flex items-center justify-between rounded-b-lg shadow-md">
        <div class="flex items-center space-x-3">
            <img src="https://res.cloudinary.com/dy6z8wadm/image/upload/v1758607551/LOGO_abjkb1.ico" alt="AGRIBOT Logo" class="h-12 w-12">
            <span class="text-3xl font-bold">AGRIBOT</span>
        </div>
        <div class="text-right text-gray-200 text-sm">
            <div>Generated: ${new Date().toLocaleDateString()}</div>
            <div>Plants Detected: ${jsonData.detectedPlants.length}</div>
        </div>
    </div>

    <div class="border border-gray-600 p-2 rounded-lg">

        <div class="grid grid-cols-3 gap-4 mb-4">
            <!-- Object Detection -->
            <div class="relative bg-gray-900 rounded-lg p-4 shadow-inner border-l-4 border-purple-500 flex justify-between items-center overflow-hidden">
                <span class="text-sm font-semibold text-gray-100 z-10">Object Detection</span>
                <span class="text-sm font-bold text-gray-200 z-10">${jsonData.objectDetection} (${jsonData.objectDetectionConfidence})</span>
                <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
            </div>

            <!-- Stage Classification -->
            <div class="relative bg-gray-900 rounded-lg p-4 shadow-inner border-l-4 border-yellow-500 flex justify-between items-center overflow-hidden">
                <span class="text-sm font-semibold text-gray-100 z-10">Stage Classification</span>
                <span class="text-sm font-bold text-gray-200 z-10">${jsonData.stageClassification} (${jsonData.stageClassificationConfidence})</span>
                <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
            </div>

            <!-- Disease Segmentation -->
            <div class="relative bg-gray-900 rounded-lg p-4 shadow-inner border-l-4 border-red-500 flex justify-between items-center overflow-hidden">
                <span class="text-sm font-semibold text-gray-100 z-10">Disease Segmentation</span>
                <span class="text-sm font-bold text-gray-200 z-10">${jsonData.diseaseSegmentation} (${jsonData.diseaseSegmentationConfidence})</span>
                <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
            </div>
        </div>

        <div class="bg-gray-900 rounded-lg p-2 mb-2 shadow-inner">
            <div class="grid grid-cols-4 gap-2">
                ${jsonData.sprays.spray.map((s, i) => `
                    <div class="flex items-center space-x-2 text-sm border ${jsonData.sprays.active[i] ? 'border-blue-300' : 'border-gray-700'} rounded px-2 py-1">
                        <span>${s}</span>
                        <span class="text-gray-300">(${jsonData.sprays.duration[i]} mins)</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="bg-gray-900 rounded-lg p-4 mb-4 shadow-inner">
            <div class="flex flex-wrap gap-6 text-sm mb-3">
                <div><strong class="text-purple-300">Frequency:</strong> ${jsonData.schedule.frequency}</div>
                <div><strong class="text-purple-300">Days:</strong> ${jsonData.schedule.days.join(', ')}</div>
            </div>

            <div class="grid grid-cols-3 gap-2 text-sm">
                ${jsonData.schedule.runs.map(run => `
                    <div class="bg-gray-800 rounded px-2 py-1">
                        ⏰ ${run.time} - ${run.upto}
                    </div>
                `).join('')}
            </div>
        </div>

        ${jsonData.detectedPlants.map(p => `
            <div class="bg-gray-900 rounded-lg p-4 mb-4 shadow-inner ${p.disabled ? 'opacity-60' : ''}">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <img src="${p.image}" alt="Plant Logo" class="h-10 w-10 rounded-full border border-gray-700">
                        <h2 class="text-green-400 text-xl font-bold">${p.key}</h2>
                    </div>
                    <p class="text-sm text-gray-200">
                        <strong>Timestamp:</strong> ${p.timestamp} | 
                        ${p.willSprayEarly ? '<strong>Spray Early:</strong> ✅' : ''}
                        ${p.disabled ? '<span class="ml-2 text-red-400 font-semibold">🚫 Disabled</span>' : ''}
                    </p>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    ${Object.entries(p.disease)
                        .filter(([_, values]) => values.some(v => v))
                        .map(([disease]) => {
                            const times = p.disease_time_spray[disease].join(', ');
                            return `<div class="bg-gray-800 text-sm rounded px-2 py-1 truncate">${disease} (${times})</div>`;
                        }).join('')}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="text-center text-gray-400 text-xs mt-6 py-4 bg-gray-900 rounded-t-lg shadow-md">
        © 2025 AGRIBOT. All Rights Reserved.
    </div>

</body>
</html>
`;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const bodyHandle = await page.$('body');
        if (!bodyHandle) {
            await browser.close();
            throw new Error('Could not find <body> element on the page.');
        }

        const screenshotBuffer = await bodyHandle.screenshot({ omitBackground: false }) as Buffer;
        await browser.close();
        return screenshotBuffer;
    }
}
