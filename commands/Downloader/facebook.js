'use strict';

export default {
  views: ['fbdl < url >'], // view for message in  menu
  command: /^(fb(|dl|down)|facebook)$/i, //another command.
  description: 'Download video from Facebook Url',
  query: true,
  url: true,
  usage: '%cmd% url facebook',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/fb2?url=${query}&server=server2&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Facebook Downloader');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Facebook Video Downloader', result);
      addHitCommand('Facebook Downloader', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.data[0].url, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Facebook Downloader');
    }
  }
};