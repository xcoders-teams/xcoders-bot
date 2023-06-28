'use strict';

export default {
  views: ['ytmp3 < url >'], // view for message in  menu
  command: /^yt(mp3|music|musik|audio)$/i, //another command.
  description: 'Download music from YouTube Url',
  query: true,
  url: true,
  usage: '%cmd% url youtube',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, canvas, apikeys, regex, host, getMessage, parseResult, getJson, getBuffer, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/y2mate-audio?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'YouTube Music');
      await waitingMessage(m.chat);
      const parseCaption = parseResult(data.result);
      const caption = styleMessage('YouTube Music Downloader', parseCaption);
      const canvasThumbnail = await canvas.create('YouTube Audio Downloder');
      const thumbnail = await getBuffer(data.result.thumbnail);
      await xcoders.sendMessage(m.chat, { image: canvasThumbnail, caption, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
      addHitCommand('YouTube Music', true);
      return xcoders.sendAudioFromUrl(m.chat, data.result.url, x, { fileName: data.result.title + '.mp3', title: data.result.title, thumbnail, source: query, ffmpeg: false });
    } catch (error) {
      return errorMessage(m.chat, error, 'YouTube Music');
    }
  }
};