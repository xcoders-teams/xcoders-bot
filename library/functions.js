import '../configs/global.js';
import fs from 'fs';
import path from 'path';
import util from 'util';
import http from 'https';
import https from 'https';
import pdfkit from 'pdfkit';
import crypto from 'crypto';
import fetch from 'node-fetch';
import webpmux from 'node-webpmux';
import Module from 'module';
import _ from 'lodash';
import archiver from 'archiver';
import { exec as childExec, spawn } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { fileTypeFromBuffer } from 'file-type';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

import ParseResult from './parseResult.js';

const writeFileAsync = fs.promises.writeFile;
const readFileAsync = fs.promises.readFile;
const unlinkAsync = fs.promises.unlink;
const existsAsync = fs.existsSync;
const execAsync = util.promisify(childExec);
const database = global.database = new Array();
const library = new Object();

// library export
function xcodersLastKeysObject(input) {
  if (typeof input === 'string') return input;
  const keys = Object.keys(input);
  const lastKey = keys[keys.length - 1];
  const lastValue = input[lastKey];
  if (typeof lastValue === 'object') return xcodersLastKeysObject(lastValue);
  if (Array.isArray(lastValue)) return _.sample(response.error.request);
  if (!lastValue) return _.sample(response.error.request);
  return lastValue;
}

function xcodersParseResult(input) {
  const parseInput = new ParseResult();
  return parseInput.parse(input);
}

function xcodersCapitalized(text) {
  const parsed = new ParseResult();
  return parsed.capitalized(text);
}

function xcodersRequireJson(pathFiles) {
  if (!existsAsync(pathFiles)) throw new Error('files not exists.');
  const readFiles = fs.readFileSync(pathFiles);
  const parseFiles = JSON.parse(readFiles);
  return parseFiles;
}

function xcodersArrayBufferToBuffer(arrayBuffer) {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

function xcodersConvertToPDF(images = [], size = 'A4') {
  return new Promise(async (resolve, reject) => {
    const sizes = xcodersRequireJson('./database/pdfSizes.json');
    if (!Array.isArray(images)) return reject('images must be an array');
    const getSize = sizes[size];
    if (!getSize) return reject('Size is invalid!');
    const buffers = [];
    const document = new pdfkit({ margin: 0, size: getSize });
    for (let image of images) {
      try {
        const data = await fetch(image).then((response) => response.arrayBuffer());
        const buffer = xcodersArrayBufferToBuffer(data);
        document.image(buffer, 0, 0, { fit: getSize, align: 'center', valign: 'center' });
        document.addPage();
      } catch (err) {
        reject(err);
      }
    }
    document.on('data', (chunk) => buffers.push(chunk));
    document.on('end', () => resolve(Buffer.concat(buffers)));
    document.on('error', (err) => reject(err));
    document.end();
  });
}

async function xcodersCheckContentType(url, type) {
  try {
    const protocol = url.trim()?.startsWith('https') ? https : http;
    const requestOptions = {
      method: 'HEAD',
      headers: {
        'User-Agent': `is-${type}-header/01.05.2003 (https://api-xcoders.site)`
      }
    };
    const response = await new Promise((resolve, reject) => {
      const request = protocol.request(url.trim(), requestOptions, (content) => {
        if (content.statusCode >= 300 && content.statusCode < 400 && content.headers.location) {
          const redirectUrl = new URL(content.headers.location, url.trim());
          xcodersCheckContentType(redirectUrl.href, type).then(resolve).catch(reject);
          request.destroy();
          return;
        } else {
          resolve(content);
        }
      });
      request.on('error', reject);
      request.end();
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const result = response.headers['content-type'];
      return result.match(type) !== null;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

function xcodersGetBuffer(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.trim()?.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'DNT': '1',
        'Upgrade-Insecure-Request': '1',
        'User-Agent': global.userAgent
      }
    };
    const request = protocol.request(url.trim(), requestOptions, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = new URL(response.headers.location, url.trim());
        xcodersGetBuffer(redirectUrl.href, options).then(resolve).catch(reject);
        request.destroy();
        return;
      } else {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', async () => {
          const data = Buffer.concat(chunks);
          const type = await fileTypeFromBuffer(data);
          const ext = !type ? response.headers['content-type'].split('/')[1] : type.ext;
          if (!options.optional) {
            resolve(data);
          } else {
            resolve({ mimetype: response.headers['content-type'], size: response.headers['content-length'], ext: ext, result: data });
          }
        });
      }
    });
    request.on('error', reject);
    request.end();
  });
}

async function xcodersGetJson(url, options = {}) {
  try {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'DNT': '1',
        'Upgrade-Insecure-Request': '1',
        'User-Agent': global.userAgent
      }
    };
    const response = await new Promise((resolve, reject) => {
      const req = protocol.request(url, requestOptions, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url);
          xcodersGetJson(redirectUrl.href, options).then(resolve).catch(reject);
          req.destroy();
          return;
        } else {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve({ status: res.statusCode, message: res.statusMessage, data: Buffer.concat(chunks).toString() }));
        }
      });
      req.on('error', reject);
      if (options.data) {
        req.write(options.data);
      }
      req.end();
    });
    try {
      const jsonData = JSON.parse(response.data);
      return jsonData;
    } catch (error) {
      return {
        status: false,
        message: 'error get data'
      };
    }
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: error
    };
  }
}

function xcodersFormatDuration(seconds) {
  seconds = Number(seconds);
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const durationParts = [];
  if (days > 0) {
    durationParts.push(days + (days === 1 ? ' day' : ' days'));
  }
  if (hours > 0) {
    durationParts.push(hours + (hours === 1 ? ' hour' : ' hours'));
  }
  if (minutes > 0) {
    durationParts.push(minutes + (minutes === 1 ? ' minute' : ' minutes'));
  }
  if (remainingSeconds > 0) {
    durationParts.push(remainingSeconds + (remainingSeconds === 1 ? ' second' : ' seconds'));
  }
  return durationParts.length === 0 ? '0 seconds' : durationParts.length === 1 ? durationParts[0] : durationParts.length === 2 ? durationParts.join(', ') : durationParts.join(', ');
}

function xcodersUtcFormat(duration) {
  const hours = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const secs = Math.floor(duration % 60);
  const result = [];
  if (hours > 0) {
    result.push(`${hours}`);
  }
  result.push(`${mins < 10 ? '0' : ''}${mins}`);
  result.push(`${secs < 10 ? '0' : ''}${secs}`);
  return result.join(':');
}


function xcodersGetRandom(ext) {
  return `${crypto.randomBytes(16).toString('hex')}${ext.includes('.') ? ext : `.${ext}`}`;
}

async function xcodersDownloadContentMediaMessage(message, options = {}) {
  const mime = (message.coders || message).mimetype || '';
  const messageType = mime.startsWith('application') ? mime.replace('application', 'document') : mime.split('/')[0];
  const stream = await Baileys.downloadContentFromMessage(message, messageType);
  const buffers = await Baileys.toBuffer(stream);
  if (!options.optional) return buffers;
  const inputFile = path.join(process.cwd(), 'temp', xcodersGetRandom('.webp'));
  const outputFile = path.join(process.cwd(), 'temp', xcodersGetRandom('.jpg'));
  await writeFileAsync(inputFile, buffers);
  const result = await new Promise((resolve, reject) => ffmpeg(inputFile).output(outputFile).on('end', () => resolve(fs.readFileSync(outputFile))).on('error', reject).run());
  if (existsAsync(outputFile)) await unlinkAsync(outputFile);
  if (existsAsync(inputFile)) await unlinkAsync(inputFile);
  return result;
}

function xcodersCreateShortData(url, ...args) {
  const id = crypto.randomBytes(32).toString('base64').replace(/\W\D/gi, '').slice(0, 5);
  const data = { id, url };
  Object.assign(data, ...args);
  if (database.some(x => x.url == url)) return data;
  database.push(data);
  return data;
}

function xcodersFormatSize(bytes, si = true) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';
  const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  while (Math.abs(bytes) >= thresh && u < units.length - 1) {
    bytes /= thresh;
    ++u;
  }
  return bytes.toFixed(1) + ' ' + units[u];
}

function xcodersReloadModule(modulePath) {
  const require = Module.createRequire(import.meta.url);
  const fullPath = path.resolve(modulePath);
  delete require.cache[fullPath];
}

function xcodersFolderSize(folderPath) {
  let totalSize = 0;
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    }
  });
  return { size: totalSize };
}

async function xcodersCreateSticker(media, options = {}, nameExif = './temp/data.exif') {
  media = Buffer.isBuffer(media) ? media : existsAsync(media) ? await readFileAsync(media) : null;
  if (!Buffer.isBuffer(media)) throw new Error('file is not a Buffer object.');
  const { ext } = await fileTypeFromBuffer(media);
  const tmpFileOut = path.join(process.cwd(), 'temp', xcodersGetRandom('.webp'));
  const tmpFileIn = path.join(process.cwd(), 'temp', xcodersGetRandom(ext));
  try {
    await writeFileAsync(tmpFileIn, media);
    if (options.packname || options.authorname) {
      nameExif = './temp/' + xcodersGetRandom('.exif');
      await createExif(options.packname, options.authorname, nameExif);
    }
    const processedSticker = await new Promise((resolve, reject) => ffmpeg(tmpFileIn).on('error', reject)
      .on('end', async () => {
        try {
          if (!existsAsync(nameExif)) await createExif(global.packname, global.authorname, nameExif);
          const checkWebpmux = await checkPackageWebpmux();
          if (checkWebpmux) {
            await execAsync(`webpmux -set exif ${nameExif} ${tmpFileOut} -o ${tmpFileOut}`);
            if (!/data\.exif/.test(nameExif) && existsAsync(nameExif)) await unlinkAsync(nameExif);
            return resolve(true);
          }
          const metadatSticker = await xcodersCreateSticker(tmpFileOut, { exifPath: nameExif });
          await writeFileAsync(tmpFileOut, metadatSticker);
          if (!/data\.exif/.test(nameExif) && existsAsync(nameExif)) await unlinkAsync(nameExif);
          return resolve(true);
        } catch (error) {
          if (existsAsync(tmpFileOut)) await unlinkAsync(tmpFileOut);
          if (!/data\.exif/.test(nameExif) && existsAsync(nameExif)) await unlinkAsync(nameExif);
          reject(error);
        }
      }).addOutputOptions(['-vcodec', 'libwebp', '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"]).toFormat('webp').save(tmpFileOut)
    );
    if (!processedSticker) throw new Error(processedSticker);
    const buffer = await readFileAsync(tmpFileOut);
    await unlinkAsync(tmpFileOut);
    await unlinkAsync(tmpFileIn);
    return buffer;
  } catch (error) {
    if (existsAsync(tmpFileIn)) {
      await unlinkAsync(tmpFileIn);
    }
    throw error;
  }
}

async function xcodersCreateWatermark(media, options = {}) {
  const tmpFileOut = path.join(process.cwd(), 'temp', xcodersGetRandom('.webp'));
  const tmpFileIn = path.join(process.cwd(), 'temp', xcodersGetRandom('.webp'));
  try {
    media = Buffer.isBuffer(media) ? media : existsAsync(media) ? await readFileAsync(media) : null;
    const { ext } = await fileTypeFromBuffer(media);
    if (ext !== 'webp') throw new Error(`error create exif with ext: ${ext}`);
    await writeFileAsync(tmpFileIn, media);
    const image = new webpmux.Image();
    await image.load(tmpFileIn);
    if (!options.exifPath || options.packname || options.authorname) {
      const pathExif = path.join(process.cwd(), 'temp', xcodersGetRandom('.exif'));
      await createExif(options.packname, options.authorname, pathExif);
      options.exifPath = await readFileAsync(pathExif);
      if (existsAsync(pathExif)) await unlinkAsync(pathExif);
    } else {
      options.exifPath = await readFileAsync(options.exifPath);
    }
    image.exif = Buffer.isBuffer(options.exifPath) ? options.exifPath : await readFileAsync('./temp/data.exif');
    await image.save(tmpFileOut);
    const buffer = await readFileAsync(tmpFileOut);
    if (existsAsync(tmpFileIn)) await unlinkAsync(tmpFileIn);
    if (existsAsync(tmpFileOut)) await unlinkAsync(tmpFileOut);
    return buffer;
  } catch (error) {
    if (existsAsync(tmpFileIn)) await unlinkAsync(tmpFileIn);
    if (existsAsync(tmpFileOut)) await unlinkAsync(tmpFileOut);
    throw error;
  }
}

async function xcodersConvertToMp3(data) {
  try {
    const inputPath = path.join(process.cwd(), 'temp', `video_${crypto.randomBytes(3).toString('hex')}.mp4`);
    const output = path.join(process.cwd(), 'temp', `${crypto.randomBytes(3).toString('hex')}.mp3`);
    await writeFileAsync(inputPath, data);
    const file = await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFrequency(44100)
        .audioChannels(2)
        .audioBitrate('128k')
        .audioCodec('libmp3lame')
        .audioQuality(5)
        .toFormat('mp3')
        .save(output)
        .on('error', reject)
        .on('end', () => resolve(fs.readFileSync(output)));
    });
    if (existsAsync(output)) await unlinkAsync(output);
    if (existsAsync(inputPath)) await unlinkAsync(inputPath);
    return file;
  } catch (error) {
    throw error;
  }
}

function xcodersConvertGifToMp4(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .inputOptions('-ignore_loop 0')
      .outputOptions('-movflags faststart')
      .output(outputFilePath)
      .on('end', () => {
        console.log('Conversion completed successfully.');
        resolve(true);
      })
      .on('error', (error) => {
        console.error('Error during conversion:', error.message);
        reject(error);
      })
      .run();
  });
}

function xcodersZipFolder(srcFolder, zipFilePath, callback) {
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', function () {
    callback();
  });
  archive.on('error', function (error) {
    callback(error);
  });
  archive.pipe(output);
  archive.directory(srcFolder, false);
  archive.finalize(function (error) {
    if (error) {
      callback(error);
    }
    callback(null, 'Successfully...');
  });
}

function reactEmoji() {
  const emojiList = {
    'love': ['❤', '😍', '😘', '💕', '😻', '💑', '👩‍❤‍👩', '👨‍❤‍👨', '💏', '👩‍❤‍💋‍👩', '👨‍❤‍💋‍👨', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '💋', '👩‍❤️‍💋‍👩', '👨‍❤️‍💋‍👨', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '👩‍❤️‍💋‍👨', '👬', '👭', '👫', '🥰', '😚', '😙', '👄', '🌹', '😽', '❣️', '❤️'],
    'happy': ['😀', ' 😃', ' 😄', ' 😁', ' 😆', ' 😅', ' 😂', ' 🤣', ' 🙂', ' 😛', ' 😝', ' 😜', ' 🤪', ' 🤗', ' 😺', ' 😸', ' 😹', ' ☺', ' 😌', ' 😉', ' 🤗', ' 😊'],
    'sad': ['☹', ' 😣', ' 😖', ' 😫', ' 😩', ' 😢', ' 😭', ' 😞', ' 😔', ' 😟', ' 😕', ' 😤', ' 😠', ' 😥', ' 😰', ' 😨', ' 😿', ' 😾', ' 😓', ' 🙍‍♂', ' 🙍‍♀', ' 💔', ' 🙁', ' 🥺', ' 🤕', ' ☔️', ' ⛈', ' 🌩', ' 🌧'],
    'angry': ['😯', ' 😦', ' 😧', ' 😮', ' 😲', ' 🙀', ' 😱', ' 🤯', ' 😳', ' ❗', ' ❕', ' 🤬', ' 😡', ' 😠', ' 🙄', ' 👿', ' 😾', ' 😤', ' 💢', ' 👺', ' 🗯️', ' 😒', ' 🥵'],
    'greet': ['👋'],
    'celebrate': ['🎊', ' 🎉', ' 🎁', ' 🎈', ' 👯‍♂️', ' 👯', ' 👯‍♀️', ' 💃', ' 🕺', ' 🔥', ' ⭐️', ' ✨', ' 💫', ' 🎇', ' 🎆', ' 🍻', ' 🥂', ' 🍾', ' 🎂', ' 🍰']
  };
  const objectEmoji = Object.keys(emojiList);
  const randomEmoji = _.sample(objectEmoji);
  return emojiList[randomEmoji];
}

async function checkPackageWebpmux() {
  try {
    const event = spawn('webpmux');
    const check = await Promise.race([
      new Promise((resolve) => event.on('close', (code) => resolve(code !== 127))),
      new Promise((resolve) => event.on('error', () => resolve(false))),
    ]);
    return check;
  } catch (error) {
    throw error;
  }
}

async function createExif(packname, authorname, pathname) {
  if (existsAsync(pathname)) return true;
  const pack = {
    'sticker-pack-id': 'com.snowcorp.stickerly.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': authorname,
    'emojis': reactEmoji(),
    'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.stickify.stickermaker',
    'ios-app-store-link': 'https://itunes.apple.com/app/sticker-maker-studio/id1443326857'
  };
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(pack), 'utf-8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await writeFileAsync(pathname, exif);
  if (existsAsync(pathname)) {
    return true;
  } else {
    throw new Error(`Failed to create EXIF file: ${pathname}`);
  }
}

library.zipFolder = xcodersZipFolder;
library.check = checkPackageWebpmux;
library.convertToMp4 = xcodersConvertGifToMp4;
library.convertToMp3 = xcodersConvertToMp3;
library.folderSize = xcodersFolderSize;
library.createWatermark = xcodersCreateWatermark;
library.createSticker = xcodersCreateSticker;
library.formatSize = xcodersFormatSize;
library.utcFormat = xcodersUtcFormat;
library.formatDuration = xcodersFormatDuration;
library.createShortData = xcodersCreateShortData;
library.downloadContentMediaMessage = xcodersDownloadContentMediaMessage;
library.getRandom = xcodersGetRandom;
library.getJson = xcodersGetJson;
library.getBuffer = xcodersGetBuffer;
library.checkContentType = xcodersCheckContentType;
library.reloadModule = xcodersReloadModule;
library.requireJson = xcodersRequireJson;
library.convertToPDF = xcodersConvertToPDF;
library.convertToBuffer = xcodersArrayBufferToBuffer;
library.parseResult = xcodersParseResult;
library.capitalize = xcodersCapitalized;
library.getMessage = xcodersLastKeysObject;

export default library;

const files = global.absoluteUrl(import.meta.url);
fs.watchFile(files, () => {
  fs.unwatchFile(files);
  logger.info('Update functions.js');
  import(`${files}?update=${Date.now()}`);
});