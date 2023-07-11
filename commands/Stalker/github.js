'use strict';

export default {
  views: ['ghstalk < username >'], // view for message in  menu
  command: /^stalkgh|ghstalk$/i, //another command.
  description: 'Stalking User Github',
  query: true,
  usage: '%cmd% Fxc7',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/stalk/github?username=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Github Stalk');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Github User Stalking', result);
      addHitCommand('Github Stalk', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.profile_url, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Github Stalk');
    }
  }
};