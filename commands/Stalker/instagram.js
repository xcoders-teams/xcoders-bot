'use strict';

export default {
  views: ['igstalk < username >'], // view for message in  menu
  command: /^stalkig|igstalk$/i, //another command.
  description: 'Stalking User Instagram',
  query: true,
  usage: '%cmd% farhanxcode7',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, parseResult, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/stalk/ig?username=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Instagram Stalk');
      await waitingMessage(m.chat);
      const result = parseResult(data.result);
      const caption = styleMessage('Instagram User Stalking', result);
      addHitCommand('Instagram Stalk', true);
      return xcoders.sendFileFromUrl(m.chat, data.result.profile_url, caption, x);
    } catch (error) {
      return errorMessage(m.chat, error, 'Instagram Stalk');
    }
  }
};