'use strict';

export default {
  views: ['xvideosdl'], // view for message in  menu
  command: /^xvideos(|dl)$/i, //another command.
  description: 'Download video from Xvideos Url',
  query: true,
  url: true,
  usage: '%cmd% url xvideos',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/xvideos?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Xvideos Download');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Xvideos Video Downloader', result);
      addHitCommand('Xvideos Download', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x, { thumbnail: null });
    } catch (error) {
      addHitCommand('Xvideos Download', false);
      throw error;
    }
  }
};