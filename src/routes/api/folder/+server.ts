import { json } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } from '$env/static/private';

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API,
    api_secret: CLOUDINARY_SECRET,
    secure: true
});

export const POST = async ({ request }) => {
    try {
        const { slug, email } = await request.json();

        if (!slug || !email) {
            return json({ error: 'Missing slug or email' }, { status: 400 });
        }

        const folderName = email.split('@')[0];
        const result = await cloudinary.api.resources_by_asset_folder(`${folderName}/${slug}`, {
            max_results: 100
        });

        let images = result.resources.map((image: any) => ({
            id: image.public_id,
            src: image.secure_url,
            timestamp: new Date(image.created_at),
            plantName: image.context?.custom.plantName || 'Unknown Plant',
            diseaseName: image.context?.custom.healthName || 'Unknown Disease',
            imageSize: image.width + 'x' + image.height,
            generatedDescription:
                image.context?.custom.description ||
                `A plant image showing symptoms of ${image.context?.custom.healthName || 'an unknown condition'}.`
        }));

        let thumbnail = null;
        const scanboxImage = images.find((img) => img.plantName === 'SCANBOX');
        if (scanboxImage) {
            thumbnail = scanboxImage.src;
        }

        let createdAt = 'NA';
        let lastModified = 'NA';

        if (images.length > 0) {
            const sorted = [...images].sort(
                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
            );
            createdAt = sorted[0].timestamp.toLocaleString();
            lastModified = sorted[sorted.length - 1].timestamp.toLocaleString();
        }

        const imagesWithStringTimestamps = images.map((img) => ({
            ...img,
            timestamp: img.timestamp.toLocaleString()
        }));

        let totalBytes = result.resources.reduce((acc: number, img: any) => acc + (img.bytes || 0), 0);

        function formatBytes(bytes: number) {
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ["B", "KB", "MB", "GB", "TB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
        }

        let folderMetadata = {
            id: slug,
            name: `Folder ${slug}`,
            createdAt,
            lastModified,
            size: formatBytes(totalBytes),
            fileCount: result.resources.length,
            access: 'Private'
        };

        return json({ images: imagesWithStringTimestamps, folder: folderMetadata, thumbnail });
    } catch (err) {
        console.error('Error fetching images:', err);

        let folderMetadata = {
            id: 'unknown',
            name: 'Unknown Folder',
            createdAt: 'NA',
            lastModified: 'NA',
            size: `0MB`,
            fileCount: 0,
            access: 'Private'
        };

        return json({ images: [], folder: folderMetadata, thumbnail: null }, { status: 500 });
    }
};
