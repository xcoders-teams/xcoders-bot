'use strict';

export default {
  views: ['drake < text|text >'], // view for message in  menu
  command: /^drake$/i, //another command.
  description: 'Create Drake meme images',
  usage: '%cmd% adiwajshing|lord mano',
  query: true,
  text: true,
  execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getJson, addHitCommand }) => {
    try {
      const [text1, text2] = query.split('|');
      const data = await getJson(`${host}/api/maker/drake?text=${text1}&text2=${text2}&result_type=json&apikey=${apikeys}`);
      if (data.status) return errorMessage(m.chat, null, 'Drake Maker');
      const result = Buffer.from(data);
      await waitingMessage(m.chat);
      addHitCommand('Drake Maker', true);
      return xcoders.sendMessage(m.chat, { image: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Drake Maker');
    }
  }
};