'use strict';

import _ from 'lodash';

export default {
  views: ['pinterest'], // view for message in  menu
  command: /^(pin(|dl|down)|pinterest)$/i, //another command.
  description: 'Download video from Pinterest Url',
  query: true,
  url: true,
  usage: '%cmd% url Pinterest',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, response, apikeys, regex, host }, { getMessage, parseResult, getJson }, { addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/pinterest?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Pinterest');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Pinterest Video Downloader', result);
      addHitCommand('Pinterest', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x, { thumbnail: null });
    } catch (error) {
      addHitCommand('Pinterest', false);
      throw error;
    }
  }
};