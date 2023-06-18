'use strict';

export default {
  views: ['twitter'], // view for message in  menu
  command: /^(twit(dl|down)|twitter)$/i, //another command.
  description: 'Download media from Twitter Url',
  query: true,
  url: true,
  usage: '%cmd% url Twitter',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/twitter?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Twitter');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Twitter Media Downloader', result);
      addHitCommand('Twitter', true);
      for (let { url } of data.result.data) {
        await xcoders.sendFileFromUrl(m.chat, url, caption, x);
      }
    } catch (error) {
      addHitCommand('Twitter', false);
      throw error;
    }
  }
};