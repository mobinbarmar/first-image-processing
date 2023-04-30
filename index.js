const Jimp = require('jimp');

async function processImage(imagePath) {
    // Read the image
    const image = await Jimp.read(imagePath);

    // Convert the image to black and white
    image.grayscale();

    // Save the black and white image
    await image.writeAsync('black-white.png');

    // Create an RGBA matrix from each pixel
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const rgbaMatrix = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
            row.push(pixelColor);
        }
        rgbaMatrix.push(row);
    }

    // Log the RGBA matrix to the console
    console.log(rgbaMatrix);

    // Create an 8-bit binary matrix from the RGBA matrix
    const binaryMatrix = rgbaMatrix.map(row => row.map(pixel => {
        const binaryString = (pixel.r << 24 | pixel.g << 16 | pixel.b << 8 | pixel.a).toString(2).padStart(32, '0');
        return binaryString;
    }));

    // Separate the 8 bits into 8 separate matrices
    const bitMatrices = [];
    for (let i = 0; i < 8; i++) {
        const bitMatrix = binaryMatrix.map(row => row.map(binaryString => binaryString[i]));
        bitMatrices.push(bitMatrix);
    }

    // Save the 8 bit matrices as 8 images
    for (let i = 0; i < bitMatrices.length; i++) {
        const bitMatrixImage = new Jimp(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const bit = bitMatrices[i][y][x];
                const color = bit === '1' ? 0xFFFFFFFF : 0x000000FF;
                bitMatrixImage.setPixelColor(color, x, y);
            }
        }
        await bitMatrixImage.writeAsync(`bit-matrix-${i}.png`);
    }
}

processImage('image.jpg');