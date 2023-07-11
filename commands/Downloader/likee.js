'use strict';

export default {
  views: ['likee < url >'], // view for message in  menu
  command: /^(likee(|dl|down))$/i, //another command.
  description: 'Download video from Likee Url',
  query: true,
  url: true,
  usage: '%cmd% url likee',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/likee?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Likee');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Likee Video Downloader', result);
      addHitCommand('Likee', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.nowatermark, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Likee');
    }
  }
};