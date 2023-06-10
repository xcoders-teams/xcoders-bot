'use strict';

import _ from 'lodash';

export default {
  views: ['igstalk'], // view for message in  menu
  command: /^stalkig|igstalk$/i, //another command.
  description: 'Stalking User Instagram',
  query: true,
  usage: '%cmd% farhanxcode7',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, response, apikeys, host }, { getMessage, parseResult, getJson }, { addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/stalk/ig?username=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Instagram Stalk');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Instagram User Stalking', result);
      addHitCommand('Instagram Stalk', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.profile_url, caption, x, { thumbnail: null });
    } catch (error) {
      addHitCommand('Instagram Stalk', false);
      throw error;
    }
  }
};