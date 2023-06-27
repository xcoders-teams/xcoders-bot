'use strict';

export default {
  views: ['kusonime < query >'], // view for message in  menu
  command: /^kusonime/i, //another command.
  description: 'Get Result Search From kusonime Website',
  query: true,
  text: true,
  usage: '%cmd% naruto',
  execute: async ({ xcoders, x, m, query, canvas, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/anime/kusonime?query=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Kusonime Search');
      if (data.result.length === 0) return errorMessage(m.chat, 'result not found...', 'Kusonime Search');
      await waitingMessage(m.chat);
      const result = data.result.map(object => {
        let results = '';
        const keys = Object.keys(object);
        for (let key of keys) {
          results += `• ${key}: ${object[key]}\n`;
        }
        return results;
      }).join('\n\n');
      const caption = styleMessage(null, result);
      const images = await canvas.create(`Kusonime Search ${query}`);
      addHitCommand('Kusonime Search', true);
      return xcoders.sendMessage(m.chat, { image: images, caption: caption.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Kusonime Search');
    }
  }
};