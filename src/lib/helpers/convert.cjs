const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const sizes = [480, 1024, 1920, 3840];
async function convertImage(inputPath) {
	try {
		const fileName = path.basename(inputPath, path.extname(inputPath));

		const outputDir = path.join(path.dirname(inputPath), fileName);
		await fs.ensureDir(outputDir);

		for (const size of sizes) {
			const outputFilePath = path.join(outputDir, `${fileName}-${size}.webp`);

			await sharp(inputPath)
				.resize(size) 
				.toFormat('webp')
				.toFile(outputFilePath);

			console.log(`✅ Created: ${outputFilePath}`);
		}
		console.log('🎉 Image conversion completed!');
	} catch (error) {
		console.error('❌ Error:', error);
	}
}
const inputImage = process.argv[2];
if (!inputImage) {
	console.log('❌ Please provide an image file.\nUsage: node convert.js <image_path>');
} else {
	convertImage(inputImage);
}
