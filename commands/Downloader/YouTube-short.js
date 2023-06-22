'use strict'

export default {
  views: ['ytshort < url >'], // view for message in  menu
  command: /^ytshort$/i, //another command.
  description: 'Download video from YouTube Url',
  query: true,
  url: true,
  usage: '%cmd% url youtube short',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/yt-short?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'YouTube Short');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('YouTube Short Video Downloader', result);
      addHitCommand('YouTube Short', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x, { mimetype: 'video/mp4' });
    } catch (error) {
      return errorMessage(m.chat, error, 'YouTube Short');
    }
  }
};