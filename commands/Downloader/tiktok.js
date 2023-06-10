'use strict';

import _ from 'lodash';

export default {
  views: ['tiktok'], // view for message in  menu
  command: /^(ttdl|tiktok|tt)$/i, //another command.
  description: 'Download media from Tiktok Url',
  query: true,
  url: true,
  usage: '%cmd% url tiktok',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, response, apikeys, regex, host }, { getMessage, parseResult, getJson }, { addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/tiktok?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Tiktok');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Tiktok Media Downloader', result);
      addHitCommand('Tiktok', true);
      if (data.result.result_url) {
        for (let { display_image } of data.result.result_url) {
          await xcoders.sendFileFromUrl(m.chat, display_image.url_list[1], caption, x);
        }
      } else {
        return xcoders.sendFileFromUrl(m.chat, data.result.video_nowatermark, caption, x);
      }
    } catch (error) {
      addHitCommand('Tiktok', false);
      throw error;
    }
  }
};