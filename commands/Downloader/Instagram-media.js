'use strict';

export default {
  views: ['igdl <url>'],
  command: /^(instadl|igdl|ig)$/i,
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
      if (data.result.result_length === 1) {
        return xcoders.sendFileFromUrl(m.chat, data.result.data[0].url, caption, x);
      } else {
        for (var i = 0; i < data.result.result_length; i++) {
          await xcoders.sendFileFromUrl(m.chat, data.result.data[i].url, caption, x);
        }
        return;
      }
    } catch (error) {
      return errorMessage(m.chat, error, 'Instagram Media');
    }
  }
};
