// ImageWithJSON.ts
import fs from 'fs';
import extract from 'png-chunks-extract';
import encode from 'png-chunks-encode';
import pngText from 'png-chunk-text';
import type { ConfigType } from '$lib/type';


export class ImageWithJSON {

    /**
     * Create a visually styled PNG image with embedded JSON metadata
     * @param jsonData - Your JSON object to embed
     * @param outputFile - Path to save the PNG file
     */
    async createImage(jsonData: ConfigType, screenshotBuffer: Buffer, outputFile: string): Promise<void> {
        const chunks = extract(screenshotBuffer);
        const chunk = pngText.encode('Description', JSON.stringify(jsonData));
        const idatIndex = chunks.findIndex(c => c.name === 'IDAT');
        chunks.splice(idatIndex, 0, chunk);

        const outBuffer = Buffer.from(encode(chunks));
        fs.writeFileSync(outputFile, outBuffer);
    }

    async createImageBuffer(jsonData: ConfigType, screenshotBuffer: Buffer): Promise<Buffer> {
        const chunks = extract(screenshotBuffer);
        const chunk = pngText.encode('Description', JSON.stringify(jsonData));
        const idatIndex = chunks.findIndex(c => c.name === 'IDAT');
        chunks.splice(idatIndex, 0, chunk);

        return Buffer.from(encode(chunks));
    }

    /**
     * Read JSON metadata from a PNG image
     * @param inputFile - PNG file path
     * @returns Extracted JSON object or null if not found
     */
    static readImage(inputFile: string): ConfigType | null {
        const buffer = fs.readFileSync(inputFile);
        const chunks = extract(buffer);

        for (const chunk of chunks) {
            if (chunk.name === 'tEXt') {
                const { keyword, text } = pngText.decode(chunk.data);
                if (keyword === 'Description') {
                    return JSON.parse(text) as ConfigType;
                }
            }
        }

        return null;
    }

    static readImageBuffer(buffer: Uint8Array): ConfigType | null {
        const chunks = extract(buffer);

        for (const chunk of chunks) {
            if (chunk.name === 'tEXt') {
                const { keyword, text } = pngText.decode(chunk.data);
                if (keyword === 'Description') {
                    return JSON.parse(text) as ConfigType;
                }
            }
        }

        return null;
    }

}
