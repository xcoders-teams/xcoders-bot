'use strict';

export default {
  views: ['ssmaps < text >'], // view for message in  menu
  command: /^ssmaps?$/i, //another command.
  description: 'Screenshots Maps Wilayah',
  usage: '%cmd% banyuwangi',
  query: true,
  execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getBuffer, addHitCommand }) => {
    try {
      const data = await getBuffer(`${host}/api/maker/ssmaps?query=${query}&apikey=${apikeys}`);
      if (data.status) return errorMessage(m.chat, null, 'Screenshot Maps');
      await waitingMessage(m.chat);
      addHitCommand('Screenshot Maps', true);
      return xcoders.sendMessage(m.chat, { image: data, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Screenshot Maps');
    }
  }
};