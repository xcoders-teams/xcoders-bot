'use strict';

import _ from 'lodash';

export default {
  views: ['fbdl < url >'], // view for message in  menu
  command: /^(cocofun(|dl|down))$/i, //another command.
  description: 'Download video from Cocofun Url',
  query: true,
  url: true,
  usage: '%cmd% url cocofun',
  execute: async ({ xcoders, x, m, query, styleMessage, invalidUrlMessage, errorMessage, waitingMessage, apikeys, regex, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      if (!regex.media(query)) return invalidUrlMessage(m.chat);
      const data = await getJson(`${host}/api/download/cocofun?url=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Cocofun');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Cocofun Video Downloader', result);
      addHitCommand('Cocofun', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Cocofun');
    }
  }
};