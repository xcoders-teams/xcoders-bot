'use strict';

import _ from 'lodash';

export default {
  views: ['fbdl'], // view for message in  menu
  command: /^(fb(|dl|down)|facebook)$/i, //another command.
  description: 'Download video from Facebook Url',
  query: true,
  url: true,
  usage: '%cmd% url facebook',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host }, { getMessage, parseResult, getJson }, { addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/fb2?url=${query}&server=server2&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Facebook');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Facebook Video Downloader', result);
      addHitCommand('Facebook', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.data[0].url, caption, x, { thumbnail: null });
    } catch (error) {
      addHitCommand('Facebook', false);
      throw error;
    }
  }
};