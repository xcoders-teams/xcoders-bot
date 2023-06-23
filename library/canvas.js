import { createCanvas, registerFont, loadImage } from 'canvas';
import path from 'path';

class CustomCanvas {
    constructor() {
        this.pathFonts = path.join(process.cwd(), 'storage', 'fonts', 'xcode.ttf');
        this.pathImages = path.join(process.cwd(), 'storage', 'images', 'background.png');
    }

    createCanvas(width, height) {
        return createCanvas(width, height);
    }

    registerFonts(fontPath, options) {
        registerFont(fontPath, options);
    }

    loadImages(imagePath) {
        return loadImage(imagePath);
    }

    calculateFontSize(text, canvasWidth) {
        let fontSize = 100;
        const maxWidth = canvasWidth * 0.9;
        while (true) {
            const textWidth = this.calculateTextWidth(text, fontSize);
            if (textWidth <= maxWidth) {
                break;
            }
            fontSize -= 5;
        }
        return fontSize;
    }

    calculateTextWidth(text, fontSize) {
        const canvas = this.createCanvas(1, 1);
        const ctx = canvas.getContext('2d');
        ctx.font = `bold ${fontSize}px Helvetica`;
        const textMetrics = ctx.measureText(text);
        return textMetrics.width;
    }

    async create(text) {
        const backgroundImage = await this.loadImages(this.pathImages);
        const backgroundWidth = backgroundImage.width;
        const backgroundHeight = backgroundImage.height;

        const canvas = this.createCanvas(backgroundWidth, backgroundHeight);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(backgroundImage, 0, 0, backgroundWidth, backgroundHeight);

        // this.registerFonts(this.pathFonts, { family: 'Helvetica' }); // uncomment if you want to.
        const fontSize = this.calculateFontSize(text, backgroundWidth);
        ctx.font = `bold ${fontSize}px Helvetica`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const textX = backgroundWidth / 2;
        const textY = backgroundHeight / 2;
        ctx.fillText(text, textX, textY);

        return canvas.toBuffer();
    }
}

export default new CustomCanvas();