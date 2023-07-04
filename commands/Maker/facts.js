'use strict';

export default {
  views: ['facts < text >'], // view for message in  menu
  command: /^fat?cts$/i, //another command.
  description: 'Create Fun Facts images',
  usage: '%cmd% xcoders',
  query: true,
  text: true,
  execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/maker/facts?text=${query}&result_type=json&apikey=${apikeys}`);
      if (data.status) return errorMessage(m.chat, null, 'Facts Maker');
      const result = Buffer.from(data);
      await waitingMessage(m.chat);
      addHitCommand('Facts Maker', true);
      return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Facts Maker');
    }
  }
};