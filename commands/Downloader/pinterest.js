'use strict';

export default {
  views: ['pinterest < url >'], // view for message in  menu
  command: /^(pin(|dl|down)|pinterest)$/i, //another command.
  description: 'Download video from Pinterest Url',
  query: true,
  url: true,
  usage: '%cmd% url Pinterest',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/pinterest?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Pinterest Downloader');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Pinterest Video Downloader', result);
      addHitCommand('Pinterest Downloader', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x, { thumbnail: null });
    } catch (error) {
      return errorMessage(m.chat, error, 'Pinterest Downloader');
    }
  }
};