'use strict';

import _ from 'lodash';

export default {
  views: ['ttstalk < username >'], // view for message in  menu
  command: /^stalktt|ttstalk$/i, //anothm.chater command.
  description: 'Stalking User TikTok',
  query: true,
  usage: '%cmd% fxc7_',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/stalk/tiktok?username=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Tiktok Stalk');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Tiktok User Stalking', result);
      addHitCommand('Tiktok Stalk', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.url, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Tiktok Stalk');
    }
  }
};