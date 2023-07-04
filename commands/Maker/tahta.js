'use strict';

export default {
  views: ['tahta < text >'], // view for message in  menu
  command: /^tahta$/i, //another command.
  description: 'Create Tahta quotes images',
  usage: '%cmd% xcoders',
  query: true,
  text: true,
  execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/maker/tahta?text=${query}&result_type=json&apikey=${apikeys}`);
      const result = Buffer.from(data);
      await waitingMessage(m.chat);
      addHitCommand('Tahta Maker', true);
      return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Tahta Maker');
    }
  }
};