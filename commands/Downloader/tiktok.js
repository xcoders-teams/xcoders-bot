'use strict';

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileTypeFromBuffer } from "file-type";

export default {
  views: ['tiktok < url > --flag'], // view for message in  menu
  command: /^(ttdl|tiktok|tt)$/i, //another command.
  description: 'Download media from Tiktok Url',
  query: true,
  url: true,
  usage: '%cmd% url tiktok --wm or --nowm\nFlag --wm untuk video dengan watermark.\nFlag --nowm untuk video tanpa watermark.',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, replyMessage, apikeys, host, getMessage, parseResult, getJson, addHitCommand, convertToBuffer, getRandom, zipFolder, invalidUrlMessage, regex }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      let flag = null;
      if (query.endsWith('--nowm')) {
        flag = 'video_nowatermark';
      } else if (query.endsWith('--wm')) {
        flag = 'video_watermark';
      } else {
        flag = 'video_watermark';
      }
      const data = await getJson(`${host}/api/download/tiktok?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Tiktok Downloader');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Tiktok Media Downloader', result);
      addHitCommand('Tiktok Downloader', true);
      if (data.result?.result_url) {
        await replyMessage('*_Success convert to file zip..._*', 'success');
        const pathFolder = path.join(process.cwd(), `tiktok_result_${Date.now()}`);
        const pathZip = path.join(process.cwd(), 'temp', 'tiktok_result_images.zip');

        if (!fs.existsSync(pathFolder)) fs.mkdirSync(pathFolder);
        if (!fs.existsSync(path.join(pathFolder, 'photos'))) fs.mkdirSync(path.join(pathFolder, 'photos'));
        if (!fs.existsSync(path.join(pathFolder, 'music'))) fs.mkdirSync(path.join(pathFolder, 'music'));

        const musicBuffer = await fetch(data.result.music_url).then(async (response) => convertToBuffer(await response.arrayBuffer()));
        await fs.promises.writeFile(path.join(pathFolder, 'music', `${data.result.music_info.title}.mp3`), musicBuffer);
        for await (let { display_image } of data.result.result_url) {
          const buffer = await fetch(display_image.url_list[1]).then(response => response.arrayBuffer());
          const result = convertToBuffer(buffer);
          await fs.promises.writeFile(path.join(pathFolder, 'photos', getRandom('.jpeg')), result);
        }
        zipFolder(pathFolder, pathZip, async function (error, message) {
          if (error) {
            console.error(error);
            return errorMessage(m.chat, null, 'Tiktok Downloader');
          }
          const responseResult = await fs.promises.readFile(pathZip);
          const type = await fileTypeFromBuffer(responseResult);
          execSync(`rm -r "${pathFolder}"`);
          if (fs.existsSync(pathZip)) await fs.promises.unlink(pathZip);
          return xcoders.sendMessage(m.chat, { document: responseResult, caption: message, jpegThumbnail: global.icon, mimetype: type.mime, fileName: getRandom(type.ext), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        });
      } else {
        return xcoders.sendFileFromUrl(m.chat, data.result[flag], caption, x);
      }
    } catch (error) {
      return errorMessage(m.chat, error, 'Tiktok Downloader');
    }
  }
};