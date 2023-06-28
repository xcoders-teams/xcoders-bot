'use strict';

export default {
  views: ['soundcloud < url >'], // view for message in  menu
  command: /^(sc(dl|down)|soundcloud)$/i, //another command.
  description: 'Download music from SoundCloud Url',
  query: true,
  url: true,
  usage: '%cmd% url soundcloud',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, canvas, apikeys, regex, host, getMessage, parseResult, getJson, getBuffer, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/soundcloud?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Sound Cloud');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('SoundCloud Music Downloader', result);
      const thumbnail = await canvas.create('Sound Cloud Downloader');
      const buffer = await getBuffer(data.result.thumbnail);
      await xcoders.sendMessage(m.chat, { image: thumbnail, caption, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
      addHitCommand('Sound Cloud', true);
      return xcoders.sendAudioFromUrl(m.chat, data.result.url, x, { title: data.result.title, fileName: `${data.result.title}.mp3`, thumbnail: buffer, source: query });
    } catch (error) {
      return errorMessage(m.chat, error, 'Sound Cloud');
    }
  }
};