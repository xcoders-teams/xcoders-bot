import fs from 'fs';
import jimp from 'jimp';
import path from 'path';
import http from 'https';
import https from 'https';
import pdfkit from 'pdfkit';
import crypto from 'crypto';
import fetch from 'node-fetch';
import Module from 'module';
import _ from 'lodash';
import url from 'url';
import Baileys from '@whiskeysockets/baileys';
import { fileTypeFromBuffer } from 'file-type';

import ParseResult from './parseResult.js';

const database = global.database = new Array();
const library = new Object();

function lastKeysObject(input) {
  if (typeof input === 'string') {
    return input;
  }
  const keys = Object.keys(input);
  const lastKey = keys[keys.length - 1];
  const lastValue = input[lastKey];
  if (typeof lastValue === 'object') {
    return lastKeysObject(lastValue);
  }
  if (Array.isArray(lastValue)) {
    return _.sample(response.error.request);
  }
  if (!lastValue) {
    return _.sample(response.error.request);
  }
  return lastValue;
}


function parseResult(input) {
  const parseInput = new ParseResult();
  return parseInput.parse(input);
}

function requireJson(pathFiles) {
  if (!fs.existsSync(pathFiles)) throw new Error('files not exists.');
  const readFiles = fs.readFileSync(pathFiles);
  const parseFiles = JSON.parse(readFiles);
  return parseFiles;
}

function convertToPDF(images = [], size = 'A4') {
  return new Promise(async (resolve, reject) => {
    const sizes = requireJson('./database/pdfSizes.json');
    if (!Array.isArray(images)) return reject('images must be an array');
    const getSize = sizes[size];
    if (!getSize) return reject('Size is invalid!');
    const buffers = [];
    const document = new pdfkit({ margin: 0, size: getSize });
    for (let image of images) {
      try {
        const data = await fetch(image).then((response) => response.arrayBuffer());
        document.image(data, 0, 0, { fit: getSize, align: 'center', valign: 'center' });
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

async function isImageUrl(url) {
  try {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: 'HEAD',
      headers: {
        'User-Agent': 'is-image-header/1.0.1 (https://api-xcoders.site)'
      }
    };
    const response = await new Promise((resolve, reject) => {
      const req = protocol.request(url, requestOptions, (res) => resolve(res));
      req.on('error', reject);
      req.end();
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return (/image\//gi).test(response.headers['content-type']);
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function isAudioUrl(url) {
  try {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: 'HEAD',
      headers: {
        'User-Agent': 'is-audio-header/1.0.2 (https://api-xcoders.site)'
      }
    };
    const response = await new Promise((resolve, reject) => {
      const req = protocol.request(url, requestOptions, (res) => resolve(res));
      req.on('error', reject);
      req.end();
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return (/audio\//gi).test(response.headers['content-type']);
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function isVideoUrl(url) {
  try {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: 'HEAD',
      headers: {
        'User-Agent': 'is-video-header/1.0.3 (https://api-xcoders.site)'
      }
    };
    const response = await new Promise((resolve, reject) => {
      const req = protocol.request(url, requestOptions, (res) => resolve(res));
      req.on('error', reject);
      req.end();
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return (/video\//gi).test(response.headers['content-type']);
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

function getBuffer(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'DNT': '1',
        'Upgrade-Insecure-Request': '1',
        'User-Agent': global.userAgent
      },
      responseType: 'arraybuffer'
    };
    const req = protocol.request(url, requestOptions, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect if the response status code is a redirect
        const redirectUrl = new URL(res.headers.location, url);
        getBuffer(redirectUrl.href, options).then(resolve).catch(reject);
      } else {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', async () => {
          const data = Buffer.concat(chunks);
          const { ext } = await fileTypeFromBuffer(data);
          if (!options.optional) {
            resolve(data);
          } else {
            resolve({
              mimetype: res.headers['content-type'],
              size: res.headers['content-length'],
              ext: ext,
              result: data
            });
          }
        });
      }
    });
    req.on('error', reject);
    req.end();
  });
}

async function getJson(url, options = {}) {
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
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const data = Buffer.concat(chunks).toString();
          resolve({ status: res.statusCode, data });
        });
      });
      req.on('error', reject);
      if (options.data) {
        req.write(options.data);
      }
      req.end();
    });
    return JSON.parse(response.data);
  } catch (error) {
    throw error;
  }
}


function upTimer (ms) {
  const h = Math.floor(ms / 3600000)
  const m = (Math.floor(ms / 60000) % 60);
  const s = (Math.floor(ms / 1000) % 60);
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

function formatDuration(seconds) {
  seconds = Number(seconds);
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds % (3600 * 24) / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainingSeconds = (seconds % 60);
  let result = '';
  if (days > 0) result += days + (days == 1 ? ' day, ' : ' days, ');
  if (hours > 0) result += hours + (hours == 1 ? ' hour, ' : ' hours, ');
  if (minutes > 0) result += minutes + (minutes == 1 ? ' minute, ' : ' minutes, ');
  if (remainingSeconds > 0) result += remainingSeconds + (remainingSeconds == 1 ? ' second' : ' seconds');
  if (result === '') result = '0 seconds';
  return result;
}

function getRandom (ext) {
  return `${Math.floor(Math.random() * 10000000) + 1}${ext}`;
}

async function downloadContentMediaMessage(message, options = {}) {
  const mime = (message.coders || message).mimetype || '';
  const messageType = mime.startsWith('application') ? mime.replace('application', 'document') : mime.split('/')[0];
  const stream = await Baileys.downloadContentFromMessage(message, messageType);
  const buffers = await Baileys.toBuffer(stream);
  if (!options.optional) return buffers;
  const image = await jimp.read(buffers);
  return image.getBufferAsync(jimp.MIME_PNG);
}

function createShortData (url, ...args) {
  const id = crypto.randomBytes(32).toString('base64').replace(/\W\D/gi, '').slice(0, 5);
  const data = { id, url };
  Object.assign(data, ...args);
  if (database.some(x => x.url == url)) return data;
  database.push(data);
  return data;
}

function formatSize(bytes, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';
  const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  while (Math.abs(bytes) >= thresh && u < units.length - 1) {
    bytes /= thresh;
    ++u;
  }
  return bytes.toFixed(dp) + ' ' + units[u];
}

function reloadModule(modulePath) {
  const require = Module.createRequire(import.meta.url);
  const fullPath = path.resolve(modulePath);
  delete require.cache[fullPath];
}


library.reloadModule = reloadModule;
library.formatSize = formatSize;
library.upTimer = upTimer;
library.createShortData = createShortData;
library.downloadContentMediaMessage = downloadContentMediaMessage;
library.getRandom = getRandom;
library.formatDuration = formatDuration;
library.getJson = getJson;
library.getBuffer = getBuffer;
library.isImageUrl = isImageUrl;
library.isAudioUrl = isAudioUrl;
library.isVideoUrl = isVideoUrl;
library.requireJson = requireJson;
library.convertToPDF = convertToPDF;
library.parseResult = parseResult;
library.getMessage = lastKeysObject;

export default library;

const files = url.fileURLToPath(import.meta.url);
fs.watchFile(files, () => {
  fs.unwatchFile(files);
  logger.info('Update functions.js');
  import(`${files}?update=${Date.now()}`);
});