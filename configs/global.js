import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { platform } from 'process';
import { fileURLToPath } from 'url';

global.restApi = ['https://api-xcoders.site', 'https://api-fxc7.cloud.okteto.net'];
global.ownerNumber = ['6285956396417@s.whatsapp.net', '6285855030554@s.whatsapp.net'];
global.absoluteUrl = (pathFiles) => {
  if (platform !== 'android') {
    const updateFile = fileURLToPath(import.meta.url).toString();
    return updateFile;
  } else {
    return fileURLToPath(pathFiles);
  }
};
global.Baileys = (await import('@whiskeysockets/baileys')).default;
global.axios = (await import('axios')).default;
global.cheerio = (await import('cheerio')).default;
global.PORT = process.env.PORT || 8000;
global.prefix = '!';
global.apikeys = 'YOUR APIKEYS';
global.multiprefix = true;
global.nonprefix = false;
global.public = true;
global.original = false;
global.qrcode = null;
global.watermark = "\n\t_*乂 bot WhatsApp - xcoders team's*_";
global.packname = 'Created By';
global.authorname = 'xcoders bot';
global.sizeSession = null;
global.commander = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database', 'commands.json')));
global.Commands = {};
global.headersCommands = [];
global.allCommands = [];
global.plugins = {};
global.hitCommand = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database', 'hit.json')));
global.thumbnail = fs.readFileSync(path.join(process.cwd(), 'images', 'thumbnail.png'));
global.icon = fs.readFileSync(path.join(process.cwd(), 'images', 'icon.png'));
global.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
global.response = Object.freeze({
  isCreator: '*perintah ini hanya untuk owner...*',
  isGroup: '*Perintah ini hanya untuk di Group...*',
  isBotAdmin: '*perintah ini dapat digunakan jika bot menjadi admin group....*',
  isAdmin: '*Perintah ini hanya dapat digunakan oleh admin grup...*',
  success: '*Success...*',
  error: {
    request: ['*Oops, Your request error \'_\'*', '*Maaf Terjadi Kesalahan*', '*Terjadi Kesalahan Pada Server*', '*Error kak*', '*Maaf kak Error*'],
    url: ['*Invalid Input url*', '*invalid url*', '*link tidak valid*', '*link yang kamu masukkan tidak valid*']
  },
  process: ['*Sek proses...*', '*Sedang Diproses...*', '*Tunggu Sebentar...*', '*Sabar Kak...*', '*Prosess...*']
});

const files = global.absoluteUrl(import.meta.url);
fs.watchFile(files, () => {
  fs.unwatchFile(files);
  console.log(chalk.redBright('Update global.js'));
  import(`${files}?update=${Date.now()}`);
});