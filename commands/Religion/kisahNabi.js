'use strict';

export default {
  views: ['kisahnabi < query >'], // view for message in  menu
  command: /^kisahnabi/i, //another command.
  description: 'Get Information Story nabi',
  query: true,
  text: true,
  usage: '%cmd% muhammad',
  execute: async ({ xcoders, x, m, query, capitalize, canvas, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/religion/kisah-nabi?nabi=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Kisah Nabi');
      await waitingMessage(m.chat);
      const keys = Object.keys(data.result);
      const result = keys.map((key) => {
        return `• ${capitalize(key)}: ${data.result[key]}\n`;
      }).join('');
      const caption = styleMessage(null, result);
      const images = await canvas.create(`Kisah Nabi ${query}`);
      addHitCommand('Kisah Nabi', true);
      return xcoders.sendMessage(m.chat, { image: images, caption: caption.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Kisah Nabi');
    }
  }
};