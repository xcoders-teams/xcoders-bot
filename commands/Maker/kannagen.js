'use strict';

export default {
  views: ['kannagen < text >'], // view for message in  menu
  command: /^kann?agen$/i, //another command.
  description: 'Create Kannagen quotes images',
  usage: '%cmd% xcoders',
  query: true,
  text: true,
  execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/maker/kannagen?text=${query}&result_type=json&apikey=${apikeys}`);
      if (data.status) return errorMessage(m.chat, null, 'Kannagen Maker');
      const result = Buffer.from(data, 'buffer');
      await waitingMessage(m.chat);
      addHitCommand('Kannagen Maker', true);
      return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Kannagen Maker');
    }
  }
};