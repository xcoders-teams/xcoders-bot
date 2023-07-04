'use strict';

import { createCanvas, registerFont, loadImage } from 'canvas';
import jimp from 'jimp';
import path from 'path';

class CustomCanvas {
    constructor() {
        // font properties
        this.pathFonts = path.join(process.cwd(), 'storage', 'fonts', 'Breaking.ttf');
        // image properties
        this.pathImages = path.join(process.cwd(), 'storage', 'images', 'background.png');
        this.imageEmpty = path.join(process.cwd(), 'storage', 'images', 'empty.png');
        this.imageTransparents = path.join(process.cwd(), 'storage', 'images', 'transparent.png');
        this.imageStandart = path.join(process.cwd(), 'storage', 'images', 'standart.png');
        this.imageColdsky = path.join(process.cwd(), 'storage', 'images', 'coldsky.png');
        this.imagePeakblue = path.join(process.cwd(), 'storage', 'images', 'peakblue.png');
        this.imagePinkman = path.join(process.cwd(), 'storage', 'images', 'pinkman.png');
        this.imageAqua = path.join(process.cwd(), 'storage', 'images', 'aqua.png');
        this.imaageDarkness = path.join(process.cwd(), 'storage', 'images', 'darkness.png');
        this.imageAngel = path.join(process.cwd(), 'storage', 'images', 'angel.png');
    }

    createCanvas(width, height) {
        return createCanvas(width, height);
    }

    registerFonts(fontPath, options) {
        registerFont(fontPath, options);
    }

    async loadImages(imagePath) {
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
        ctx.font = `bold ${fontSize}px Breaking`;
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

        this.registerFonts(this.pathFonts, { family: 'Breaking' }); // uncomment if you want to.
        const fontSize = this.calculateFontSize(text, backgroundWidth);
        ctx.font = `bold ${fontSize}px Breaking`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const textX = backgroundWidth / 2;
        const textY = backgroundHeight / 2;
        ctx.fillText(text, textX, textY);

        // Add watermark text
        const watermarkFontSize = 13;
        const watermarkTextX = backgroundWidth / 2.1;
        const watermarkTextY = backgroundHeight - 44; // Adjust the vertical position as needed
        ctx.font = `bold ${watermarkFontSize}px Helvetica`;
        ctx.fillStyle = '#FFFFFF'; // Adjust the color and transparency as needed
        ctx.fillText(global.watermark.replace(/[*_乂]/g, ''), watermarkTextX, watermarkTextY);

        return canvas.toBuffer();
    }

    async createWelcomeImage(profile, background, name, total) {
        const canvas = this.createCanvas(1024, 500);
        const context = canvas.getContext('2d');
        context.font = 'bold 72px Helvetica';
        context.fillStyle = '#ffffff';

        const backgroundImage = await this.loadImages(background);
        context.drawImage(backgroundImage, 0, 0, 1024, 500);
        context.fillText('Welcome', 360, 360);

        context.beginPath();
        context.arc(512, 166, 128, 0, Math.PI * 2, true);
        context.stroke();
        context.fill();

        context.font = 'bold 42px Helvetica';
        context.textAlign = 'center';
        context.fillText(name, 512, 410);
        context.font = 'bold 32px Helvetica';
        context.fillText(`Kamu adalah member ke ${total} di Grup ini`, 512, 455);

        context.beginPath();
        context.arc(512, 166, 119, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        const profileImage = await this.loadImages(profile);
        context.drawImage(profileImage, 393, 47, 238, 238);

        return canvas.toBuffer();
    }

    async createLeaveImage(profile, background, name) {
        const canvas = this.createCanvas(1024, 500);
        const context = canvas.getContext('2d');
        context.font = 'bold 72px Helvetica';
        context.fillStyle = '#ffffff';

        const backgroundImage = await this.loadImages(background);
        context.drawImage(backgroundImage, 0, 0, 1024, 500);
        context.fillText('Leave', 360, 360);

        context.beginPath();
        context.arc(512, 166, 128, 0, Math.PI * 2, true);
        context.stroke();
        context.fill();

        context.font = 'bold 42px Helvetica';
        context.textAlign = 'center';
        context.fillText(name, 512, 410);
        context.font = 'bold 32px Helvetica';
        context.fillText('Papayy!', 512, 455);

        context.beginPath();
        context.arc(512, 166, 119, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        const profileImage = await this.loadImages(profile);
        context.drawImage(profileImage, 393, 47, 238, 238);

        return canvas.toBuffer();
    }

    async welcome(profile_user, username, { link, gradiant, blur, text, text_color, username_color } = {}) {
        if (link && gradiant) throw new Error("You cannot use link and gradiant at the same time");
        if (link === "invisible") {
            link = this.imageTransparents;
        } else if (link === "standart") {
            link = this.imageStandart;
        }

        const canvas = this.createCanvas(800, 270);
        const ctx = canvas.getContext("2d");

        function imageRounded(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }
        function blurEffect(index) {
            ctx.save();
            imageRounded(20, 20, canvas.width, canvas.height, index);
            imageRounded(-20, -20, canvas.width, canvas.height, index);
            imageRounded(-30, 30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            imageRounded(-30, -30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            imageRounded(-30, -30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            imageRounded(-30, -30, canvas.width, canvas.height, index);
            imageRounded(30, -30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            imageRounded(30, -30, canvas.width, canvas.height, index);
            imageRounded(30, 30, canvas.width, canvas.height, index);
            ctx.clip();
        }

        if (blur) {
            const background = await jimp.read(link);
            background.blur(5);
            const imageBuffer = await background.getBufferAsync("image/png");
            const backgroundFixed = await this.loadImages(imageBuffer);
            blurEffect(20);
            ctx.drawImage(backgroundFixed, 0, 0, canvas.width, canvas.height);
        } else {
            const backgroundFixed = await this.loadImages(link);
            blurEffect(20);
            ctx.drawImage(backgroundFixed, 0, 0, canvas.width, canvas.height);
        }

        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const blurImage = await this.loadImages(this.imageEmpty);
        ctx.drawImage(blurImage, 0, 0, canvas.width, canvas.height);

        ctx.font = "bold 40px Helvetica";
        ctx.fillStyle = text_color;
        ctx.textAlign = "start";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;

        const name = text.length > 15 ? text.substring(0, 15).trim() + "..." : text;
        ctx.fillText(name, canvas.width / 2.5, canvas.height / 1.8);

        ctx.font = "bold 40px Helvetica";
        ctx.fillStyle = username_color;
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.fillText(username, canvas.width / 2.5, canvas.height / 1.8);

        const image = await jimp.read(profile_user);
        ctx.shadowBlur = 10;
        const raw = await image.getBufferAsync("image/png");
        const avatar = await this.loadImages(raw);
        ctx.drawImage(avatar, 50, 50, 170, 170);

        function positionRounded(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }
        function blurEffect(index) {
            ctx.save();
            positionRounded(20, 20, canvas.width, canvas.height, index);
            positionRounded(-20, -20, canvas.width, canvas.height, index);
            positionRounded(-30, 30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            positionRounded(-30, -30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            positionRounded(-30, -30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            positionRounded(-30, -30, canvas.width, canvas.height, index);
            positionRounded(30, -30, canvas.width, canvas.height, index);
            ctx.clip();
            ctx.save();
            positionRounded(30, -30, canvas.width, canvas.height, index);
            positionRounded(30, 30, canvas.width, canvas.height, index);
            ctx.clip();
        }

        return canvas.toBuffer();
    }
}

export default new CustomCanvas();