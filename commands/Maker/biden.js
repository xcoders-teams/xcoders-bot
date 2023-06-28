'use strict';

export default {
  views: ['biden < text >'], // view for message in  menu
  command: /^biden$/i, //another command.
  description: 'Create Biden Tweet images',
  usage: '%cmd% xcoders',
  query: true,
  execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/maker/biden?text=${query}&result_type=json&apikey=${apikeys}`);
      if (data.status) return errorMessage(m.chat, null, 'Biden Maker');
      const result = Buffer.from(data, 'buffer');
      await waitingMessage(m.chat);
      addHitCommand('Biden Maker', true);
      return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Biden Maker');
    }
  }
};