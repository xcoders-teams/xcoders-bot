'use strict';

export default {
  views: ['tiktok < url > --flag'], // view for message in  menu
  command: /^(ttdl|tiktok|tt)$/i, //another command.
  description: 'Download media from Tiktok Url',
  query: true,
  url: true,
  usage: '%cmd% url tiktok --wm or --nowm\nFlag --wm untuk video dengan watermark.\nFlag --nowm untuk video tanpa watermark.',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, replyMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
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
        for (let { display_image } of data.result.result_url) {
          await xcoders.sendFileFromUrl(m.chat, display_image.url_list[1], caption, x);
        }
      } else {
        return xcoders.sendFileFromUrl(m.chat, data.result[flag], caption, x);
      }
    } catch (error) {
      return errorMessage(m.chat, error, 'Tiktok Downloader');
    }
  }
};