'use strict';

export default {
  views: ['twitstalk < username >'], // view for message in  menu
  command: /^stalktwit|twitstalk$/i, //another command.
  description: 'Stalking User Twitter',
  query: true,
  usage: '%cmd% evrlastinx',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/stalk/twitter?username=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Twitter Stalk');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Twitter User Stalking', result);
      addHitCommand('Twitter Stalk', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.profile_url, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Twitter Stalk');
    }
  }
};