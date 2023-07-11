'use strict';

export default {
  views: ['instastory < url : username >'], // view for message in  menu
  command: /^(instastory|storydl|igstory|igs)$/i, //another command.
  description: 'Download media story from Instagram Url',
  query: true,
  usage: '%cmd% url/username story Instagram',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, getJson, addHitCommand }) => {
    try {
      const serialize = regex.url(query) ? { query: 'url', path: 'ig-stories' } : { query: 'username', path: 'ig-story' };
      const data = await getJson(`${host}/api/download/${serialize.path}?${serialize.query}=${query}&apikey=${apikeys}`);
      if (!data.status || data.result.data.length < 1) return errorMessage(m.chat, getMessage(data), 'Instagram Story');
      await waitingMessage(m.chat);
      const caption = styleMessage('Instagram Story Downloader', `• ID: ${data.result.id}\n• Username: ${data.result.username}\n• Fullname: ${data.result.fullname}`);
      addHitCommand('Instagram Story', true);
      if (data.result.result_length === 1) {
        return xcoders.sendFileFromUrl(m.chat, data.result.data[0].url, caption, x);
      } else {
        for (var i = 0; i < data.result.data.length; i++) {
          await xcoders.sendFileFromUrl(m.chat, data.result.data[i].url, caption, x);
        }
        return;
      }
    } catch (error) {
      return errorMessage(m.chat, error, 'Instagram Story');
    }
  }
};