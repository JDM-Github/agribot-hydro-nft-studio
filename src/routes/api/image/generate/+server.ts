import type { RequestHandler } from './$types';
import { ImageWithJSON } from '$class/imageJson';
import { PlantImageGenerator } from '$class/generate';

export const POST: RequestHandler = async ({ request, locals }) => {
    const config = await request.json();
    const imageGenerator = new ImageWithJSON();
    const screenshotBuffer = await PlantImageGenerator.generate(config);
    const buffer = await imageGenerator.createImageBuffer(config, screenshotBuffer);

    return new Response(buffer, {
        headers: {
            "Content-Type": "image/png",
            "Content-Disposition": 'attachment; filename="AGRIBOT_Config.png"'
        }
    });
};
