'use strict';

import _ from 'lodash';

export default {
  views: ['instastory'], // view for message in  menu
  command: /^(instastory|storydl|igstory|igs)$/i, //another command.
  description: 'Download media story from Instagram Url',
  query: true,
  usage: '%cmd% url/username story Instagram',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, getJson, addHitCommand }) => {
    try {
      const serialize = regex.isUrl(query) ? { query: 'url', path: 'ig-stories' } : { query: 'username', path: 'ig-story' };
      const data = await getJson(`${host}/api/download/${serialize.path}?${serialize.query}=${query}&apikey=${apikeys}`);
      if (!data.status || data.result.data.length < 1) return errorMessage(m.chat, getMessage(data), 'Instagram Story');
      await waitingMessage(m.chat);
      const caption = styleMessage('Instagram Story Downloader', `• ID: ${data.result.id}\n• Username: ${data.result.username}\n• Fullname: ${data.result.fullname}`);
      addHitCommand('Instagram Story', true);
      for (let { url } of data.result.data) {
        if (!url) return errorMessage(m.chat, getMessage(data));
        await xcoders.sendFileFromUrl(m.chat, url, caption, x);
      }
    } catch (error) {
      addHitCommand('Instagram Story', false);
      throw error;
    }
  }
};