'use strict';

export default {
  views: ['ytmp4 < url >'], // view for message in  menu
  command: /^yt(mp4|video|vidio)$/i, //another command.
  description: 'Download video from YouTube Url',
  query: true,
  url: true,
  usage: '%cmd% url youtube',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/y2mate-video?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'YouTube Video');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('YouTube Video Downloader', result);
      addHitCommand('YouTube Video', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x, { mimetype: 'video/mp4' });
    } catch (error) {
      return errorMessage(m.chat, error, 'YouTube Video');
    }
  }
};