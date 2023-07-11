'use strict';

export default {
  views: ['kannagen < text >', 'skannagen < text >'], // view for message in  menu
  command: /^s?kann?agen$/i, //another command.
  description: 'Create Kannagen quotes images',
  usage: '%cmd% xcoders',
  query: true,
  text: true,
  execute: async ({ xcoders, command, m, x, apikeys, query, waitingMessage, errorMessage, host, getBuffer, createSticker, addHitCommand }) => {
    try {
      const data = await getBuffer(`${host}/api/maker/kannagen?text=${query}&apikey=${apikeys}`);
      const response = command.startsWith('s') ? await createSticker(data, {}) : data;
      const content = command.startsWith('s') ? 'sticker' : 'image';
      await waitingMessage(m.chat);
      addHitCommand('Kannagen Maker', true);
      return xcoders.sendMessage(m.chat, { [content]: response, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error, 'Kannagen Maker');
    }
  }
};