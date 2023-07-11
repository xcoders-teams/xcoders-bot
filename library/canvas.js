'use strict';

import _ from 'lodash';
import * as canvasAsync from 'canvas';
import * as jimp from 'jimp';
import * as path from 'path';

class CustomCanvas {
  constructor() {
    // font properties
    this.pathFonts = path.join(process.cwd(), 'storage', 'fonts', 'Breaking.ttf');
    // image properties
    this.pathImages = path.join(process.cwd(), 'storage', 'images');
    this.imageTransparents = path.join(this.pathImages, 'transparent.png');
    this.imageBackground = path.join(this.pathImages, 'background.png');
    this.imageVoid = path.join(this.pathImages, 'profile_void.png');
    this.imageStandard = path.join(this.pathImages, 'standard.png');
  }

  createCanvas(width, height) {
    return canvasAsync.createCanvas(width, height);
  }

  registerFonts(fontPath, options) {
    canvasAsync.registerFont(fontPath, options);
  }

  async loadImages(imagePath) {
    return canvasAsync.loadImage(imagePath);
  }

  randomGradientImages() {
    const imageColdsky = path.join(this.pathImages, 'coldsky.png');
    const imagePeakblue = path.join(this.pathImages, 'peakblue.png');
    const imagePinkman = path.join(this.pathImages, 'pinkman.png');
    const imageAqua = path.join(this.pathImages, 'aqua.png');
    const imaageDarkness = path.join(this.pathImages, 'darkness.png');
    const imageAngel = path.join(this.pathImages, 'angel.png');
    const imageBackground = path.join(this.pathImages, 'background.png');
    const arrayImages = [imageColdsky, imagePeakblue, imagePinkman, imageAqua, imaageDarkness, imageAngel, imageBackground];
    return _.sample(arrayImages);
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

  async create(text, image = null) {
    const link = _.sample(['invisible', 'standard', 'gradient']);
    if (link === 'invisible') {
      image = this.imageTransparents;
    } else if (link === 'standard') {
      image = this.imageStandard;
    } else if (link === 'gradient') {
      image = this.randomGradientImages();
    }
    const background = await jimp.read(image);
    background.scale(1.25);
    background.blur(10);
    const resultBlur = await background.getBufferAsync('image/png');
    const backgroundImage = await this.loadImages(resultBlur);
    const backgroundWidth = backgroundImage.width;
    const backgroundHeight = backgroundImage.height;

    const canvas = this.createCanvas(backgroundWidth, backgroundHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(backgroundImage, 0, 0, backgroundWidth, backgroundHeight);

    this.registerFonts(this.pathFonts, { family: 'Breaking' });
    const fontSize = this.calculateFontSize(text, backgroundWidth);
    ctx.font = `bold ${fontSize}px Breaking`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const textX = backgroundWidth / 2;
    const textY = backgroundHeight / 2;
    ctx.fillText(text, textX, textY);

    const watermarkFontSize = 13;
    const watermarkTextX = backgroundWidth / 2.1;
    const watermarkTextY = backgroundHeight - 44; // Adjust the vertical position as needed
    ctx.font = `bold ${watermarkFontSize}px Helvetica`;
    ctx.fillStyle = '#FFFFFF'; // Adjust the color and transparency as needed
    ctx.fillText(global.watermark.replace(/[*_乂]/g, ''), watermarkTextX, watermarkTextY);

    return canvas.toBuffer();
  }
}

export default new CustomCanvas(); 