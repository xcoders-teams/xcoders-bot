'use strict';

import _ from 'lodash';

export default {
  views: ['igdl'], // view for message in  menu
  command: /^(instadl|igdl|ig)$/i, //another command.
  description: 'Download media from Instagram Url',
  query: true,
  url: true,
  usage: '%cmd% url Instagram',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/ig?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Instagram Media');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Instagram Media Downloader', result);
      addHitCommand('Instagram Media', true);
      for (let { url } of data.result.data) {
        await xcoders.sendFileFromUrl(m.chat, url, caption, x);
      }
    } catch (error) {
      addHitCommand('Instagram Media', false);
      throw error;
    }
  }
};