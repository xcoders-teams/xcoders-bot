'use strict';

export default {
    views: ['chat < text >'], // view for message in  menu
    command: /^s?chat$/i, //another command.
    description: 'Create chat Bubble images',
    usage: '%cmd% xcoders',
    query: true,
    execute: async ({ xcoders, m, x, apikeys, query, waitingMessage, errorMessage, host, getBuffer, createSticker, quoted, addHitCommand }) => {
        try {
            const number = quoted.sender.split('@')[0];
            const data = await getBuffer(`${host}/api/maker/chat-bubble?text=${query}&nickname=${quoted.pushName || 'unknown'}&number=${number}&apikey=${apikeys}`);
            const result = await createSticker(data, {});
            await waitingMessage(m.chat);
            addHitCommand('Chat Bubble Maker', true);
            return xcoders.sendMessage(m.chat, { sticker: result, caption: response.success, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
        } catch (error) {
            return errorMessage(m.chat, error, 'Chat Bubble Maker');
        }
    }
};