'use strict';

export default {
  views: ['tafsir < query >'], // view for message in  menu
  command: /^tafsir/i, //another command.
  description: 'Get Tafsir information',
  query: true,
  text: true,
  usage: '%cmd% dunia',
  execute: async ({ xcoders, x, m, query, capitalize, canvas, styleMessage, errorMessage, waitingMessage, apikeys, host, getMessage, getJson, addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/religion/tafsir-quran?query=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), "Tafsir Al'Qur-an");
      if (data.result.length === 0) return errorMessage(m.chat, 'result not found...', "Tafsir Al'Qur-an");
      await waitingMessage(m.chat);
      const result = data.result.map(object => {
        let results = '';
        const keys = Object.keys(object);
        for (let key of keys) {
          results += `• ${capitalize(key)}: ${object[key]}\n`;
        }
        return results;
      }).join('\n\n');
      const caption = styleMessage(null, result);
      const images = await canvas.create(`Tafsir Al'Qur-an ${query}`);
      addHitCommand("Tafsir Al'Qur-an", true);
      return xcoders.sendMessage(m.chat, { image: images, caption: caption.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, "Tafsir Al'Qur-an");
    }
  }
};