'use strict';

export default {
  views: ['caution < text >'], // view for message in  menu
  command: /^caution$/i, //another command.
  description: 'Create Caution Warning images',
  usage: '%cmd% xcoders',
  query: true,
  execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getBuffer, addHitCommand }) => {
    try {
      const data = await getBuffer(`${host}/api/maker/caution?text=${query}&apikey=${apikeys}`);
      await waitingMessage(m.chat);
      addHitCommand('Caution Maker', true);
      return xcoders.sendMessage(m.chat, { image: data, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Caution Maker');
    }
  }
};